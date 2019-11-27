import {Component, OnInit, OnDestroy, ViewChild, ElementRef, HostBinding} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';

import 'rxjs/add/operator/take';

import {ActivityService} from '../../providers/activity.service';
import {AnnotationsService} from '../../providers/annotations.service';
import {GeocodeService} from '../../providers/geocode.service';
import {LocationsService} from '../../providers/locations.service';
import {MapService} from '../../providers/map.service';
import {TransportService} from '../../providers/transport.service';
import {ToursService} from '../../providers/tours.service';

import {AppSettings} from '../../app/app.settings';
import {AppUtils} from '../../app/app.utils';

import {KeyboardService} from '../../providers/keyboard.service';
import {NotificationsService} from '../../providers/notifications.service';
import {FormControl} from '@angular/forms';
import {MatAutocompleteTrigger} from '@angular/material';
import {MatTabChangeEvent} from '@angular/material';
import {DomSanitizer} from '@angular/platform-browser';
import {isNumber} from 'util';
import * as moment from 'moment';
import * as mapboxgl from "mapbox-gl";


@Component({
  selector: 'w2g-transport',
  templateUrl: 'transport.page.html',
  styleUrls: ['transport.page.scss']
})
export class TransportPage implements OnInit, OnDestroy {
  @HostBinding('class.has-header') hasHeader: boolean = AppSettings.SHOW_HEADER && !AppSettings.SHOW_HEADER_ONLY_ON_HOME;
  @HostBinding('class.has-sidebar') hasSidebar: boolean = AppSettings.MENU_SIDEBAR;
  @HostBinding('class.has-subsidebar') hasSubSidebar: boolean = AppSettings.MENU_SUBSIDEBAR;

  @ViewChild('JourneyToinput') JourneyToinput: ElementRef;
  @ViewChild(MatAutocompleteTrigger) autocompleteTrigger: MatAutocompleteTrigger;

  JourneyTo: string;

  private filteredLocation: any[];
  private subscription;
  private keyboardSubscription;
  private destinationSubscription;
  private bounds;

  private menuButtons = AppSettings.TRANSPORT_BUTTONS;
  private routerSubscription: any;
  public showMenu: boolean = true;
  public isFullSize: boolean = AppSettings.FULL_SIZE;
  public themeColor: any = AppSettings.THEME_COLORS['transport'];

  private activeStopId: string;
  private departures: any[] = [];
  private departurespopup = false;
  private spinnerControl = false;
  private spinnerControl1 = false;
  private errorMessage: any = false;
  private stopName: any;
  private stopsOfBus: any;
  private stopsOfTrain: any;
  private JourneyFrom: any;
  private Journeytime: any;
  private tabbletoggle: any = true;
  public plannerPopup: boolean;
  public departurePopup: boolean;
  private popular_locations: any[] = AppSettings.POPULAR_LOCATIONS.sort((locationA, locationB) => locationA.name.localeCompare(locationB.name));
  private kios_location: any[] = AppSettings.CENTER;
  // private JOURNEY_PAINT: any[] = AppSettings.JOURNEY_PAINT;
  private journeyParam: any;
  private userInput: any;
  private locationAutocomplete: any[];
  private lat: any;
  private lng: any;
  private journeyresults: any;
  public showingresults: boolean = false;
  private showkeyboard: boolean = false;
  private selectedIndex: any = 0;
  private page: string;
  private plannerCss: any[] = ['0px', '65px', '88%', 'initial'];
  private departureCss: any[] = ['0px', '65px', '88%'];
  private disabled_tf: boolean;
  private plannerWindow: boolean = true;
  private NoRotuesErr: boolean = false;
  private spinnerColor: string;
  private notificationSubscription: Subscription;
  private topPop: string;
  private errM: string;
  private apitimmer: any;

  public journeyPlannerHeading: string = 'Journey Planner';
  public startTime: string;
  public inwalkingpage: boolean = false;
  public incyclepage: boolean = false;
  public newsearchBool: boolean = false;


  constructor(
    private activityService: ActivityService,
    private annotationsService: AnnotationsService,
    private geocodeService: GeocodeService,
    private locationsService: LocationsService,
    private mapService: MapService,
    private transportService: TransportService,
    private toursService: ToursService,
    private route: ActivatedRoute,
    private router: Router,
    private keyboard: KeyboardService,
    private Domsanitizer: DomSanitizer,
    private NotifiService: NotificationsService
  ) {
  }

  ngOnInit() {
    this.mapService.ready
      .subscribe(ready => {
        if (ready) {
          this.mapService.disabled_tf
            .subscribe(data => {
              this.disabled_tf = data;
              if (this.disabled_tf === true) {
                this.departureCss = ['880px', '155px', '80%'];
                if (this.showkeyboard === true) {
                  this.plannerCss = ['550px', '50px', '80%'];
                } else {
                  this.plannerCss = ['793px', '50px', '80%'];
                }
              } else {
                this.departureCss = [this.topPop, '65px', '88%'];
                this.plannerCss = [this.topPop, '0px', '88%'];
              }

            });

          this.notificationSubscription = this.NotifiService.showingNotification.subscribe((data) => {
            if (data === true) {
              this.topPop = '90px';
              if (this.disabled_tf === false) {
                this.departureCss[0] = '90px';
                this.plannerCss[0] = '90px';
              } else {
                this.departureCss[0] = '800px';
                this.plannerCss[0] = '800px';
              }
            } else {
              this.topPop = '0px';
              if (this.disabled_tf === false) {
                this.departureCss[0] = '0px';
                this.plannerCss[0] = '0px';
              } else {
                this.departureCss[0] = '800px';
                this.plannerCss[0] = '800px';
              }
            }

          });

          this.journeyParam = 0;
          this.departurePopup = false;
          this.route.params
            .subscribe((params) => {
              this.page = params.page;
              this.showMenu = true;

              this.inwalkingpage = false;
              this.incyclepage = false;

              if (this.page) {
                this.showkeyboard = false;
                if (this.page.includes('rail')) {
                  if (params.locationId !== this.activeStopId) {
                    if (this.bounds) {
                      this.getAnnotations(this.page);
                    }

                    this.getServices(params.locationId);
                  }
                } else {
                  this.mapService.annotations.next(null);
                }
                if (this.page.includes('cycle')) {
                  this.getCyclepaths();
                }
                if (this.page === 'planner') {
                  this.startTime = new Date().toLocaleString().substr(12, 5);
                  this.journeyPlannerHeading = 'Journey Planner';
                  this.plannerPopup = true;
                  this.destinationSubscription = this.mapService.journeyDestination
                    .subscribe((destination) => {
                      if (destination) {
                        this.selectedIndex = 1;
                        this.showingresults = false;
                        if (this.disabled_tf) {
                          this.plannerCss = ['800px', '50px', '80%'];
                        } else {
                          this.plannerCss = [this.topPop, '0px', '88%'];
                        }
                        this.JourneyTo = destination.name;
                        const data = {
                          value: this.JourneyTo,
                          update: true
                        };
                        this.keyboard.keyboard.next(data);
                        this.lat = destination.point.lat;
                        this.lng = destination.point.lng;
                        this.showkeyboard = false;
                        this.newsearchBool = true;
                        setTimeout(() => {
                          if (this.autocompleteTrigger) {
                            this.autocompleteTrigger.closePanel();
                          }
                        }, 300);
                      }
                    });
                } else {
                  const data = {
                    value: '',
                    update: true
                  };
                  this.keyboard.keyboard.next(data);
                  this.newsearchBool = false;

                  // Attempt to unsubscribe from any keyboard or destination subscription whenever an internal page navigation away from the planner is made
                  // if (this.keyboardSubscription) {
                  //   this.keyboardSubscription.unsubscribe();
                  // }

                  if (this.destinationSubscription) {
                    this.destinationSubscription.unsubscribe();
                  }

                  this.plannerPopup = false;
                  this.mapService.journey.next(null);
                }
                if (this.page === 'walking') {
                  this.inwalkingpage = true;
                }
                if (this.page === 'cycle') {
                  this.incyclepage = true;
                }

                if (this.page === 'parking') {
                  let parkingCategoryIds = AppSettings.PARKING_CATEGORY_IDS;
                  if (this.disabled_tf) {
                    parkingCategoryIds = parkingCategoryIds.concat(AppSettings.PARKING_ACCESSIBLE_CATEGORY_IDS);
                  }

                  let annotations = [];
                  let counter = parkingCategoryIds.length;
                  const checkDone = () => {
                    if (--counter == 0) {
                      this.mapService.annotations.next(annotations);
                    }
                  };

                  for (let i = 0; i < parkingCategoryIds.length; i++) {
                    const categoryId = parkingCategoryIds[i];
                    this.locationsService
                      .getByCategoryId(categoryId)
                      .then(data => {
                        annotations = annotations.concat(data.locations);
                        checkDone();
                      });
                  }
                }
              }
              else {
                // Attempt to unsubscribe from any keyboard or destination subscription whenever a navigation to buses or departures is performed
                if (this.keyboardSubscription) {
                  this.keyboardSubscription.unsubscribe();
                }

                if (this.destinationSubscription) {
                  this.destinationSubscription.unsubscribe();
                }

                this.plannerPopup = false;
                this.mapService.journey.next(null);

                if (params.locationId !== this.activeStopId) {
                  if (this.bounds) {
                    this.getAnnotations();
                  }

                  this.getServices(params.locationId);
                }
              }
            });
          this.subscription = this.mapService.bounds
            .subscribe((bounds) => {
              if (bounds) {
                this.bounds = bounds;

                if (!this.page) {
                  this.getAnnotations();
                }
                else if (this.page.includes('rail')) {
                  this.getAnnotations(this.page);
                }
                /*else if (this.page.includes('cycle')) {
                 this.getCyclepaths();
                 }*/
              }
            });
          this.keyboardSubscription = this.keyboard.keyboard.subscribe((data) => {
            // this.JourneyTo = data.value;
            if (data != null) {
              if (data.value !== undefined && data.value !== null && this.plannerPopup) {
                this.JourneyTo = data.value.toUpperCase();

                if (this.JourneyToinput) {
                  setTimeout(() => {
                    if (this.autocompleteTrigger) {
                      this.autocompleteTrigger.openPanel();
                    }
                  }, 300);
                }

                if (data.value.length > 1) {
                  if (this.apitimmer) {
                    clearTimeout(this.apitimmer);
                  }
                  this.apitimmer = setTimeout(() => {
                    this.geocodeService.autocomplete(data.value, this.mapService.projectId.getValue(), this.mapService.campusId.getValue())
                      .take(1)
                      .subscribe((result) => {
                        this.filteredLocation = result;
                      });
                  }, 500);
                }
              }
            }
          });

          this.mapService.spinnerColor
            .subscribe(color => this.spinnerColor = color);
        }
      });
  }

  ngOnDestroy() {
    const data = {
      value: null,
      update: false
    };
    this.keyboard.keyboard.next(data);

    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    if (this.keyboardSubscription) {
      this.keyboardSubscription.unsubscribe();
    }

    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }
  }

  clear_search_fornew() {
    this.newsearchBool = false;
    this.journeyParam = 0;
    const data = {
      value: '',
      update: true
    };
    this.keyboard.keyboard.next(data);
    this.showkeyboard = true;
    setTimeout(() => {
      if (this.autocompleteTrigger) {
        this.autocompleteTrigger.closePanel();
      }
    }, 300);
  }

  closeMenu() {
    this.showMenu = false;
    // if (this.plannerCss[0] === '1300px') {
    //   this.plannerCss[0] = '1456px';
    // }
  }

  private fromPopularLocation(location) {
    const loc = location.gpsLon + ',' + location.gpsLat;
    const dest = location.name;
    const today = new Date();
    let dd: any = today.getDate();
    let mm: any = today.getMonth() + 1;
    const yyyy = today.getFullYear();

    if (dd < 10) {
      dd = '0' + dd.toString();
    }

    if (mm < 10) {
      mm = '0' + mm.toString();
    }
    let timeH = today.getHours().toString();
    let timeM = today.getMinutes().toString();

    if (parseInt(timeH, 10) < 10) {
      timeH = '0' + timeH.toString();
    }

    if (parseInt(timeM, 10) < 10) {
      timeM = '0' + timeM.toString();
    }

    const time = timeH + ':' + timeM;

    const date = yyyy + '-' + mm + '-' + dd;
    this.getJourneyFun(this.kios_location, loc, dest, time, date, 'fastest');
  }

  private onResultSelected(result) {
    this.JourneyTo = result.option.value.name;
    this.lat = result.option.value.lat;
    this.lng = result.option.value.lng;
    const data = {
      value: this.JourneyTo,
      update: true
    };
    this.keyboard.keyboard.next(data);
    setTimeout(() => {
      if (this.autocompleteTrigger) {
        this.autocompleteTrigger.closePanel();
      }
    }, 300);


  }

  onLinkClick(event: MatTabChangeEvent) {
    if (event.index === 1) {
      if (this.newsearchBool === false) {
        this.showkeyboard = true;
      }
      if (this.disabled_tf === true) {
        this.plannerCss[0] = '550px';
      }
    }
    if (event.index === 0) {
      this.showkeyboard = false;
      if (this.disabled_tf === true) {
        this.plannerCss[0] = '800px';
      }
    }
  }

  onJourneyClick(event: MatTabChangeEvent) {
    this.drawPolylines(this.journeyresults[event.index]);
  }

  drawPolylines(journey) {
    this.mapService.journey.next(journey);
  }

  private toPopularDestination() {
    this.startTime = new Date().toLocaleString().substr(12, 5);
    this.journeyPlannerHeading = 'Journey Planner';
    this.showingresults = false;
    this.selectedIndex = 0;
    this.mapService.journey.next(null);
  }

  private toSearch() {
    const data = {
      value: '',
      update: true
    };
    this.startTime = new Date().toLocaleString().substr(12, 5);
    this.journeyPlannerHeading = 'Journey Planner';
    this.keyboard.keyboard.next(data);
    this.newsearchBool = false;
    if (this.disabled_tf === true) {
      this.plannerCss[0] = '550px';
    }
    this.mapService.journey.next(null);
    this.JourneyTo = null;
    this.showingresults = false;
    this.showkeyboard = true;
    this.selectedIndex = 1;
  }

  private toeditSearch() {
    const data = {
      value: this.JourneyTo,
      update: true
    };
    this.journeyPlannerHeading = 'Journey Planner';
    this.keyboard.keyboard.next(data);
    if (this.disabled_tf === true) {
      this.plannerCss[0] = '550px';
    }
    this.showingresults = false;
    this.showkeyboard = true;
    this.selectedIndex = 1;
  }

  private get_Loc_from_map() {
    this.plannerCss[0] = '1300px';
    // this.planner_css_top = '1300px';
  }

  private closeplanner() {
    if (this.plannerCss[0] === '1300px' || this.plannerCss[3] === '72px') {
      this.plannerWindow = true;
      if (this.disabled_tf === true) {
        if (this.showkeyboard === true) {
          this.plannerCss = ['550px', '50px', '80%'];
        } else {
          this.plannerCss = ['800px', '50px', '80%'];
        }
      } else {
        this.plannerCss = [this.topPop, '0px', '88%', 'initial'];
        if (this.selectedIndex === 1) {
          this.showkeyboard = true;
        }
      }
    } else {
      this.plannerWindow = false;
      if (this.disabled_tf === true) {
        this.plannerCss[0] = '1300px';
      } else {
        this.plannerCss[3] = '72px';
        this.showkeyboard = false;
      }

    }
  }

  getAnnotations(page: string = 'bus') {
    this.annotationsService
      .getByModuleBounds(
        (
          page.includes('rail') ?
            AppSettings.TRANSPORT_RAIL_CATEGORY_ID :
            AppSettings.TRANSPORT_CATEGORY_ID
        ),
        this.mapService.projectId.getValue(),
        this.mapService.bounds.getValue()
      )
      .then((annotations) => {
        this.mapService.annotations.next(annotations);
      });
  }

  getCyclepaths() {
    this.toursService
      .getMulti(AppSettings.CYCLEPATH_TOUR_IDS)
      .take(1)
      .subscribe(tours => {
        this.mapService.rawTours.next(tours.map(tour => {
          tour.poi = tour.poi.map(point => {
            point.icon = `${AppSettings.CYCLEPATH_MARKER_ICON}`;
            point.className = 'transport-marker';
            return point;
          });
          return tour;
        }));
      });
  }

  private closeDepartures() {
    this.departurespopup = false;
    this.activityService.event.next('hide-departures');
    this.router.navigate([this.page ? `/transport/${this.page}` : '/transport'], { queryParamsHandling: "preserve" });
  }

  private closestopsList() {
    this.tabbletoggle = true;
  }

  private JourneySearchFunction() {
    const sortModes = [
      'fastest',
      'fewest-change',
      'least-walking'
    ];
    const sortMode = sortModes[this.journeyParam];
    const loc = this.lng + ',' + this.lat;
    const today = new Date();
    let dd: any = today.getDate();
    let mm: any = today.getMonth() + 1;
    const yyyy = today.getFullYear();

    if (dd < 10) {
      dd = '0' + dd.toString();
    }

    if (mm < 10) {
      mm = '0' + mm.toString();
    }

    const date = yyyy + '-' + mm + '-' + dd;
    if (typeof this.lng !== 'undefined' && typeof this.lat !== 'undefined') {
      let destination =  this.JourneyTo;
      if (destination.includes(',')) {
        destination = AppUtils.toTitleCase(this.JourneyTo.split(',')[0].toLowerCase());
        let number = parseInt(destination);
        if (!isNaN(number)) {
          destination = `${number},${AppUtils.toTitleCase(this.JourneyTo.split(',')[1].toLowerCase())}`
        }
        this.getJourneyFun(this.kios_location, loc, destination, this.startTime, date, sortMode);
      }
      else {
        this.getJourneyFun(this.kios_location, loc, destination, this.startTime, date, sortMode);
      }
    }
  }

  private getJourneyFun(kios_location, loc, destination, usertime, date, sortMode) {
    if (this.disabled_tf === true) {
      this.plannerCss = ['800px', '65px', '80%'];
    }
    this.spinnerControl1 = true;
    this.showkeyboard = false;
    this.NoRotuesErr = false;
    this.transportService.getJourney(kios_location, loc, destination, usertime, date, sortMode)
      .take(1)
      .subscribe((data) => {
        if (data.hasOwnProperty('routes')) {
          const formated = data.routes;
          for (let i in formated) {
              formated[i].duration = formated[i].duration.split(':');
              for (let x in formated[i].route_parts) {
              formated[i].route_parts[x].duration = formated[i].route_parts[x].duration.split(':');
              formated[i].route_parts[x] = this.info_function(formated[i].route_parts[x]);
            }
          }
          this.journeyresults = formated.slice(0, 3);
          this.spinnerControl1 = false;
          this.showingresults = true;

          this.drawPolylines(this.journeyresults[0]);
          this.journeyPlannerHeading = 'Journey Planner - Tap on Step number to view on Map';

          // localStorage.setItem('api', JSON.stringify(this.journeyresults));
        } else {
          this.journeyresults = null;
          this.spinnerControl1 = false;
          this.showingresults = true;
          this.NoRotuesErr = true;
          this.journeyPlannerHeading = 'Journey Planner';
        }
      });
  }

  private backTosearch() {
    this.showingresults = false;
  }

  private fitboundfunc(data, i ) {
      const bounds = data.route_parts[i].coordinates.reduce(function(bounds, coord) {
          return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(data.route_parts[i].coordinates[0], data.route_parts[i].coordinates[0]));
      this.mapService.fitboundservice.next(bounds);
  }

  private info_function(x) {

    const to = x.to_point_name;
    const departure_time = x.departure_time;
    const line = x.line_name;
    const provided_info = x.provided_info;

    x.boundpoint = [];
    x.boundpoint[1] = x.coordinates[x.coordinates.length - 1];
    x.boundpoint[0] = x.coordinates[0];
    x.info = '';
    x.icon = '';
    x.color = '';

    switch (x.mode) {
      case 'foot':
        x.icon = 'walk-planner-svg';
        x.color = AppSettings.JOURNEY_PAINT[x.mode]['line-color'];
        x.info = `<span>Walk to </span><span style="color:${x.color};">${to}</span>`;
        break;
      case 'bus':
        x.icon = 'bus-planner-svg';
        x.color = AppSettings.JOURNEY_PAINT[x.mode]['line-color'];
        x.info = `<span>Take the </span><span style="color:${x.color};">${line} bus to </span><span style="color:${x.color};"> ${to} at </span><span style="color:${x.color};">${departure_time}</span>`;
        break;
      case 'tube':
        x.icon = 'rail-planner-svg';
        x.color = AppSettings.JOURNEY_PAINT[x.mode]['line-color'];
        x.info = `<span>Take the </span><span style="color:${x.color};">${line} line tube to </span><span style="color:${x.color};">${to}</span>`;
        break;
      case 'train':
        x.icon = 'rail-planner-svg';
        x.color = AppSettings.JOURNEY_PAINT[x.mode]['line-color'];
        x.info = `<span>Take the </span><span style="color:${x.color};">${departure_time}</span><span> train to </span><span style="color:${x.color};"> ${to}</span>`;
        break;
      case 'rail':
        x.icon = 'rail-planner-svg';
        x.color = AppSettings.JOURNEY_PAINT[x.mode]['line-color'];
        x.info = `<span>Take the </span><span style="color:${x.color};">${departure_time}</span><span> train to </span><span style="color:${x.color};"> ${to}</span>`;
        break;
      case 'cycle':
        x.icon = 'walk-planner-svg';
        x.color = AppSettings.JOURNEY_PAINT[x.mode]['line-color'];
        x.info = `<span>${provided_info}</span>`;
        break;
      default:
        x.icon = 'walk-planner-svg';
        x.color = AppSettings.JOURNEY_PAINT[x.mode]['line-color'];
        x.info = `<span>Take the ${x.mode} to </span><span style="color:${x.color};">${to}</span>`;
        break;
    }
    if (Number(x.duration[0]) > 0) {
      x.duration[1] = Number(x.duration[1]) + (Number(x.duration[0]) * 60);
    }
    x.info = this.Domsanitizer.bypassSecurityTrustHtml(x.info);
    return x;

  }

  private DeparturesInfo(i) {
    if (this.page) {
      if (this.page.includes('rail')) {
        this.transportService.getTrainRoute(i, this.activeStopId)
          .take(1)
          .subscribe(data => {
            this.stopsOfTrain = data.stops;
            this.tabbletoggle = false;
          });
      }
    } else {
      this.spinnerControl = true;

      setTimeout(() => {
        this.transportService.getRoute(i, AppSettings.TRANSPORT_PROVIDER)
          .take(1)
          .subscribe(data => {
            this.stopsOfBus = data.stops;
            this.tabbletoggle = false;
            this.spinnerControl = false;

          });
      }, 500);
    }
  }

  timediff(data) {
    let newtime = '';
    let date1 = moment();
    let date2 = moment(data, ['H:m']);
    const diffInMs = date2.diff(date1, 'minutes');
    if (diffInMs < 0 || diffInMs === 0) {
      newtime = 'Due';
    } else {
      newtime = diffInMs.toString() + ' min';
    }

    if (diffInMs < 60) {
      return newtime;
    }
    else {
      return data;
    }
  }

  private getServices(locationId) {
    this.departurePopup = true;
    this.spinnerControl = true;
    this.departurespopup = false;
    this.errorMessage = null;
    this.tabbletoggle = true;

    const parseResponse = (data) => {
      try {
        this.stopName = data.stop_name || data.station_name;
        const departureMap = AppUtils.objectToMap(data.departures);
        let departures = [];
        departureMap.forEach((serviceDepartures, serviceNumber) => {
          departures = departures.concat(serviceDepartures);
        });

        this.departures = departures.map((departure) => {
          return {
            time: departure.best_departure_estimate,
            date: departure.date,
            line: departure.line || departure.platform,
            lineName: departure.line_name,
            destination: departure.direction,
            direction: departure.dir,
            operator: departure.operator,
            operatorName: departure.operator_name,
            atcoCode: data.atcocode,
            journeyId: departure.journey_id,
            live: departure.live,
            trainUid: departure.train_uid
          };
        }).sort(AppUtils.alphabetically('time'));

        this.activeStopId = locationId;

        this.errorMessage = this.departures.length === 0;
        if (this.errorMessage) {
          this.errM = 'No departures found';
          console.warn(`No departures found for ${this.page && this.page.includes('rail') ? 'train station' : 'bus stop'} ${locationId}`);
        }

        this.spinnerControl = false;
        this.departurespopup = true;
        this.activityService.event.next('show-departures');
      }
      catch (ex) {
        this.errM = 'No departures found';
        this.spinnerControl = false;
        this.departurespopup = true;
        this.errorMessage = true;
        console.warn(`Unexpected error occurred for ${this.page && this.page.includes('rail') ? 'train station' : 'bus stop'} ${locationId}`);
      }
    };

    if (this.page && this.page.includes('rail')) {
      this.transportService.getStationServices(locationId)
        .take(1)
        .subscribe((data) => parseResponse(data));
    }
    else {
      this.transportService.getServices(locationId, AppSettings.TRANSPORT_PROVIDER)
        .take(1)
        .subscribe((data) => parseResponse(data));
    }
  }

  isActive(button) {
    return (this.page && button.url.endsWith(this.page)) || !(this.page || button.url.split('/')[2]);
  }
}
