import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import { AuthService } from './auth.service';

import { AppSettings } from '../app/app.settings';

@Injectable()
export class PeopleDirectoryService {
  public categories: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }


  getPeople(projectId: number): Observable<any> {
    return this.http
      .get(`${AppSettings.APP_MANAGER_URL}/api/broker/directory/contacts-${projectId}-${AppSettings.IS_STAGING ? 'staging' : 'live'}`, {
        headers: this.authService.jsonHeaders
      });
  }

  getPeopleAc(projectId: number, term: String): Observable<any> {
    return this.http
      .get(`${AppSettings.APP_MANAGER_URL}/api/broker/directory/contacts-${projectId}-${AppSettings.IS_STAGING ? 'staging' : 'live'}/ac/title,firstName,lastName/${term}?minChar=1`, {
        headers: this.authService.jsonHeaders
      });
  }

  getPerson(projectId: number, _id: String): Observable<any> {
    return this.http
      .get(`${AppSettings.APP_MANAGER_URL}/api/broker/directory/contacts-${projectId}-${AppSettings.IS_STAGING ? 'staging' : 'live'}/_id/${_id}`, {
        headers: this.authService.jsonHeaders
      });
  }
}
