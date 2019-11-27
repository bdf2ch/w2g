import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as mapboxgl from 'mapbox-gl';

import { AnnotationsService } from '../../providers/annotations.service';
import { LocationsService } from '../../providers/locations.service';
import { MapService } from '../../providers/map.service';

import { AppSettings } from '../../app/app.settings';
import { AppUtils } from '../../app/app.utils';
import {EventsService} from '../../providers/events.service';
import {PeopleDirectoryService} from '../../providers/people-directory.service';

@Component({
  selector: 'w2g-person-info',
  templateUrl: 'person-info.page.html',
  styleUrls: [ 'person-info.page.scss' ]
})
export class PersonInfoPage implements OnInit, OnDestroy {
  person: any;
  officeHours: any;
  colour: String;

  _id: String;

  departmentColours: any = {
    'accounting & finance': '#2B6D9F',
    'business': '#297B79',
    'economics': '#ACC953',
    'marketing': '#405153',
    'tourism': '#9FD8F6',
    'engineering': '#1E3F65'
  };

  mockImage: String = 'assets/images/Ken_Board-01.png';

  mockDepartments: any = {
    'ACCOUNTING & FINANCE': {
      colour: '#2B6D9F',
      people: [
        {
          id: '1',
          name: 'Dr test test',
          image: 'assets/images/Ken_Board-01.png',
          email: 'test@test.com',
          phone: '0122333546356',
          room: 'a room'
        },
        {
          id: '2',
          name: 'Dr test test',
          image: 'assets/images/Ken_Board-01.png',
          email: 'test@test.com',
          phone: '0122333546356',
          room: 'a room'
        }
      ]
    },
    'BUSINESS': {
      colour: '#297B79',
      people: [
        {
          id: '3',
          name: 'Dr test test',
          image: 'assets/images/Ken_Board-01.png',
          email: 'test@test.com',
          phone: '0122333546356',
          room: 'a room'
        },
        {
          id: '4',
          name: 'Dr test test',
          image: 'assets/images/Ken_Board-01.png',
          email: 'test@test.com',
          phone: '0122333546356',
          room: 'a room'
        }
      ]
    },
    'ECONOMICS': {
      colour: '#ACC953',
      people: [
        {
          id: '5',
          name: 'Dr test test',
          image: 'assets/images/Ken_Board-01.png',
          email: 'test@test.com',
          phone: '0122333546356',
          room: 'a room'
        },
        {
          id: '6',
          name: 'Dr test test',
          image: 'assets/images/Ken_Board-01.png',
          email: 'test@test.com',
          phone: '0122333546356',
          room: 'a room'
        }
      ]
    },
    'MARKETING': {
      colour: '#405153',
      people: [
        {
          id: '7',
          name: 'Dr test test',
          image: 'assets/images/Ken_Board-01.png',
          email: 'test@test.com',
          phone: '0122333546356',
          room: 'a room'
        },
        {
          id: '8',
          name: 'Dr test test',
          image: 'assets/images/Ken_Board-01.png',
          email: 'test@test.com',
          phone: '0122333546356',
          room: 'a room'
        }
      ]
    },
    'TOURISM': {
      colour: '#9FD8F6',
      people: [
        {
          id: '9',
          name: 'Dr test test',
          image: 'assets/images/Ken_Board-01.png',
          email: 'test@test.com',
          phone: '0122333546356',
          room: 'a room'
        },
        {
          id: '10',
          name: 'Dr test test',
          image: 'assets/images/Ken_Board-01.png',
          email: 'test@test.com',
          phone: '0122333546356',
          room: 'a room'
        }
      ]
    }
  };

  mockDays: any[] = [
    {
      day: "Monday",
      startTime: "09:00",
      endTime: "17:00",
    },
    {
      day: "Tuesday",
      startTime: "09:00",
      endTime: "17:00",
      closed: true
    },
    {
      day: "Wednesday",
      startTime: "09:00",
      endTime: "17:00",
    },
    {
      day: "Thursday",
      startTime: "09:00",
      endTime: "17:00",
    },
    {
      day: "Friday",
      startTime: "09:00",
      endTime: "17:00",
    },
    {
      day: "Saturday",
      startTime: "09:00",
      endTime: "17:00",
    },
    {
      day: "Sunday",
      startTime: "09:00",
      endTime: "17:00",
    },
  ];

  constructor(
    private annotationsService: AnnotationsService,
    private locationsService: LocationsService,
    private mapService: MapService,
    private route: ActivatedRoute,
    private peopleDirectoryService: PeopleDirectoryService,
    private router: Router
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.getPerson(params._id);
    });
  }

  ngOnDestroy() {
  }

  collectObjectKeys(object) {
    return Object.keys(object);
  }

  getPerson(_id) {
    this.peopleDirectoryService.getPerson(AppSettings.PROJECT_ID, _id)
      .subscribe(person => {
        console.log(person);
        this.person = person;
        this.colour = this.departmentColours[person.department.toLowerCase()];
        this.officeHours = this.mockDays;
      });
  }
}
