import * as Color from 'color';
import * as turf from '@turf/turf';
import * as moment from 'moment-timezone';
import * as naturalSort from 'natural-sort';
import * as naturalSortByKey from 'natural-sort-by-key';

import { AppSettings } from './app.settings';

export class AppUtils {
  private static URL_REGEX = /(?:https?|ftp):\/\/[\n\S]+/g;

  public static objectToMap(object: object) {
    return Object.keys(object).reduce((m, k) => m.set(k, object[k]), new Map());
  }

  public static alphabetically(key: string) {
    return (varA, varB) => {
      if (varA[key] < varB[key]) {
        return -1;
      }
      if (varA[key] > varB[key]) {
        return 1;
      }

      return 0;
    }
  }

  public static ascending(key: string) {
    return (varA, varB) => {
      return varA[key] - varB[key];
    }
  }

  public static decodePolyline(str, precision) {
    var index = 0,
      lat = 0,
      lng = 0,
      coordinates = [],
      shift = 0,
      result = 0,
      byte = null,
      latitude_change,
      longitude_change,
      factor = Math.pow(10, precision || 7);

    while (index < str.length) {

      byte = null;
      shift = 0;
      result = 0;
      do {
        byte = str.charCodeAt(index) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
        index++;
      } while (byte >= 0x20);

      latitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

      shift = result = 0;

      do {
        byte = str.charCodeAt(index) - 63;
        result |= (byte & 0x1f) << shift;
        shift += 5;
        index++;
      } while (byte >= 0x20);

      longitude_change = ((result & 1) ? ~(result >> 1) : (result >> 1));

      lat += latitude_change;
      lng += longitude_change;

      coordinates.push([lng / factor, lat / factor]);
    }

    return coordinates;
  }

  public static getHtmlTag(html, tag) {
    const domParser = new DOMParser();
    const doc = domParser.parseFromString(
      html,
      'text/html'
    );
    return doc.body.querySelector(tag);
  }

  public static getParentIdSafe(location) {
    if (location.parent_id) {
      return location.parent_id;
    }

    if (typeof location.parent === 'string') {
      location.parent = JSON.parse(location.parent);
    }

    if (location.parent && location.parent.id) {
      return location.parent.id;
    }

    return null;
  }

  public static getContext() {
    return (
      AppSettings.IS_STAGING ?
        'staging' :
        'live'
    );
  }

  public static hasCategory(location, categories) {
    if (
      !Array.isArray(location.categories) ||
      !Array.isArray(categories)
    ) {
      return false;
    }

    return location.categories.filter(category =>
      categories.includes(category.id) ||
      categories.includes(category._id) // TODO: Reassess whether additional condition is needed
    ).length > 0;
  }

  public static hasContent(location) {
    return (
      location.content_type &&
      location.content_type !== 0 &&
      location.content_type !== 'nothing'
    );
  }

  public static naturally(key?: string) {
    if (key) {
      return naturalSortByKey(key);
    }
    
    return naturalSort();
  }

  public static getLocationPoint(location) {
    const turfPolygon = turf.polygon(location.polygon[0]);
    const centerOfMass = (<any>turf).centerOfMass(turfPolygon);
    return centerOfMass.geometry.coordinates;
  }

  public static metersToPixelsAtMaxZoom(meters, latitude) {
    return meters / 0.075 / Math.cos(latitude * Math.PI / 180)
  }

  public static removeUrls(string) {
    return string.replace(this.URL_REGEX, '').trim();
  }

  public static darken(color, darkenBy) {
    const darkColor = Color(color).blacken(darkenBy);
    if (color.includes('hsl')) {
      return darkColor.hsl().string();
    }
    else {
      return darkColor.rgb().string();
    }
  }

  public static increaseBrightness(color, increaseBy) {
    const darkColor = Color(color).lighten(increaseBy);
    if (color.includes('hsl')) {
      return darkColor.hsl().string();
    }
    else {
      return darkColor.rgb().string();
    }
  }

  public static reduceBrightness(color, reduceBy) {
    const darkColor = Color(color).darken(reduceBy);
    if (color.includes('hsl')) {
      return darkColor.hsl().string();
    }
    else {
      return darkColor.rgb().string();
    }
  }

  public static toDataURL(url): Promise<string> {
    return (
      fetch(url)
        .then(response => response.blob())
        .then(blob => new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onloadend = () => resolve(<string>reader.result)
          reader.onerror = reject
          reader.readAsDataURL(blob)
        }))
    );
  }

  public static toGeoJson(annotation) {
    return {
      'type': 'Feature',
      'properties': annotation,
      'geometry': {
        'type': 'Point',
        'coordinates': annotation.point
      }
    };
  };

  public static toTitleCase(string) {
    var smallWords = /^(a|an|and|as|at|but|by|en|for|if|in|nor|of|on|or|per|the|to|vs?\.?|via)$/i;

    return string.replace(/[A-Za-z0-9\u00C0-\u00FF]+[^\s-]*/g, function(match, index, title){
      if (index > 0 && index + match.length !== title.length &&
        match.search(smallWords) > -1 && title.charAt(index - 2) !== ":" &&
        (title.charAt(index + match.length) !== '-' || title.charAt(index - 1) === '-') &&
        title.charAt(index - 1).search(/[^\s-]/) < 0) {
        return match.toLowerCase();
      }

      if (match.substr(1).search(/[A-Z]|\../) > -1) {
        return match;
      }

      return match.charAt(0).toUpperCase() + match.substr(1);
    });
  }

  public static parseNotification(notification) {
    if (!notification.id && notification._id) {
      notification.id = notification._id;
    }

    if (!notification.title && notification.name) {
      notification.title = notification.name;
    }

    if (!notification.icon) {
      notification.icon = AppSettings.NOTIFICATION_DEFAULT_ICON;
    }

    if (!notification.primaryColor) {
      notification.primaryColor = AppSettings.NOTIFICATION_DEFAULT_COLOR;
    }

    if (notification.date) {
      notification.date = moment.utc(notification.date).tz(AppSettings.TIMEZONE).format();
    }

    if (notification.expiryDate) {
      notification.expiryDate = moment.utc(notification.expiryDate).tz(AppSettings.TIMEZONE).format();
    }

    return notification;
  }

  public static formatPhoneNumber(phoneNumber) {
    return phoneNumber.replace(/\s+/g, '').replace(/(.)(\d{4})(\d)/, '$1$2 $3');
  }
}
