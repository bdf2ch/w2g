import * as mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Apollo } from 'apollo-angular';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { AuthService } from './auth.service';
import { MapService } from './map.service';

import {
  categoriesQuery,
  categoryLm2Query,
  categoryQuery,
  locationQuery,
  locationLm2Query,
  locationsQuery,
  searchQuery,
} from '../graphql/graphql.queries';
import { handleErrors } from '../graphql/graphql.service';

import { AppSettings } from '../app/app.settings';
import { AppUtils } from '../app/app.utils';

@Injectable()
export class LocationsService {
  public categories: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor(
    private apollo: Apollo,
    private http: HttpClient,
    private authService: AuthService,
    private mapService: MapService
  ) { }

  autocomplete(term: string, projectId: number, args: Object = {}): Observable<any[]> {
    return this.apollo
      .query({
        query: searchQuery,
        variables: {
          ...args,
          projectId: projectId,
          term: term
        }
      }).map((res: any) => (
        res.data.search.map(result => ({
          ...result,
          type: 'Location'
        }))
      ));
  }

  get(id: string, args: Object = {}): Promise<any> {
    const isLm2Id = AppSettings.UUID_REGEX.test(id);
    const query = (
      isLm2Id ?
        locationLm2Query :
        locationQuery
    );

    const criteria = (
      isLm2Id ?
        {
          lm2_id: id
        } :
        {
          id: id
        }
    );

    return this.apollo
      .query({
        query: query,
        variables: {
          ...args,
          ...criteria
        }
      }).map((res: any) => {
        if (handleErrors(res)) {
          throw new Error(`Unable to request location ${id}`);
        }

        const location = (
          isLm2Id ?
            res.data.locationLm2 :
            res.data.location
        );

        this.getParentFloorInPlace(location);

        if (
          AppUtils.hasCategory(
            location,
            AppSettings.PARENT_MORE_INFO_CATEGORIES
          ) &&
          !!location.parent &&
          AppUtils.hasContent(
            location.parent
          )
        ) {
          Object.keys(location.parent).forEach(key => {
            if (![
              'id',
              'name',
              'lm2_id'
            ].includes(key)) {
              location[key] = location.parent[key];
            }
          });
        }

        return {
          ...location,
          type: 'Location'
        };
      }).toPromise();
  }

  getParentFloorInPlace(location) {
    location.parent = (
      typeof location.parent === 'string' ?
        JSON.parse(location.parent) :
        location.parent
    );
    location.parent_id = (
      location.parent ?
        location.parent.lm2_id :
        null
    );

    location.floor = (
      typeof location.floor === 'string' ?
        JSON.parse(location.floor) :
        location.floor
    );
    location.floor_id = (
      location.floor ?
        location.floor.lm2_id :
        null
    );
  }

  getInRadius(projectId: number, center: mapboxgl.LngLat, radius: number, categoryId?: string[], floorId?: number): Observable<any> {
    let url = `${AppSettings.APP_MANAGER_URL}/api/radius/projects/${projectId}?center=${center.lng},${center.lat}&radius=${radius}&campus_id=${AppSettings.CAMPUS_ID}&limit=300`;
    if (categoryId) {
      url += `&category_id=${categoryId.join(',')}`;
    }
    if (floorId) {
      url += `&floor_id=${floorId}`;
    }
    const categories = this.categories.getValue();

    return this.http.get(url, {
      headers: this.authService.jsonHeaders
    }).map((data: any) => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].categories.length > 0) {
          const category = categories.filter(category => category.id == data[i].categories[0].id)[0];
          if (category && category.icons.web_icon) {
            data[i].icon = category.icons.web_icon.replace('http://lm2:8080', AppSettings.LM2_URL);
          }
        }
      }
      return data;
    });
  }

  getByCategoryId(categoryId: string, args: any = {}): Promise<{
    locations: any[],
    count: number
  }> {
    const categories = this.categories.getValue();
    const category = categories.filter(category => category.id == categoryId)[0];

    return this
      .getLocations(
        this.mapService.projectId.getValue(),
        {
          context: AppUtils.getContext(),
          sort: 'name',
          category_id: categoryId
        }
      )
      .map((resLocations: any[]) => {
        const locations = resLocations.map(
          location => {
            this.getParentFloorInPlace(location);
            return {
              ...location,
              type: 'Location',
              parent_name: (
                location.parent ?
                  location.parent.name :
                  null
              ),
              icon: category.icon
            };
          }
        );

        return {
          locations: locations,
          count: locations.length
        };
      }).toPromise();
  }

  getByCategoryIdLegacy(categoryId: string, projectId: number): Observable<any> {
    const categories = this.categories.getValue();
    const category = categories.filter(category => category.id == categoryId)[0];

    return this.http
      .get(`${AppSettings.APP_MANAGER_URL}/api/broker/directory/locations-${projectId}-${AppSettings.IS_STAGING ? 'staging' : 'live'}?categories.id=${categoryId}`, {
      //.get(`${AppSettings.APP_MANAGER_URL}/api/lm2/projects/${projectId}/locations?category_id=${categoryId}&limit=300`, {
        headers: this.authService.jsonHeaders
      })
      .map((locations: any) => {
        const data = {
          count: locations.length,
          locations: locations
        };
        
        for (let i = 0; i < data.locations.length; i++) {
          if (data.locations[i].polygon && data.locations[i].polygon.length > 0 && data.locations[i].polygon[0].length > 0) {
            const turfPolygon = turf.polygon(data.locations[i].polygon[0]);
            const centerOfMass = turf.centerOfMass(turfPolygon);
            data.locations[i].point = centerOfMass.geometry.coordinates;
          }

          let module;
          if (data.locations[i].categories && data.locations[i].categories.length > 0) {
            module = data.locations[i].categories[0];
          }
          else if (data.locations[i].category) {
            module = data.locations[i].category;
          }

          let annotationIcon;
          if (module) {
            const moduleObj = categories.filter(eachModule => (eachModule.name == module.name && eachModule.id == module.id))[0];
            if (moduleObj && moduleObj.icons.web_icon) {
              annotationIcon = moduleObj.icons.web_icon.replace('http://lm2:8080', AppSettings.LM2_URL);
            }
          }

          if (annotationIcon) {
            data.locations[i].icon = annotationIcon;
          }

          if (category) {
            if (!category.children && category.icons && category.icons.web_icon) {
              const primaryIcon = category.icons.web_icon.replace('http://lm2:8080', AppSettings.LM2_URL);
              if (annotationIcon && annotationIcon !== primaryIcon) {
                data.locations[i].parentIcon = primaryIcon;
              }
              else {
                data.locations[i].icon = primaryIcon;
              }
            }
            else if (category.children && data.locations[i].categories.length > 0) {
              if (category.icons && category.icons.web_icon) {
                data.locations[i].parentIcon = category.icons.web_icon.replace('http://lm2:8080', AppSettings.LM2_URL);
              }

              let childCategory = data.locations[i].categories.filter(eachCategory => category.children.map(childCategory => childCategory.id).indexOf(eachCategory.id) > -1)[0];
              if (childCategory) {
                childCategory = categories.filter(category => category.id == childCategory.id)[0];
                if (childCategory && childCategory.icons && childCategory.icons.web_icon) {
                  data.locations[i].icon = childCategory.icons.web_icon.replace('http://lm2:8080', AppSettings.LM2_URL);
                }
                else {
                  const locationCategory = categories.filter(category => category.id == data.locations[i].categories[0].id)[0];
                  if (locationCategory.icons && locationCategory.icons.web_icon) {
                    data.locations[i].icon = locationCategory.icons.web_icon.replace('http://lm2:8080', AppSettings.LM2_URL);
                  }
                }
              }
              else {
                const locationCategory = categories.filter(category => category.id == data.locations[i].categories[0].id)[0];
                if (locationCategory.icons && locationCategory.icons.web_icon) {
                  data.locations[i].icon = locationCategory.icons.web_icon.replace('http://lm2:8080', AppSettings.LM2_URL);
                }
              }
            }
          }
        }

        data.locations = data.locations.filter(location => (location.polygon && location.polygon.length > 0 && location.polygon[0].length > 0) || location.point);
        return data;
      });
  }

  getLocations(projectId: number, args: Object = {}): Observable<any> {
    return this.apollo
      .query({
        query: locationsQuery,
        variables: {
          ...args,
          project_id: projectId
        }
      }).pipe(map((res: any) => {
        if (handleErrors(res)) {
          throw new Error(`Unable to request locations in project ${projectId} with specified parameters`);
        }

        return res.data.locations;
      }));
  }

  getCategories() {
    return this.apollo
        .query({
          query: categoriesQuery,
          variables: {
            context: AppUtils.getContext(),
            sort: 'name',
            projectId: this.mapService.projectId.getValue()
          }
        })
        .map((res: any) => {
          if (handleErrors(res)) {
            return false;
          }

          const categories = res.data.categories
            .filter(category => 
              !category.parent
            )
            .map(category => ({
                id: category.id,
                name: category.name,
                icon: category.icons.web_icon,
                exclude_from_directory: category.exclude_from_directory,
                children: category.children.map(child => ({
                  id: child.id,
                  name: child.name,
                  icon: child.icons.web_icon,
                  exclude_from_directory: child.exclude_from_directory
                }))
              })
            );

          let allCategories = [];
          categories.forEach(category => {
            allCategories = [
              ...allCategories,
              ...category.children,
              category
            ];
          });
          this.categories.next(allCategories);

          return categories;
        }).toPromise();
  }
}
