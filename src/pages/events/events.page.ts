import * as moment from 'moment';

import {Component, OnInit, OnDestroy, HostBinding} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import 'rxjs/add/operator/take';

import { EventsService } from '../../providers/events.service';
import { MapService } from '../../providers/map.service';
import {NotificationsService} from '../../providers/notifications.service';

import { AppSettings } from '../../app/app.settings';
import * as turf from '@turf/turf';
import {p} from '@angular/core/src/render3';

@Component({
  selector: 'w2g-events',
  templateUrl: 'events.page.html',
  styleUrls: [ 'events.page.scss' ]
})
export class EventsPage implements OnInit, OnDestroy {
  @HostBinding('class.has-header') hasHeader: boolean = AppSettings.SHOW_HEADER && !AppSettings.SHOW_HEADER_ONLY_ON_HOME;
  @HostBinding('class.has-sidebar') hasSidebar: boolean = AppSettings.MENU_SIDEBAR;
  @HostBinding('class.has-subsidebar') hasSubSidebar: boolean = AppSettings.MENU_SUBSIDEBAR;

  public noevents = false;
  private menuButtons: any[] = AppSettings.EVENTS_BUTTONS;
  public themeColor: any = AppSettings.THEME_COLORS['events'];
  private routerSubscription: any;
  public showMenu: boolean = true;
  private page: string;
  private eventsToday: any[];
  private Einfo: any[];
  private eventMarkers: any[];
  public EventCss: any[] = ['0px', '65px', '88%', 'initial'];
  public disabled_tf: boolean;
  public showingInfo: boolean = false;
  private eventWindow: boolean = true;
  private eventIdSubscription: Subscription;
  private notificationSubscription: Subscription;
  private topPop: string;



  constructor(
    private eventsService: EventsService,
    private mapService: MapService,
    private route: ActivatedRoute,
    private  NotifiService: NotificationsService

  ) { }

  ngOnInit() {
    this.mapService.ready
      .subscribe(ready => {
        if (ready) {
          let curr = new Date;
          let date = curr.getDate();
          let weeklast = date + 6;

          let lastday = new Date(curr.setDate(weeklast)).toISOString();
          this.route.params
            .subscribe((params) => {
              curr = new Date;
              date = curr.getDate();
              weeklast = date + 6;

              let featured = false;
              let page = '';
              let noCatgegoryId = true;
              if (params.page) {
                page = params.page;
                if (params.page === 'week') {
                  weeklast = date + 7;
                  lastday = new Date(curr.setDate(weeklast)).toISOString();
                } else if (params.page === 'month') {
                  weeklast = date + 30;
                  lastday = new Date(curr.setDate(weeklast)).toISOString();
                } else {
                  weeklast = date + 30;
                  lastday = new Date(curr.setDate(weeklast)).toISOString();
                }
                if (params.page === 'featured') {
                  featured = true;
                  lastday = new Date(curr.setDate(date + 180)).toISOString();
                }
                if (params.page !== 'week' && params.page !== 'month' && params.page !== 'featured') {
                  noCatgegoryId = false;
                }
              } else {
                weeklast = date + 1;
                lastday = new Date(curr.setDate(weeklast)).toISOString();
              }
              if (noCatgegoryId === false) {
                this.eventsService
                  .getAllByCategoryId(AppSettings.PROJECT_ID, page, lastday, featured)
                  .take(1)
                  .subscribe((data) => {
                    setTimeout(() => {
                      this.responseHandler(data);
                    }, 300);
                  });
              } else {
                this.eventsService
                  .newGetAll(AppSettings.PROJECT_ID, lastday, featured)
                  .take(1)
                  .subscribe((data) => {
                    setTimeout(() => {
                      this.responseHandler(data);
                    }, 300);
                  });
              }
            });


          // Subscribe to parameter changes since the activated route around-me is seen as common for all menu options
          this.routerSubscription = this.route.params.subscribe((params) => {
            this.page = params.page;

            this.showMenu = true;
          });


          this.mapService.disabled_tf
            .subscribe(data => {

              this.disabled_tf = data;
              if (this.disabled_tf === true) {
                if (this.showingInfo === true) {
                  this.EventCss = ['980px', '155px', '80%'];
                } else {
                  this.EventCss = ['880px', '155px', '80%'];
                }
              } else {
                this.EventCss = [this.topPop, '65px', '88%'];
              }
            });

          this.notificationSubscription = this.NotifiService.showingNotification.subscribe((data) => {
            if (data === true) {
              this.topPop = '90px';
              if (this.disabled_tf === false) {
                this.EventCss[0] = '90px';
              } else {
                this.EventCss[0] = '880px';
              }
            } else {
              this.topPop = '0px';
              if (this.disabled_tf === false) {
                this.EventCss[0] = '0px';
              } else {
                this.EventCss[0] = '880px';
              }
            }
          });

          this.eventIdSubscription = this.eventsService.eventsIdService.subscribe(data => {
            if (data != null) {
              this.getevent(data.eventid, false);
            }

          });
        }
      });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    if (this.eventIdSubscription) {
      this.eventIdSubscription.unsubscribe();
    }

    if (this.notificationSubscription) {
      this.notificationSubscription.unsubscribe();
    }

    this.eventsService.reset();
  }


  responseHandler(data) {
    this.showingInfo = false;

    this.eventsToday = this.mapevents(data);
    if (this.eventsToday.length === 0) {
      this.noevents = true;
    } else {
      this.noevents = false;
    }

  }
  mapevents(data) {
    const eventPoints = [];
    const newdata = [];
    let i = 0;
    for (let x in data) {
      newdata[i] = [];
      newdata[i].date = moment(x, 'DD/MM/YYYY').format('Do MMMM YYYY');
      newdata[i].val = data[x];
      // newdata[i].newdate = new Date(x);

      for (let y of data[x]) {
        y.categories = y.categories ? y.categories.map(category => category.name).join(', ').split(', ').slice(0, 3).join(', ') : null;

        const lat = y.gpsLat;
        const lon = y.gpsLon;
        const name = y.displayName;
        const point = [lon, lat];
        const idpoint = [lat, lon];
        const icon = `${AppSettings.EVENT_MARKER_ICON}`;
        const className = 'event-marker';
        if (point[0] != null) {
          eventPoints.push( {
            name: name,
            point : point,
            icon: icon,
            eventid: y._id,
            id: idpoint,
            className: className
          });
        }
      }
      i = i + 1;
    }
    this.eventMarkers = eventPoints;
    this.mapService.annotations.next(this.eventMarkers);
    return newdata;
  }

  private getevent(id, map) {
    this.eventsService
      .get(id)
      .take(1)
      .subscribe((data) => {
        this.Einfo = data;
        if(data.gpsLat !== null && data.gpsLon !== null ) {
          if (map === true) {
            this.mapService.directionsDestination.next(`${data.gpsLat},${data.gpsLon},${AppSettings.FLOOR_ID},${data.floorId ? data.floorId : null}`);
          }
        }
        this.showingInfo = true;
        if (this.disabled_tf === true) {
          this.EventCss = ['980px', '155px', '80%'];
        } else {
          this.EventCss = [ this.topPop, '65px', '88%'];
        }
      });

  }

  closeMenu() {
    this.showMenu = false;
  }

  closeEinfo() {
    this.showingInfo = false;
    this.mapService.annotations.next(this.eventMarkers);
    if (this.disabled_tf === true) {
      this.EventCss = ['880px', '155px', '80%'];
    } else {
      this.EventCss = [ this.topPop, '65px', '88%'];
    }
  }


  windowFun() {
    if (this.EventCss[0] === '1304px' || this.EventCss[3] === '65px') {
      this.eventWindow = true;
      if (this.disabled_tf === true) {
          this.EventCss = ['880px', '155px', '80%'];
      } else {
        this.EventCss = [this.topPop, '65px', '88%', 'initial'];
      }
    } else {
      this.eventWindow = false;
      if (this.disabled_tf === true) {
        this.EventCss[0] = '1304px';
      } else {
        this.EventCss[3] = '65px';
      }

    }

  }



  isActive(button) {
    return (this.page && button.url.endsWith(this.page)) || !(this.page || button.url.split('/')[2]);
  }
}
