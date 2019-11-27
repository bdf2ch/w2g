import * as moment from 'moment';
import 'rxjs/add/operator/take';

import { Component, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';

import { ActivityService } from '../../providers/activity.service';
import { FloorsService } from '../../providers/floors.service';
import { LocationsService } from '../../providers/locations.service';
import { MapService } from '../../providers/map.service';
import { RouteService } from '../../providers/route.service';

import { AppSettings } from '../../app/app.settings';
import { AppUtils } from '../../app/app.utils';

@Component({
  selector: 'w2g-popup',
  templateUrl: './popup.widget.html',
  styleUrls: ['./popup.widget.scss']
})
export class PopupWidget implements OnInit, OnDestroy {
  @Output() floorEvent: EventEmitter<any> = new EventEmitter();
  @Output() removeFloorEvent: EventEmitter<any> = new EventEmitter();
  @Output() shareEvent: EventEmitter<any> = new EventEmitter();
  @Output() closeEvent: EventEmitter<any> = new EventEmitter();

  public location: any;
  public projectId: number;
  public method: string;

  public hasList: boolean = false;
  public hasDepartures: boolean = false;
  public hasDestination: boolean = false;

  public buildingFloors: any[];
  public currentFloor: any;
  public defaultFloor: any;
  public parentFloor: any;
  public floor: any;

  public inBuilding: boolean = false;
  public ready: boolean = false;
  public showFloorplans: boolean = AppSettings.SHOW_FLOORPLANS;
  public qrCode: boolean = AppSettings.QR_CODE;

  public themeColor: string;
  public time: string;
  public timeSubscription: any;

  public availabilityString: string;
  public availabilityColor: string;

  constructor(
    private activityService: ActivityService,
    private floorsService: FloorsService,
    private locationsService: LocationsService,
    private mapService: MapService,
    private routeService: RouteService,
    private router: Router
  ) {}

  ngOnInit() {
    this.sanitiseLocation();

    if (this.showFloorplans) {
      this.checkFloors();
    }
    
    const doReady = () => {
        this.checkInBuilding();
        this.checkDepartures();
        this.checkDestination();
        this.checkThemeColor();

        this.monitorTime();
        this.ready = true;
    };
    
    this.checkAvailability();
    
    if (this.showFloorplans) {
        this.checkParent()
          .then(() => {
            doReady();
          })
          .catch((err) => console.error(err.message));
    }
    else {
        doReady();
    }
  }

  ngOnDestroy() { }

  private checkFloors() {
    this.buildingFloors = this.floorsService.buildings.getValue().get(this.location.name);

    if (this.buildingFloors && this.buildingFloors.length > 0) {
      this.hasList = true;

      try {
        this.defaultFloor = this.buildingFloors.filter(function (floor) {
          return floor.level == 0;
        })[0];
      }
      catch (ex) {
        this.defaultFloor = this.buildingFloors[0];

        console.warn(`Building ${this.location.name} does not have a floor with a level value of 0, defaulting to floor ${this.defaultFloor.name}.`);
      }
    }

    if (!this.defaultFloor) {
      this.floor = this.floorsService.floors.getValue().filter((floor) => {
        return floor.id == this.location.floor_id;
      })[0];

      if (this.floor) {
        this.hasList = true;
      }
      else {
        //console.warn(`LocationUniversity ${this.location.name} does not have a floor ID, unable to render "Go Outside" option`);
      }
    }

    if (AppSettings.INCLUDE_ONLY_BUILDING_IDS && AppSettings.INCLUDE_ONLY_BUILDING_IDS.indexOf(this.location.id) === -1) {
      this.defaultFloor = undefined;
    }
  }

  private checkParent() {
    return new Promise((resolve, reject) => {
      if (this.location.parent_id) {
        this.hasList = true;

        this.locationsService
          .get(this.location.parent_id, {
            context: AppUtils.getContext()
          })
          .then((parent: any) => {
            if (parent.floor_id) {
              this.parentFloor = this.floorsService.floors.getValue().filter((floor) => {
                return floor.id == parent.floor_id;
              });
            }

            if (parent.name) {
              this.buildingFloors = this.floorsService.buildings.getValue().get(parent.name);
            }

            resolve();
          });
      }
      else {
        resolve();
      }
    });
  }

  private checkAvailability() {
    if (this.location.available && this.location.total) {
      this.hasList = true;
      this.availabilityString = `${this.location.available} out of ${this.location.total} available`;

      if (this.location.ratio) {
        const stops = AppSettings.AVAILABILITY_RATIO_STOPS;
        if (stops && stops.length > 0) {
          if (AppSettings.AVAILABILITY_CIRCLE_SHOW_FULL) {
            this.availabilityColor = stops[0][1];
          }
          else {
            for (let i = 0; i < stops.length; i++) {
              if (
                i === stops.length - 1 && this.location.ratio > stops[i][0] ||
                i > 0 && stops[i + 1] && this.location.ratio > stops[i][0] && this.location.ratio < stops[i + 1][0]
              ) {
                this.availabilityColor = stops[i][1];
                break;
              }
            }
          }
        }
      }
    }
  }

  private checkInBuilding() {
    this.currentFloor = this.mapService.floor.getValue();
    if (this.currentFloor && this.buildingFloors && this.buildingFloors.length > 0) {
      for (let i = 0; i < this.buildingFloors.length; i++) {
        if (this.buildingFloors[i].id == this.currentFloor.id) {
          this.inBuilding = true;
          break;
        }
      }
    }
  }

  private checkDepartures() {
    if ([
      AppSettings.TRANSPORT_CATEGORY_ID,
      AppSettings.TRANSPORT_RAIL_CATEGORY_ID
    ].indexOf(this.location.categoryId) > -1) {
      this.hasList = true;
      this.hasDepartures = true;
    }
  }

  private checkDestination() {
    if (this.location.point && this.location.isDestination) {
      this.hasList = true;
      this.hasDestination = true;
    }
    else if (this.location.point) {
      if (this.routeService.getLineDistance(AppSettings.CENTER, this.location.point) > AppSettings.ROUTING_MAX_WALK_DISTANCE) {
        this.hasList = true;
        this.hasDestination = true;
        this.location.point = {
          lng: this.location.point[0],
          lat: this.location.point[1]
        }
      }
    }
  }

  private goInside() {
    if (this.router.url.indexOf('/floorplans') > -1) {
      this.router.navigate([`/floorplans/projects/${this.projectId}/floors/${this.defaultFloor.id}`], { queryParamsHandling: 'preserve' });
    }
    else {
      this.floorEvent.emit(this.defaultFloor);
    }
  }

  private goOutside() {
    // TODO: Test that this works, using a floor within a floor
    if (this.parentFloor) {
      if (this.router.url.indexOf('/floorplans') > -1) {
        this.router.navigate([`/floorplans/projects/${this.projectId}/floors/${this.parentFloor.id}`], { queryParamsHandling: 'preserve' });
      }
      else {
        // TODO: Possibly replace with the Map Service and integrate Floorplans Component
        this.floorEvent.emit(this.parentFloor);
      }
    }
    else if (this.floor) {
      if (this.router.url.indexOf('/floorplans') > -1) {
        this.router.navigate([`/floorplans`], { queryParamsHandling: 'preserve' });
      }

      this.removeFloorEvent.emit(this.floor);
    }
  }

  private getDepartures() {
    if (
      this.location.categoryId ===
      AppSettings.TRANSPORT_RAIL_CATEGORY_ID
    ) {
      this.router.navigate([`/transport/rail/services/${this.location.id}`], { queryParamsHandling: 'preserve' });
    }
    else {
      this.router.navigate([`/transport/services/${this.location.id}`], { queryParamsHandling: 'preserve' });
    }
  }

  private setDestination() {
    this.mapService.journeyDestination.next(this.location);
    this.closeEvent.emit();

    if (!this.router.url.includes('/planner')) {
      this.router.navigate([`/transport/planner`], {queryParamsHandling: 'preserve'});
    }
  }

  public getDirections() {
    let destination: string;

    if (AppSettings.ROUTING_GPS_ONLY) {
      if (this.location.point) {
        this.mapService.directionsDestination.next(
          `${this.location.point.join(',')},${AppSettings.FLOOR_ID},${this.location.floor_id}`
        );
      }
      else if (this.location.id) {
        this.locationsService
          .get(this.location.id, {
            context: AppUtils.getContext()
          })
          .then(location => {
            this.mapService.directionsDestination.next(
              `${location.point.join(',')},${AppSettings.FLOOR_ID},${location.floor_id}`
            );
          });
      }
      else {
        console.error('No "point" or "id" attribute found in location for GPS-only routing');
      }
    }
    else {
      try {
        if (
          (
            !this.location.floor ||
            AppSettings.SHOW_FLOORPLANS
          ) &&
          AppSettings.UUID_REGEX.test(
            this.location.id
          )
        ) {
          destination = this.location.id;
        }

        if (
          !AppSettings.SHOW_FLOORPLANS &&
          !destination &&
          this.location.parent
        ) {
          if (typeof this.location.parent === 'string') {
            this.location.parent = JSON.parse(
              this.location.parent
            );
          }

          if (this.location.parent.lm2_id) {
            destination = this.location.parent.lm2_id;
          }
          else if (
            this.location.parent.id &&
            AppSettings.UUID_REGEX.test(
              this.location.parent.id
            )
          ) {
            destination = this.location.parent.id;
          }
        }
      }
      catch (ex) {
        // Do nothing, continue below
      }

      if (
        !destination &&
        this.location.point
      ) {
        if (typeof this.location.point === 'string') {
          this.location.point = JSON.parse(
            this.location.point
          );
        }
        
        destination = this.location.point.join(',');
      }

      if (destination) {
        this.mapService.directionsDestination.next(
          destination
        );
      }
      else {
        console.error('No "point" or "id" attribute found in location for standard routing');
      }
    }
  }

  public share() {
    let url;

    if (this.time) {
      const center = AppSettings.CENTER;
      if (this.location.id) {
        url = `${AppSettings.WEB_URL}/directions/projects/${this.mapService.projectId.getValue()}/from/${center.join(',')}/to/${this.location.id}?campusId=${this.mapService.campusId.getValue()}&disabled=${this.mapService.disabled_tf.getValue()}`;
      }
      else if (this.location.point && Array.isArray(this.location.point)) {
        url = `${AppSettings.WEB_URL}/directions/projects/${this.mapService.projectId.getValue()}/from/${center.join(',')}/to/${this.location.point.join(',')}?campusId=${this.mapService.campusId.getValue()}&disabled=${this.mapService.disabled_tf.getValue()}`;
      }
    }
    else if (this.location.id) {
      url = `${AppSettings.WEB_URL}/search/projects/${this.mapService.projectId.getValue()}/${this.location.id}`;
    }
    else if (this.location.point && Array.isArray(this.location.point)) {
      url = `${AppSettings.WEB_URL}/geocode/projects/${this.mapService.projectId.getValue()}/${this.location.point.join(',')}`;
      if (this.location.name) {
        url += `?name=${this.location.name}`;
      }
    }

    if (url) {
      this.recordShare(url);
      this.shareEvent.emit(url);
    }
  }

  private recordShare(url) {
    this.activityService.action.next({
      name: url.includes('/directions') ? 'w2g-share-directions' : url.includes('/search/') ? 'w2g-share-location' : 'w2g-share-geocode',
      createdAt: moment.utc().format(),
      params: {
        url: url
      }
    });
  }

  private checkThemeColor() {
    this.themeColor = AppSettings.THEME_COLORS[this.method].hex;
  }

  private monitorTime() {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
      this.timeSubscription = null;
    }

    this.timeSubscription = this.mapService.directionsTime
      .subscribe(seconds => {
        if (seconds) {
          const minutes = Math.round(seconds / 60);

          if (minutes == 0) {
            this.time = `${Math.round(seconds)} secs`;
          }
          else if (minutes == 1) {
            this.time = `${minutes} min`;
          }
          else if (minutes < 60) {
            this.time = `${minutes} mins`;
          }
          else {
            const hours = Math.ceil(minutes / 60);
            //const hourMinutes = minutes % 60;
            this.time = `${hours} hrs`;
          }

          if (this.timeSubscription) {
            this.timeSubscription.unsubscribe();
          }

          this.mapService.resetDirectionsTime();
        }
      });
  }

  private sanitiseLocation() {
    if (this.location) {
      this.location.id = (
        this.location.lm2_id ||
        this.location.id ||
        this.location._id
      );

      this.location.name = (
        this.location.name
          .replace(
            AppSettings.HEX_REGEX,
            ''
          ).trim()
      );

      this.location.floor = (
        typeof this.location.floor === 'string' ?
          JSON.parse(this.location.floor) :
          this.location.floor
      );
      this.location.parent = (
        typeof this.location.parent === 'string' ?
          JSON.parse(this.location.parent) :
          this.location.parent
      );

      this.location.floor_id = (
        this.location.floor_id === 'null' ?
          JSON.parse(this.location.floor_id) :
          this.location.floor_id
      );
      this.location.parent_id = (
        this.location.parent_id === 'null' ?
          JSON.parse(this.location.parent_id) :
          this.location.parent_id
      );
      this.location.parent_name = (
        this.location.parent_name === 'null' ?
          JSON.parse(this.location.parent_name) :
          this.location.parent_name
      );
    }
  }
}
