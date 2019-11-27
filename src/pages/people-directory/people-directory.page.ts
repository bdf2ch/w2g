import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as mapboxgl from 'mapbox-gl';

import { AnnotationsService } from '../../providers/annotations.service';
import { LocationsService } from '../../providers/locations.service';
import { MapService } from '../../providers/map.service';

import { AppSettings } from '../../app/app.settings';
import { AppUtils } from '../../app/app.utils';
import {PeopleDirectoryService} from '../../providers/people-directory.service';
import {KeyboardService} from '../../providers/keyboard.service';

@Component({
  selector: 'w2g-people-directory',
  templateUrl: 'people-directory.page.html',
  styleUrls: [ 'people-directory.page.scss' ]
})
export class PeopleDirectoryPage implements OnInit, OnDestroy {
  expansionPanelHeight: String = '60px';

  input: String;

  departments: any;

  mockImage: String = 'assets/images/Ken_Board-01.png';

  departmentsObj: any = {
    'accounting & finance': {
      colour: '#2B6D9F',
      people: []
    },
    'business': {
      colour: '#297B79',
      people: []
    },
    'economics': {
      colour: '#ACC953',
      people: []
    },
    'marketing': {
      colour: '#405153',
      people: []
    },
    'tourism': {
      colour: '#9FD8F6',
      people: []
    },
    'engineering': {
      colour: '#1E3F65',
      people: []
    }
  };

  defaultDepartmentsObj: any = {
    'accounting & finance': {
      colour: '#2B6D9F',
      people: []
    },
    'business': {
      colour: '#297B79',
      people: []
    },
    'economics': {
      colour: '#ACC953',
      people: []
    },
    'marketing': {
      colour: '#405153',
      people: []
    },
    'tourism': {
      colour: '#9FD8F6',
      people: []
    },
    'engineering': {
      colour: '#1E3F65',
      people: []
    }
  };

  departmentColours: any = {
    'accounting & finance': '#2B6D9F',
    'business': '#297B79',
    'economics': '#ACC953',
    'marketing': '#405153',
    'tourism': '#9FD8F6',
    'engineering': '#1E3F65'
  };

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

  constructor(
    private annotationsService: AnnotationsService,
    private locationsService: LocationsService,
    private mapService: MapService,
    private route: ActivatedRoute,
    private peopleDirectoryService: PeopleDirectoryService,
    private router: Router,
    private keyboardService: KeyboardService
  ) { }

  ngOnInit() {
    this.collectPeopleDirectories();

    this.keyboardService.keyboard.subscribe((event) => {
      if (event) {
        this.input = event.value;
        this.inputChange();
      }
    });
  }

  ngOnDestroy() {
  }

  collectObjectKeys(object) {
    return Object.keys(object);
  }

  collectPeopleDirectories(term?: String) {
    if (term && term.length > 0) {
      return this.peopleDirectoryService.getPeopleAc(AppSettings.PROJECT_ID, term)
        .subscribe(people => {
          this.mapByDepartments(people);

          console.log(this.departments);
        });
    }

    this.peopleDirectoryService.getPeople(AppSettings.PROJECT_ID)
      .subscribe(people => {
        this.mapByDepartments(people);

        console.log(this.departments);
      });
  }

  mapByDepartments(people: any) {
    this.departmentsObj = JSON.parse(JSON.stringify(this.defaultDepartmentsObj));

    for (const person of people) {
      this.departmentsObj[person.department.toLowerCase()].people.push(person);
    }

    this.departments = this.departmentsObj;
  }

  inputChange() {
    console.log(this.input);
    this.collectPeopleDirectories(this.input);
  }
}
