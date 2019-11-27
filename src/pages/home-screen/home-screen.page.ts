import { Component, OnInit, HostBinding } from '@angular/core';
import { Router } from '@angular/router';

import * as turf from '@turf/turf';
import 'rxjs/add/operator/take';

import { LocationsService } from '../../providers/locations.service';
import { MapService } from '../../providers/map.service';
import { NotificationsService } from '../../providers/notifications.service';
import { SurveysService } from '../../providers/surveys.service';

import { AppSettings } from '../../app/app.settings';
import { AppUtils } from '../../app/app.utils';

@Component({
  selector: 'w2g-home-screen',
  templateUrl: 'home-screen.page.html',
  styleUrls: ['home-screen.page.scss']
})
export class HomeScreenPage implements OnInit {
  public media = AppSettings.HOME_MEDIA;
  public showMediaCaption = AppSettings.HOME_MEDIA_CAPTION_SHOW;
  public notifications = [];

  public homeScreenButtons: any[] = AppSettings.HOME_SCREEN_BUTTONS;

  public carouselInteractive: boolean = true;

  constructor(
    private locationsService: LocationsService,
    private mapService: MapService,
    private notificationsService: NotificationsService,
    private surveysService: SurveysService,
    private router: Router
  ) { }

  ngOnInit() {
    console.log(this.router.url);
    this.notificationsService.notificationsSubject
      .subscribe((notifications) => {
        if (notifications) {
          this.notifications = notifications;
        }
      });
  }


  onPress(medium) {
    if (
      medium.locationId ||
      medium.point
    ) {
      return this.getDirections(medium);
    }
    else if (medium.surveyId) {
      return this.getSurvey(medium);
    }
  }

  getDirections(medium) {
    this.router.navigate(['/around-me/remote'], { queryParamsHandling: "preserve" });

    if (AppSettings.ROUTING_GPS_ONLY) {
      if (medium.point) {
        this.mapService.directionsDestination.next(`${medium.point[1]},${medium.point[0]},${AppSettings.FLOOR_ID}`);
      }
      else if (medium.locationId) {
        this.locationsService
          .get(medium.locationId, {
            context: AppUtils.getContext()
          })
          .then(location => {
            this.mapService.getpopupinfo.next(location);
            this.mapService.location.next(location);
          });
      }
    }
    else if (medium.locationId) {
      this.mapService.directionsDestination.next(medium.locationId);
    }
  }

  getSurvey(medium) {
    this.surveysService
      .get(medium.surveyId)
      .take(1)
      .subscribe(survey => {
        this.surveysService.activeSurvey.next(survey);
      });
  }
}
