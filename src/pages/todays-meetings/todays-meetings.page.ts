import {Component, OnInit, OnDestroy, HostBinding} from '@angular/core';
import {Router, ActivatedRoute} from '@angular/router';

import * as mapboxgl from 'mapbox-gl';

import {AnnotationsService} from '../../providers/annotations.service';
import {LocationsService} from '../../providers/locations.service';
import {MapService} from '../../providers/map.service';

import {AppSettings} from '../../app/app.settings';
import {AppUtils} from '../../app/app.utils';
import {EventsService} from '../../providers/events.service';
import {FormControl} from '@angular/forms';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {startWith} from 'rxjs/operator/startWith';
import {debounceTime} from 'rxjs/operator/debounceTime';
import {switchMap} from 'rxjs/operator/switchMap';
import {catchError, map, take} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import {LocationCategory, Meeting} from '../../models/api-models';

@Component({
    selector: 'w2g-todays-meetings',
    templateUrl: 'todays-meetings.page.html',
    styleUrls: ['todays-meetings.page.scss']
})
export class TodaysMeetingsPage implements OnInit, OnDestroy {
    constructor(
        private eventsService: EventsService,
        private locationsService: LocationsService,
        private mapService: MapService,
        private route: ActivatedRoute,
        private router: Router
    ) {}


    categories: Meeting[];
    selectedCategory: Meeting;

    ngOnInit() {
        this.getTodaysMeetings();
    }

    ngOnDestroy() {

    }

    getTodaysMeetings() {
      console.log('get today meetings');
        this.eventsService.getAll(AppSettings.PROJECT_ID).pipe(take(1))
            .subscribe(meetings => {
                this.categories = meetings;
            });
    }

    select(category: Meeting) {
      console.log('selected meeting', category);
        if (category != null) {
            this.selectedCategory = category;
        } else {
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
