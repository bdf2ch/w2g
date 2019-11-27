import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { ActivityService } from './activity.service';
import { AuthService } from './auth.service';

import { AppSettings } from '../app/app.settings';

@Injectable()
export class SurveysService {
  public activeSurvey: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  
  constructor(
    private activityService: ActivityService,
    private authService: AuthService,
    private http: HttpClient
  ) { }

  get(surveyId: string): Observable<any> {
    return this.http.get(`${AppSettings.APP_MANAGER_URL}/api/broker/surveys/${surveyId}`, {
      headers: this.authService.headers
    });
  }

  createResponse(
    surveyId: string,
    answers: any[],
    userId: string,
    clientId: string,
    instanceId: string
  ): Observable<any> {
    return this.http.post(`${AppSettings.APP_MANAGER_URL}/api/broker/survey-responses/${surveyId}?userId=${userId}&ipAddress=${this.activityService.ipAddress}&clientId=${clientId}&instanceId=${instanceId}`, answers, {
      headers: this.authService.headers
    });
  }
}
