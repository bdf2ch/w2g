import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map, take } from 'rxjs/operators';

import { AuthService } from "./auth.service";
import { AppSettings } from "../app/app.settings";

@Injectable()
export class InfosService {
  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) { }

  getAll(projectId: number, categoryId?: string): Observable<any> {
    let url = `${AppSettings.APP_MANAGER_URL}/api/broker/directory/infos-${projectId}`;
    if (categoryId) {
      url += `categories.id=${categoryId}`;
    }

    return this.http.get(url, {
      headers: this.authService.headers
    });
  }

  getCategories(projectId: number): Observable<any> {
    return this.http.get(`${AppSettings.APP_MANAGER_URL}/api/broker/directory/info-categories-${projectId}-${AppSettings.IS_STAGING ? 'staging' : 'live'}`, {
      headers: this.authService.headers
    });
  }

  getCategoriesID(projectId: number, id: string): Observable<any> {
    return this.http
        .get(`${AppSettings.APP_MANAGER_URL}/api/broker/directory/infos-${projectId}-${AppSettings.IS_STAGING ? 'staging' : 'live'}?categories.id=${id}`, {
          headers: this.authService.headers
        })
        .pipe(take(1))
        .pipe(map((infos: any[]) => infos.sort((infoA, infoB) => infoA.heading.localeCompare(infoB.heading))));
  }
  
  getfeatured(projectId: number): Observable<any> {
      return this.http
          .get(`${AppSettings.APP_MANAGER_URL}/api/broker/directory/infos-${projectId}-${AppSettings.IS_STAGING ? 'staging' : 'live'}/ac/statusMessage/featured`, {
            headers: this.authService.headers
          })
          .pipe(take(1))
          .pipe(map((infos: any[]) => infos.sort((infoA, infoB) => infoA.heading.localeCompare(infoB.heading))));
  }
}
