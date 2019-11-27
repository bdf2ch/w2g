import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {MeetRoomCategory, MeetRoomFullResponse} from '../models/api-models';

@Injectable()
export class MeetingRoomsService {
    constructor(private http: HttpClient) {
    }

    readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa('admin:Dd2qf47u')
        })
    };

    async getMeetingRoomCategories(): Promise<MeetRoomCategory[]> {
        return this.http.get<MeetRoomCategory[]>('https://reserva.onemedia.co.uk:8443', this.httpOptions).toPromise();
    }

    async getFullMeetingRoom(uid: string) {
        const response = await this.http.get<MeetRoomFullResponse>('https://reserva.onemedia.co.uk:8443/' + uid, this.httpOptions).toPromise();
        return response.resource[0];
    }
}
