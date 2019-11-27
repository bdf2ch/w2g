import {Component, OnInit, OnDestroy, HostBinding, Input} from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as mapboxgl from 'mapbox-gl';

import { AnnotationsService } from '../../providers/annotations.service';
import { LocationsService } from '../../providers/locations.service';
import { MapService } from '../../providers/map.service';

import { AppSettings } from '../../app/app.settings';
import { AppUtils } from '../../app/app.utils';
import {EventsService} from '../../providers/events.service';
import {FormControl} from '@angular/forms';
import {BehaviorSubject, Observable, Subscription} from 'rxjs';
import {startWith} from 'rxjs/operator/startWith';
import {debounceTime} from 'rxjs/operator/debounceTime';
import {switchMap} from 'rxjs/operator/switchMap';
import {catchError, map} from 'rxjs/operators';
import {of} from 'rxjs/observable/of';
import {Meeting} from '../../models/api-models';

@Component({
  selector: 'w2g-event-list-item',
  templateUrl: 'event-list-item.widget.html',
  styleUrls: [ 'event-list-item.widget.scss' ]
})
export class EventListItemWidget implements OnInit, OnDestroy {
  @Input('showDivider') showDivider: boolean;
  @Input() meeting: Meeting;

  categories: any[];

  mockCategories: any[] = [
    {
      id: '424234',
      name: 'Cat1'
    },
    {
      id: '424234',
      name: 'Cat2'
    },
    {
      id: '424234',
      name: 'Cat3'
    },
    {
      id: '424234',
      name: 'Cat4'
    },
    {
      id: '424234',
      name: 'Cat5'
    },
    {
      id: '424234',
      name: 'Cat5'
    },
    {
      id: '424234',
      name: 'Cat5'
    },
    {
      id: '424234',
      name: 'Cat5'
    },
    {
      id: '424234',
      name: 'Cat5'
    },
    {
      id: '424234',
      name: 'Cat5'
    },
    {
      id: '424234',
      name: 'Cat5'
    },
    {
      id: '424234',
      name: 'Cat5'
    },
    {
      id: '424234',
      name: 'Cat5'
    },
    {
      id: '424234',
      name: 'Cat5'
    },
  ];


  constructor(
    private eventsService: EventsService,
    private locationsService: LocationsService,
    private mapService: MapService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.getTodaysMeetings();
  }

  ngOnDestroy() {

  }

  getTodaysMeetings() {
    this.eventsService.getAll(23)
      .subscribe(people => {
        this.categories = this.mockCategories;
      });
  }



}
