import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import 'rxjs/add/operator/map';

import { AuthService } from './auth.service';
import { AppSettings } from '../app/app.settings';

@Injectable()
export class WeatherService {
  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  get(): Observable<any> {
    return this.http
      .get(`${AppSettings.APP_MANAGER_URL}/api/broker/weather/forecast?gpsLat=${AppSettings.CENTER[1]}&gpsLon=${AppSettings.CENTER[0]}`, {
        headers: this.authService.headers
      })
      .map((data) => {
        return {
          temperature: data[0].main.temp,
          data: data[0].weather[0]
        };
      });
  }
}
