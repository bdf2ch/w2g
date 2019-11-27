import ordinal from 'ordinal';

import { Component, OnInit, HostListener } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { DomSanitizer } from "@angular/platform-browser";
import { MatIconRegistry } from "@angular/material";

import 'rxjs/add/operator/take';

import { AuthService } from '../providers/auth.service';
import { ActivityService } from '../providers/activity.service';
import { NotificationsService } from '../providers/notifications.service';
import { SocketService } from '../providers/socket.service';
import { SurveysService } from '../providers/surveys.service';

import { AppSettings } from './app.settings';
import { AppUtils } from './app.utils';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  @HostListener('window:mouseup', ['$event'])
  onMouseUp(event) {
    this.activityService.activity.next(event.type);
  }

  @HostListener('window:touchend', ['$event'])
  onTouchEnd(event) {
    this.activityService.activity.next(event.type);
  }

  public media = AppSettings.HOME_MEDIA;

  public carouselInteractive: boolean = true;

  public isAuth: boolean = false;
  public isNews: boolean = false;

  public spinnerColor: string;
  public spinnerStatusMessage = AppSettings.AUTH_STATUS_MESSAGE;

  public showHeader: boolean = AppSettings.SHOW_HEADER;
  public showFooter: boolean = AppSettings.SHOW_FOOTER;
  public menuSidebar: boolean = AppSettings.MENU_SIDEBAR;
  public showSubSidebar: boolean = AppSettings.MENU_SIDEBAR && AppSettings.MENU_SUBSIDEBAR;
  public isFullSize: boolean = AppSettings.FULL_SIZE;
  public isStaging: boolean = AppSettings.IS_STAGING;

  private instanceId: string;
  private screenName: string;
  private routeUrl: string;
  private firstNav: boolean = false;

  private notifications: any[] = [];
  private question: any;
  private survey: any;

  constructor(
    private activityService: ActivityService,
    private authService: AuthService,
    private notificationsService: NotificationsService,
    private socketService: SocketService,
    private surveysService: SurveysService,
    private router: Router,
    private route: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private iconRegistry: MatIconRegistry
  ) {
    for (const page in AppSettings.THEME_COLORS) {
      AppSettings.THEME_COLORS[page].lightHex = AppUtils.increaseBrightness(AppSettings.THEME_COLORS[page].hex, 0.3);
      AppSettings.THEME_COLORS[page].darkHex = AppUtils.reduceBrightness(AppSettings.THEME_COLORS[page].hex, 0.1);
    }

    this.spinnerColor = AppSettings.THEME_COLORS[this.router.url.split('/')[1].split('?')[0]].name;
    this.spinnerStatusMessage = AppSettings.AUTH_STATUS_MESSAGE;
  }

  ngOnInit() {
    this.routeUrl = this.router.url.split('?')[0];

    this.isNews = this.routeUrl.toLowerCase().includes('news');
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.routeUrl = event.url.split('?')[0];
        if (!this.firstNav && this.routeUrl == '/' && AppSettings.INITIAL_URL && AppSettings.INITIAL_URL.length > 1) {
          this.router.navigate([AppSettings.INITIAL_URL], {queryParamsHandling: "preserve"});
        }
        this.firstNav = true;

        this.isNews = this.routeUrl.toLowerCase().includes('news');

        this.showSubSidebar = AppSettings.MENU_SIDEBAR && AppSettings.MENU_SUBSIDEBAR &&
          !(this.routeUrl == '/' ||
            this.routeUrl.toLowerCase().includes('search') ||
            this.routeUrl.toLowerCase().includes('locations'));

        this.activityService.action.next({
          name: 'w2g-navigation',
          params: {
            url: this.routeUrl
          }
        });

        if (this.question && this.routeUrl && !this.routeUrl.startsWith(this.question.route)) {
          this.closeQuestion();
        }
      }
    });

    this.route.queryParams
      .subscribe((queryParams: any) => {
        if (queryParams.instanceId) {
          this.instanceId = queryParams.instanceId;
          this.screenName = queryParams.screenName;
          this.socketService.instanceId = queryParams.instanceId;
        }

        if (queryParams.staging == 'true') {
          this.isStaging = queryParams.staging;
          AppSettings.IS_STAGING = this.isStaging;
        }
      });

    const goReady = () => {
      this.isAuth = true;

      this.notificationsService
        .mostRecent
        .subscribe(notification => {
          this.notifications = notification ? [ notification ] : [ ];
        });

      this.surveysService
        .activeSurvey
        .subscribe(survey => {
          if (survey) {
            this.parseSurvey(survey);
          }
        });

      if (AppSettings.SURVEY_ID) {
        this.surveysService
          .get(AppSettings.SURVEY_ID)
          .take(1)
          .subscribe(survey => {
            this.surveysService.activeSurvey.next(survey);
          });
        }
    };

    this.authService.authRetryCount
      .subscribe(count => {
        if (count > 1) {
          this.spinnerStatusMessage = `
          ${AppSettings.AUTH_STATUS_MESSAGE}<br/>
          ${ordinal(count)} Attempt in progress...`
        }

        if (count > 60 / AppSettings.AUTH_RETRY_TIMEOUT) {
          this.spinnerStatusMessage = `
          ${this.spinnerStatusMessage}<br/>
          ${AppSettings.AUTH_ERROR_MESSAGE}`;
        }
      });

    this.authService.token
      .subscribe(token => {
        if (token) {
          this.registerVectors();

          if (this.instanceId) {
            this.authService
              .getInstance(this.instanceId, this.screenName)
              .then(data => {
                const instance = data.instance;
                const screen = data.screen;
                const zone = data.zone;

                if (instance.gpsLon && instance.gpsLat) {
                  AppSettings.CENTER = [instance.gpsLon, instance.gpsLat];
                }

                if (screen) {
                  AppSettings.BEARING = screen.bearing;
                }

                if (instance.floorId) {
                  AppSettings.FLOOR_ID = instance.floorId;
                }

                if (instance.name) {
                  AppSettings.FEEDBACK_NAME += ` - ${instance.name}`;
                }

                if (
                  zone &&
                  zone.playlists &&
                  zone.playlists.length > 0 &&
                  zone.playlists[0].media &&
                  zone.playlists[0].media.length > 0
                ) {
                  AppSettings.HOME_MEDIA = [
                    ...AppSettings.HOME_MEDIA.filter(resource => (
                      resource.default
                    )),
                    ...zone.playlists[0].media.map(resource => {
                      resource.id = resource.resourceId;
                      resource.url =
                        !resource.url.includes(AppSettings.APP_MANAGER_URL) ? 
                          `${AppSettings.APP_MANAGER_URL}${resource.url}` :
                          resource.url;
  
                      delete resource.name;
                      delete resource.resourceId;
                      delete resource.thumbnailUrl;
  
                      return resource;
                    })
                  ];
                }

                goReady();
              })
              .catch(err => {
                console.error(err.message);

                goReady();
              });
          }
          else {
            goReady();
          }

          if (this.isStaging) {
            this.authService.setStagingHeaders();
          }
        }
      });

    this.authService.authenticate();
  }



  isHomeScreen(): boolean {
    return this.router.url === '/';
  }

  registerVectors() {
    for (let i = 0; i < AppSettings.SVG_ICONS.length; i++) {
      const icon = AppSettings.SVG_ICONS[i];
      this.iconRegistry.addSvgIcon(
        icon.name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(icon.url)
      );
    }
  }

  parseSurvey(survey) {
    this.survey = survey;

    if (survey.type === 'linear') {
      const usedQuestionIds = (
        this.activityService
          .user
          .getValue()
          .usedQuestionIds
      );
      
      this.question = this.survey.questions.filter(
        question => (
          !usedQuestionIds.includes(question._id)
        )
      )[0];
    }

    if (
      this.survey.questions.filter(
        question => !!question.route
      ).length > 0
    ) {
      this.monitorActivity();
    }
  }

  monitorActivity() {
    this.activityService
      .event
      .subscribe(event => {
        if (this.survey && this.survey.questions) {
          const question = this.survey.questions.filter(question => (!question.route || this.routeUrl.startsWith(question.route)) && question.trigger == event)[0];
          if (question && this.activityService.user.getValue().usedQuestionIds.indexOf(question._id) == -1) { // Only update the view if a question is found
            if (question.delay) {
              setTimeout(() => {
                if ((!question.route || this.routeUrl.startsWith(question.route)) && this.activityService.user.getValue().usedQuestionIds.indexOf(question._id) == -1) {
                  this.question = question;
                }
              }, question.delay * 1000);
            }
            else if ((!question.route || this.routeUrl.startsWith(question.route)) && this.activityService.user.getValue().usedQuestionIds.indexOf(question._id) == -1) {
              this.question = question;
            }
          }
        }
      });
  }

  respondToQuestion(answer) {
    this.surveysService
      .createResponse(
        this.survey._id,
        [
        {
            questionId: this.question._id,
            answerId: answer._id
          }
        ],
        this.activityService.user.getValue().id,
        AppSettings.APP_ID,
        this.authService.instanceId.getValue()
      )
      .take(1)
      .subscribe(response => { });
  }

  closeQuestion() {
    this.question = null;
  }
}
