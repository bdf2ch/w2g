import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AppSettings } from '../app/app.settings';
import { AuthService } from './auth.service';

@Injectable()
export class FeedbackService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  send(feedback: any): Observable<any> {
    return this.http.post(`${AppSettings.APP_MANAGER_URL}/api/broker/tickets/feedback`, feedback, {
      headers: this.authService.headers
    });
  }
}
