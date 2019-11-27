import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/map';

import { AuthService } from './auth.service';
import { AppSettings } from '../app/app.settings';

@Injectable()
export class ToursService {
  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  get(tourId: string): Observable<any> {
    return this.http.get(`${AppSettings.APP_MANAGER_URL}/api/broker/tours/${tourId}?format=geojson`, {
      headers: this.authService.headers
    });
  }

  getAll(projectId: number): Observable<any> {
    return this.http.get(`${AppSettings.APP_MANAGER_URL}/api/broker/tours?projectId=${projectId}`, {
      headers: this.authService.headers
    });
  }

  getMulti(tourIds: string[]): Observable<any> {
    return this.http.get(`${AppSettings.APP_MANAGER_URL}/api/broker/tours?ids=${tourIds.join(',')}&format=geojson`, {
      headers: this.authService.headers
    });
  }
}
