import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import * as mapboxgl from 'mapbox-gl';

import { AuthService } from './auth.service';
import { AppSettings } from '../app/app.settings';

@Injectable()
export class GeocodeService {
  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  autocomplete(query: string, projectId: number, campusId: number): Observable<any> {
    return this.http
      .get(`${AppSettings.APP_MANAGER_URL}/api/geocode/search?country=gb&autocomplete=true&term=${query}&projectId=${projectId}&campusId=${campusId}`, {
        headers: this.authService.headers
      })
      .map((data: any) => {
        return data.map(entry => {
          return {
            name: entry.value,
            lat: entry.gpsLat,
            lng: entry.gpsLon
          }
        });
      });
  }

  reverse(point: mapboxgl.LngLat): Observable<any> {
    return this.http
      .get(`${AppSettings.APP_MANAGER_URL}/api/broker/geocode?gpsLat=${point.lat}&gpsLon=${point.lng}&addressdetails=1`, {
        headers: this.authService.headers
      });
  }
}
