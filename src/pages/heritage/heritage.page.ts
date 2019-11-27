import * as stripHtml from 'string-strip-html';
import 'rxjs/add/operator/take';

import { Component, OnInit, OnDestroy } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { Subscription}  from '../../../node_modules/rxjs';

import { NotificationsService } from '../../providers/notifications.service';

import { MapService } from '../../providers/map.service';
import { ToursService } from '../../providers/tours.service';

import { AppSettings } from '../../app/app.settings';
import { AppUtils } from '../../app/app.utils';

@Component({
  selector: 'w2g-heritage',
  templateUrl: 'heritage.page.html',
  styleUrls: [ 'heritage.page.scss' ]
})
export class HeritagePage implements OnInit, OnDestroy {
  private timelineTypes: any[] = AppSettings.TIMELINE_TYPES;

  public tourId: string;
  public tourIds: string[] = [];
  public tour: any;
  public point: any;
  public timeline: any;
  public timelinePoint: any;
  private html;
  public tourImage= "https://apps.uob.wai2go.com/api/media/5d79d842e093a815c5a91a85/raw";
  private popCss: any[] = ['90px', '35px', '93%', 'initial'];
  private infoCss: any[] = ['0px', '65px', '88%'];
  private topPop: string;

  private timelineOptions = {
    width: '100%',
    height: '175px',
    moveable: false,
    zoomable: false,
    showCurrentTime: false,
    format: {
      minorLabels: (date, scale, step) => {
        const year = new Date(date).getFullYear();
        if (year == 0) {
          return 0;
        }
        return year < 0 ? -year + ' BC' : year + ' AD';
      }
    }
  };

  public showInfo: boolean = false;
  private spinnerColor: string;
  private disabled_tf: boolean;
  private notificationSubscription: Subscription;

  constructor(
    private mapService: MapService,
    private toursService: ToursService,
    private NotifiService: NotificationsService,
    private domSanitizer: DomSanitizer,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.mapService.disabled_tf
      .subscribe(data => {
        this.disabled_tf = data;
        if (this.disabled_tf === true ) {
          this.infoCss = ['770px', '155px', '80%'];
        } else {
          this.infoCss = [ this.topPop, '65px', '88%'];
        }
      });

    this.notificationSubscription = this.NotifiService.showingNotification.subscribe((data) => {
      if (data === true ) {
        this.topPop = '90px';
        if (this.disabled_tf === false) {
          this.infoCss[0] = '90px';
        } else {
          this.infoCss[0] = '770px';
        }
      } else {
        this.topPop = '0px';
        if (this.disabled_tf === false) {
          this.infoCss[0] = '0px';
        } else {
          this.infoCss[0] = '770px';
        }
      }
    });

    this.route.params.subscribe((params: any) => {
      if (params.tourIds) {
        this.tourIds = params.tourIds.split(',');
        this.tourId = this.tourIds[0];
      }
      else {
        this.tourId = AppSettings.DEFAULT_TOUR_ID;
      }

      const mapTours = [];
      let counter = this.tourIds.length;
      const checkDone = () => {
        if (--counter == 0) {
          this.mapService.rawTours.next(mapTours);
        }
      };

      for (let i = 0; i < this.tourIds.length; i++) {
        const tourId = this.tourIds[i];

        this.toursService
          .get(tourId)
          .take(1)
          .subscribe((tour) => {
            if (tour.error) {
              return console.error(tour.error);
            }

            this.tour = tour;

            if (i == 0) {
              this.mapService.tourPoint
                .subscribe(async point => {
                  if (point) {
                    await this.setPoint(point);
                  }
                });
            }


            this.tour.poi = this.tour.poi.map(point => {
              point.icon = AppSettings.TOUR_MARKER_ICONS && AppSettings.TOUR_MARKER_ICONS[tourId] ? AppSettings.TOUR_MARKER_ICONS[tourId] : AppSettings.TOUR_MARKER_ICON;
              point.className = 'heritage-marker';
              if (point.timelines.length > 0) {
                point.className += ' timeline-marker';
              }
              if (AppSettings.TOUR_MARKER_CLASSNAMES && AppSettings.TOUR_MARKER_CLASSNAMES[tourId]) {
                point.className += ` ${AppSettings.TOUR_MARKER_CLASSNAMES[tourId]}`;
              }
              return point;
            });

            mapTours.push(this.tour);

            if (i == 0) {
              this.mapService.tourPoint.next(this.tour.poi[0]);
            }
            checkDone();
          });
      }
    });

    this.mapService.spinnerColor
      .subscribe(color => this.spinnerColor = color);
  }

  ngOnDestroy() {
    this.mapService.tour.next(null);
    this.mapService.loading.next(false);
  }

  async setPoint(point) {
    this.html = null;
    this.tourImage = null;
    this.showInfo = false;

    this.point = {
      ...point,
      name: (
        point.type === 'intro' ?
          (
            AppSettings.TOUR_INTRO_NAME ||
            point.name
          ) :
          point.name
      ),
      timelineTypes: point.timelines.map(
        timeline => timeline.type
      )
    };

    if (this.point.html) {
      const htmlText = stripHtml(
        this.point.html,
        {
          onlyStripTags: ['img']
        }
      );

      const htmlImage = AppUtils.getHtmlTag(
        this.point.html,
        'img'
      );

      this.html = this.domSanitizer.bypassSecurityTrustHtml(htmlText);
      
      const tourImage = (
        htmlImage ?
          htmlImage.src :
          AppSettings.TOUR_DEFAULT_IMAGE
      );

      if (tourImage) {
        this.mapService.loading.next(true);

        this.tourImage = await AppUtils.toDataURL(
          tourImage
        );

        this.mapService.loading.next(false);
      }

      this.showInfo = true;
    }

    if (this.point.timelines.length > 0) {
      const timelineType = this.timelineTypes.filter(type => type.value == this.point.timelines[0].type)[0];
      if (timelineType) {
        this.setTimeline(timelineType);
      }
    }
    else {
      this.timeline = null;
    }

    this.timelinePoint = null;
  }

  setTimeline(type) {
    this.timeline = this.point.timelines.filter(timeline => timeline.type == type.value)[0];
    for (let i = 0; i < this.timelineTypes.length; i++) {
      if (this.timelineTypes[i].type == this.timeline.type) {
        this.timelineTypes[i].label = this.timeline.typeLabel;
      }
    }

    if (this.timeline) {
      this.timeline.pointData = this.timeline.points
        .map(point => {
          const year = new Date(point.date).getFullYear();
          return {
            id: point._id,
            content: `<span class="name">${point.name}</span><br/><span class="date">${year < 0 ? -year + ' BC' : year + ' AD'}</span>`,
            start: point.date
          };
        });

      //this.timeline.typeLabel = type.label;

      if (!this.html) {
        if (this.timeline.points.length > 0 && this.timeline.points[0].html) {
          this.html = this.domSanitizer.bypassSecurityTrustHtml(this.timeline.points[0].html);
          this.showInfo = true;
        }
        else {
          this.html = null;
          this.showInfo = false;
        }
      }
    }
  }

  setTimelinePoint(pointId) {
    this.timelinePoint = this.timeline.points.filter(point => point._id == pointId)[0];
    if (this.timelinePoint && this.timelinePoint.html) {
      this.html = this.domSanitizer.bypassSecurityTrustHtml(this.timelinePoint.html);
    }
  }

  hideInfo() {
    this.showInfo = false;
  }
}
