import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import * as mapboxgl from 'mapbox-gl';

import { AuthService } from './auth.service';
import { AppSettings } from '../app/app.settings';

@Injectable()
export class TrafficService {
  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  getInBounds(bounds: number[][]): Observable<any> {
    return this.http.get(`${AppSettings.APP_MANAGER_URL}/api/broker/trafficEvents?bbox=${bounds[0].join(',')},${bounds[1].join(',')}`, {
      headers: this.authService.headers
    });
  }
}
