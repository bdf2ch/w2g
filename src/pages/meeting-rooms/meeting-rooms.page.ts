import {Component, OnInit, OnDestroy} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';

import 'rxjs/add/operator/take';

import {MapService} from '../../providers/map.service';
import {LocationsService} from '../../providers/locations.service';
import {AppUtils} from '../../app/app.utils';
import {MeetRoomCategory, MeetRoomFull} from '../../models/api-models';
import {MeetingRoomsService} from '../../providers/meeting-rooms.service';

@Component({
        selector: 'w2g-meeting-rooms',
        templateUrl: 'meeting-rooms.page.html',
        styleUrls: ['meeting-rooms.page.scss']
    })
    export class MeetingRoomsPage implements OnInit {
    constructor(private meetRoomService: MeetingRoomsService, private router: Router) {
    }

    categories: MeetRoomCategory[] = [];
    selectedCategory: MeetRoomCategory;
    meetFull: MeetRoomFull;

    ngOnInit() {
        this.meetRoomService.getMeetingRoomCategories().then((value) => this.categories = value);
    }

    async select(category: MeetRoomCategory) {
        if (category != null) {
            this.selectedCategory = category;
            this.meetFull = await this.meetRoomService.getFullMeetingRoom(category.id);
        } else {
            this.meetFull = null;
            this.selectedCategory = null;
        }
    }

    back() {
        if (this.selectedCategory) {
            this.select(null);
        } else {
            this.router.navigate(['/']);
        }
    }
}
