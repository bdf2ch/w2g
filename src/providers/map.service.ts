import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";

import { AppUtils } from '../app/app.utils';

import * as mapboxgl from 'mapbox-gl';

@Injectable()
export class MapService {
  public projectId: BehaviorSubject<number>;
  public campusId: BehaviorSubject<number>;
  public ready: BehaviorSubject<boolean>;
  public loading: BehaviorSubject<boolean>;
  public update: BehaviorSubject<number>;
  public center: BehaviorSubject<mapboxgl.LngLat>;
  public bounds: BehaviorSubject<mapboxgl.LngLatBounds>;
  public categories: BehaviorSubject<any[]>;
  public markers: BehaviorSubject<any[]>;
  public annotations: BehaviorSubject<any[]>;
  public location: BehaviorSubject<any>;
  public floor: BehaviorSubject<any>;
  public directions: BehaviorSubject<any>;
  public directionsLegIndex: BehaviorSubject<number>;
  public directionsInfo: BehaviorSubject<string>;
  public directionsDestination: BehaviorSubject<string>;
  public directionsTime: BehaviorSubject<number>;
  public tour: BehaviorSubject<any>;
  public tourPoint: BehaviorSubject<any>;
  public rawTours: BehaviorSubject<any[]>;
  public disabled_tf: BehaviorSubject<boolean>;
  public journey: BehaviorSubject<any>;
  public journeyDestination: BehaviorSubject<any>;
  public spinnerColor: BehaviorSubject<string>;
  public removeDirections: BehaviorSubject<boolean>;
  public removePopup: BehaviorSubject<boolean>;
  public removeMoreInfo: BehaviorSubject<boolean>;
  public getpopupinfo: BehaviorSubject<any>;
  public fitboundservice: BehaviorSubject<any>;

  constructor() {
    this.disabled_tf = new BehaviorSubject<boolean>(false);
    this.init();
  }

  reset() {
    this.disabled_tf.next(false);
    this.init();
  }

  resetDirectionsTime() {
    this.directionsTime = new BehaviorSubject<number>(null);
  }

  init() {
    this.projectId = new BehaviorSubject<number>(null);
    this.campusId = new BehaviorSubject<number>(null);
    this.ready = new BehaviorSubject<boolean>(false);
    this.loading = new BehaviorSubject<boolean>(false);
    this.update = new BehaviorSubject<number>(-1);
    this.center = new BehaviorSubject<mapboxgl.LngLat>(null);
    this.bounds = new BehaviorSubject<mapboxgl.LngLatBounds>(null);
    this.categories = new BehaviorSubject<any[]>([]);
    this.markers = new BehaviorSubject<any[]>([]);
    this.annotations = new BehaviorSubject<any[]>([]);
    this.location = new BehaviorSubject<any>(null);
    this.floor = new BehaviorSubject<any>(null);
    this.directions = new BehaviorSubject<any>(null);
    this.directionsLegIndex = new BehaviorSubject<number>(null);
    this.directionsInfo = new BehaviorSubject<string>(null);
    this.directionsDestination = new BehaviorSubject<string>(null);
    this.directionsTime = new BehaviorSubject<number>(null);
    this.tour = new BehaviorSubject<any>(null);
    this.tourPoint = new BehaviorSubject<any>(null);
    this.rawTours = new BehaviorSubject<any[]>([]);
    this.journey = new BehaviorSubject<any>(null);
    this.journeyDestination = new BehaviorSubject<any>(null);
    this.spinnerColor = new BehaviorSubject<string>(null);

    this.removeDirections = new BehaviorSubject<boolean>(false);
    this.removePopup = new BehaviorSubject<boolean>(false);
    this.removeMoreInfo = new BehaviorSubject<boolean>(false);
    this.getpopupinfo = new BehaviorSubject<any>(null);
    this.fitboundservice = new BehaviorSubject<any>(null);
  }

  darkenStyle(style, darkenBy) {
    if (!darkenBy) {
      console.error('Parameter "darkenBy" is required');
      return null;
    }

    try {
      const layers = style.layers;
      for (let i = 0; i < layers.length; i++) {
        const paint = layers[i].paint;

        for (let key in paint) {
          if (key.includes('color')) {
            if (paint[key].stops) {
              const stops = paint[key].stops;
              for (let j = 0; j < stops.length; j++) {
                paint[key].stops[j][1] = AppUtils.darken(paint[key].stops[j][1], darkenBy);
              }
            }
            else if (paint[key].default) {
              paint[key].default = AppUtils.darken(paint[key].default, darkenBy);
            }
            else if (typeof paint[key] == 'string') {
              paint[key] = AppUtils.darken(paint[key], darkenBy);
            }
          }
        }

        if (paint) {
          layers[i].paint = paint;
        }
      }

      style.layers = layers;
      style.transition = {
        duration: 0,
        delay: 0
      };

      return style;
    }
    catch (ex) {
      console.error(ex.message);
      return null;
    }
  }
}
