import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { AppSettings } from '../app/app.settings';

@Injectable()
export class TwitterService {
  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  get(screenName: string, count: number): Observable<any> {
    return this.http.get(`${AppSettings.APP_MANAGER_URL}/api/broker/twitter/timeline/screenName/${screenName}?count=${count}&format=json`, {
      headers: this.authService.headers
    });
  }
}
