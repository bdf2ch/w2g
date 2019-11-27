import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from '../providers/auth.service';
import { AppSettings } from '../app/app.settings';

@Injectable()
export class DirectionsService {
  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  get(from: string, to: string, projectId: number, campusId: number, disabled: boolean, active: boolean): Observable<any> {
    //return this.http.get(`http://localhost:9999/directions?origin=${from}&destination=${to}&projectId=${projectId}&campusId=${campusId}&disabled=${disabled}&active=${active}&staging=${AppSettings.IS_STAGING}`, {
    return this.http.get(`${AppSettings.APP_MANAGER_URL}/api/route/directions?origin=${from}&destination=${to}&projectId=${projectId}&campusId=${campusId}&disabled=${disabled}&active=${active}&staging=${AppSettings.IS_STAGING}`, {
        headers: this.authService.headers
    });
  }
}
