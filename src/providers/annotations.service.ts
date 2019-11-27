import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import 'rxjs/add/operator/take';

import * as mapboxgl from 'mapbox-gl';
import * as turf from '@turf/turf';

import { AuthService } from './auth.service';
import { MapService } from './map.service';
import { LocationsService } from "./locations.service";

import { AppSettings } from '../app/app.settings';
import { AppUtils } from '../app/app.utils';

@Injectable()
export class AnnotationsService {
  private annotationsByModule: Map<string, any[]> = new Map<string, any[]>();
  private getSubscription;

  constructor(
    private authService: AuthService,
    private locationsService: LocationsService,
    private mapService: MapService,
    private http: HttpClient
  ) { }

  getByModule(module: any, projectId: number): Observable<any> {
    return Observable.fromPromise(
      new Promise((resolve, reject) => {
        this.locationsService
          .getByCategoryId(module, projectId)
          .then(locationsData => {
            const data: any = {
              count: 0,
              annotations: []
            };

            data.count = locationsData.count;
            data.annotations = data.annotations.concat(
              locationsData.locations
            );
            
            resolve(data);
          })
          .catch(err => reject(err))
      })
    );
  }

  getByModulePart(module: any, projectId: number, offset: number, annotations: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      let url;
      if (module.match(AppSettings.UUID_REGEX)) {
        url = `${AppSettings.APP_MANAGER_URL}/api/lm2/projects/${projectId}/annotations?category_id=${module}&limit=300`;
      }
      else if (typeof module === 'string') {
        url = `${AppSettings.APP_MANAGER_URL}/api/lm2/projects/${projectId}/annotations?broker_category=${module}&limit=300`;
      }

      this.http
        .get(`${url}&offset=${offset}`, {
          headers: this.authService.jsonHeaders
        })
        .take(1)
        .subscribe((data: any) => {
          data.offset = offset;
          data.partCount = data.count;
          data.annotations = annotations.concat(data.annotations);
          data.count = data.annotations.length;

          resolve(data);
        }, err => reject(err));
    });
  }

  getByModuleBounds(module: any, projectId: number, bounds: mapboxgl.LngLatBounds): Promise<any[]> {
    let icon;

    const categories = this.locationsService.categories.getValue();
    const moduleObj = categories.filter(
      category => category.id === module
    )[0];
    
    if (moduleObj && moduleObj.icon) {
      icon = moduleObj.icon;
    }

    if (this.annotationsByModule.has(module)) {
      return new Promise((resolve, reject) => resolve(this.filterByBounds(this.annotationsByModule.get(module), bounds)));
    }
    else if (this.getSubscription) {
      return new Promise((resolve, reject) => {
        this.getSubscription
          .add(() => {
            this.getByModuleBounds(module, projectId, bounds)
              .then((data) => resolve(data))
              .catch((err) => reject(err));
          });
      });
    }
    else {
      return new Promise((resolve, reject) => {
        this.getSubscription = this
          .getByModule(module, projectId)
          .take(1)
          .subscribe((data: any) => {
            const annotations = data.annotations.map(annotation => {
              annotation.icon = icon;
              annotation.categoryId = module;
              return annotation;
            });
            this.annotationsByModule.set(module, annotations);

            this.getSubscription.unsubscribe();
            this.getSubscription = null;
            resolve(this.filterByBounds(data.annotations, bounds));
          }, err => reject(err));
      });
    }
  }

  filterByBounds(annotations: any[], bounds: any) {
    const bBoxPolygon = turf.bboxPolygon(turf.bbox(turf.lineString([ [bounds._sw.lng, bounds._sw.lat], [bounds._ne.lng, bounds._ne.lat] ])));
    return annotations.filter((annotation) => turf.booleanPointInPolygon(turf.point(annotation.point), bBoxPolygon));
  }
}
