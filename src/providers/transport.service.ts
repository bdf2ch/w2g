import {Injectable} from "@angular/core";
import {AuthService} from "./auth.service";
import {AppSettings} from "../app/app.settings";
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject} from '../../node_modules/rxjs';

@Injectable()
export class TransportService {
  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getStops(projectId: number, campusId: number): Observable<any> {
    return this.http
      .get(`${AppSettings.APP_MANAGER_URL}/api/broker/transport/stops?projectId=${projectId}&campusId=${campusId}`, {
        headers: this.authService.headers
      });
  }

  getStations(projectId: number, campusId: number): Observable<any> {
    return this.http
      .get(`${AppSettings.APP_MANAGER_URL}/api/broker/transport/stations?lm2Url=${AppSettings.LM2_URL}&projectId=${projectId}&campusId=${campusId}`, {
        headers: this.authService.headers
      });
  }

  getServices(id: string, provider?: string): Observable<any> {
    let url = `${AppSettings.APP_MANAGER_URL}/api/broker/transport/services/${id}`;
    if (provider) {
      url += `?provider=${provider}`;
    }
    return this.http
      .get(url, {
        headers: this.authService.headers
      });
  }

  getStationServices(id: string): Observable<any> {
    return this.http
      .get(`${AppSettings.APP_MANAGER_URL}/api/broker/transport/stations/${id}/services`, {
        headers: this.authService.headers
      });
  }

  getRoute(service: any, provider?: string): Observable<any> {
    let url = `${AppSettings.APP_MANAGER_URL}/api/broker/transport/route/${service.operator}/${service.line}/${service.direction}/${service.atcoCode}/${service.date}/${service.time}`;
    if (provider) {
      url += `?provider=${provider}`;

      if (provider == 'rsl') {
        url += `&journeyId=${service.journeyId}`;
      }
    }

    return this.http
      .get(url, {
        headers: this.authService.headers
      });
  }

  getTrainRoute(service: any, stationId: string): Observable<any> {
    return this.http.get(`${AppSettings.APP_MANAGER_URL}/api/broker/transport/stations/${stationId}/route/${service.trainUid}`, {
      headers: this.authService.headers
    });
  }

  getJourney(from: any, to: any, destination: string, time: any, date: any, mode: any): Observable<any> {
    return this.http
      .get(`${AppSettings.APP_MANAGER_URL}/api/broker/publicjourney?from=lonlat:${from}&to=lonlat:${to}&destination=${destination}&date=${date}&time=${time}&sortBy=${mode}`, {
        headers: this.authService.headers
      });
  }

}
