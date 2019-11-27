import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable} from 'rxjs';

import 'rxjs/add/operator/map';

import {AuthService} from './auth.service';
import {AppSettings} from '../app/app.settings';
import {BehaviorSubject} from '../../node_modules/rxjs';

@Injectable()
export class EventsService {
    public eventsIdService: BehaviorSubject<any>;

    constructor(
        private authService: AuthService,
        private http: HttpClient
    ) {
        this.init();
    }

    init() {
        this.eventsIdService = new BehaviorSubject<number>(null);
    }

    reset() {
        this.init();
    }

    get(eventId: string): Observable<any> {
        return this.http.get(`${AppSettings.APP_MANAGER_URL}/api/broker/events/${eventId}`, {
            headers: this.authService.headers
        });
    }

    getAll(projectId: number, groupBy: string = '_startDate'): Observable<any> {
        return this.http.get(`${AppSettings.APP_MANAGER_URL}/api/broker/events?projectId=${projectId}&staging=${AppSettings.IS_STAGING}`, {
            headers: this.authService.headers
        });
    }

    getAllByCategoryId(projectId: number, categoryId: string, endDate: string, featured: boolean, groupBy: string = '_startDate'): Observable<any> {
        let url = `${AppSettings.APP_MANAGER_URL}/api/broker/events?projectId=${projectId}&groupBy=${groupBy}&categoryId=${categoryId}&endDate=${endDate}&staging=${AppSettings.IS_STAGING}`;
        if (featured) {
            url = `${url}&featured=true`;
        }

        return this.http.get(url, {
            headers: this.authService.headers
        });
    }

    newGetAll(projectId: number, endDate: string, featured: boolean, groupBy: string = '_startDate'): Observable<any> {
        let url = `${AppSettings.APP_MANAGER_URL}/api/broker/events?projectId=${projectId}&groupBy=${groupBy}&endDate=${endDate}&staging=${AppSettings.IS_STAGING}`;
        if (featured) {
            url = `${url}&featured=true`;
        }

        return this.http.get(url, {
            headers: this.authService.headers
        });
    }

}
