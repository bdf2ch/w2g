import {Component, HostBinding, OnInit, ViewChild} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatTooltip } from '@angular/material';
import { Subscription } from 'rxjs';

import 'rxjs/add/operator/take';

import { ActivityService } from '../../providers/activity.service';
import { FeedbackService } from '../../providers/feedback.service';
import { InfosService } from '../../providers/infos.service';
import { MapService } from '../../providers/map.service';
import { NotificationsService } from '../../providers/notifications.service';

import { AppSettings } from '../../app/app.settings';

@Component({
  selector: 'w2g-info',
  templateUrl: 'info.page.html',
  styleUrls: [ 'info.page.scss' ]
})
export class InfoPage implements OnInit {
  @HostBinding('class.has-header') hasHeader: boolean = AppSettings.SHOW_HEADER && !AppSettings.SHOW_HEADER_ONLY_ON_HOME;
  @HostBinding('class.has-sidebar') hasSidebar: boolean = AppSettings.MENU_SIDEBAR;
  @HostBinding('class.has-subsidebar') hasSubSidebar: boolean = AppSettings.MENU_SUBSIDEBAR;

  @ViewChild('tooltip') tooltip: MatTooltip;

  disabled_tf: boolean;
  infoname: any;
  private EventCss: any[] = ['0px', '65px', '88%', '915px'];
  private notificationSubscription: Subscription;
  private topPop: string;
  private menuButtons: any[] = AppSettings.INFO_BUTTONS;
  private routerSubscription: any;

  public showMenu: boolean = true;
  public showInfo: boolean = true;
  public isNews: boolean = false;
  public themeColor: any = AppSettings.THEME_COLORS['info'];

  public news: any[] = [];

  private page: string;
  private isFeedback: boolean = false;
  private showFeedbackContent: boolean = true;
  private feedbackLoading: boolean = false;
  private feedbackMessage: string;
  private tooltipShowDelay = 999999;

  private category: any;
  private infos: any[] = [];
  private feedbackArray: any[] = [];
  private btnstyle: any[] = [];
  private activeInfo: any;

  private feedbackPages = AppSettings.FEEDBACK_PAGES;
  private feedbackQuestions = [
    'How would you rate your overall experience of using the Information Point?',
    'Has it worked as you expected?',
    'What is the most important area for you?',
    'Would you recommend using this point to a friend or colleague?'
  ];
  private feedbackFooter = AppSettings.FEEDBACK_FOOTER;

  constructor(
    private activityService: ActivityService,
    private feedbackService: FeedbackService,
    private infosService: InfosService,
    private mapService: MapService,
    private NotifiService: NotificationsService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.initFeedbackButtons();

    this.mapService.disabled_tf
      .subscribe(data => {
        this.disabled_tf = data;
        if (this.disabled_tf === true ) {
          this.EventCss = ['800px', '155px', '80%', '540px'];
        } else {
          this.EventCss = [ this.topPop, '65px', '88%', '915px'];
        }
      });

    this.notificationSubscription = this.NotifiService.showingNotification.subscribe((data) => {
      if (data === true ) {
        this.topPop = '90px';
        if (this.disabled_tf === false) {
          this.EventCss[0] = '90px';
        } else {
          this.EventCss[0] = '800px';
        }
      } else {
        this.topPop = '0px';
        if (this.disabled_tf === false) {
          this.EventCss[0] = '0px';
        } else {
          this.EventCss[0] = '800px';
        }
      }
    });

    this.NotifiService.notificationsSubject
      .subscribe((news) => {
        if (news) {
          this.news = news;
        }
      });

    // Subscribe to parameter changes since the activated route around-me is seen as common for all menu options
    this.routerSubscription = this.route.params.subscribe((params) => {
      this.page = params.page;

      this.showMenu = true;
      this.isFeedback = this.page == 'feedback';
      this.isNews = params.id && params.id.toLowerCase().includes('notifications');
      if (params.id) {
        this.infoname = params.id;
      } else if (!this.isFeedback && !this.isNews) {
        this.infoname = 'Featured';
      }
      if (params.page && !this.isFeedback) {
        this.infosService
          .getCategoriesID(this.mapService.projectId.getValue(), params.page )
          .take(1)
          .subscribe(infos => {
            if (infos.error) {
              return console.error(infos.error);
            }

            this.infos = infos;

            if (this.infos.length === 1) {
              this.setActiveInfo(this.infos[0]);
            }
            else {
              this.unsetActiveInfo();
            }

            this.showInfo = true;
          });

      } else {
        if (!this.isFeedback) {
          this.infosService.getfeatured(this.mapService.projectId.getValue())
            .take(1)
            .subscribe(infos => {
              if (infos.error) {
                return console.error(infos.error);
              }

              this.unsetActiveInfo();

              this.infos = infos;
              this.showInfo = true;
            });
        }

      }
    });
  }

  initFeedbackButtons() {
    this.btnstyle = [];
    this.btnstyle[0] = 'assets/vectors/info/Good.png';
    this.btnstyle[1] = 'assets/vectors/info/Average.png';
    this.btnstyle[2] = 'assets/vectors/info/bad.png';

    this.btnstyle[9]  = 'assets/vectors/info/Good.png';
    this.btnstyle[10] = 'assets/vectors/info/Average.png';
    this.btnstyle[11] = 'assets/vectors/info/bad.png';
  }

  setActiveInfo(info) {
    this.activeInfo = info;
  }

  unsetActiveInfo() {
    this.activeInfo = null;
  }

  closeMenu() {
    this.showMenu = false;
  }

  isActive(button) {
    return (this.page && button.url.includes(this.page)) || !(this.page || button.url.split('/')[2]);
  }

  hideInfo() {
    this.showInfo = false;
  }

  feedback(number, value, index) {
    switch (number) {
      case 1:
        this.feedbackArray[0] = value;
        this.btnstyle[0] = 'assets/vectors/info/Good.png';
        this.btnstyle[1] = 'assets/vectors/info/Average.png';
        this.btnstyle[2] = 'assets/vectors/info/bad.png';
        if (index === 0) {
          this.btnstyle[index] = 'assets/vectors/info/Good-active.png';
        }if (index === 1) {
        this.btnstyle[index] = 'assets/vectors/info/Average-active.png';
      }if (index === 2) {
        this.btnstyle[index] = 'assets/vectors/info/bad-active.png';
      }
        break;
      case 2:
        this.feedbackArray[1] = value;
        this.btnstyle[3] = 'rgba(255,255,255,0.8)';
        this.btnstyle[4] = 'rgba(255,255,255,0.8)';
        if (index === 3) {
          this.btnstyle[index] = '#19c712';
        }if (index === 4) {
        this.btnstyle[index] = '#f48120';
      }
        break;
      case 3:
        this.feedbackArray[2] = value;
        this.btnstyle[5] = 'rgba(255,255,255,0.8)';
        this.btnstyle[6] = 'rgba(255,255,255,0.8)';
        this.btnstyle[7] = 'rgba(255,255,255,0.8)';
        this.btnstyle[8] = 'rgba(255,255,255,0.8)';
        this.btnstyle[index] = '#f48120';
        break;
      case 4:
        this.feedbackArray[3] = value;
        this.btnstyle[9]  = 'assets/vectors/info/Good.png';
        this.btnstyle[10] = 'assets/vectors/info/Average.png';
        this.btnstyle[11] = 'assets/vectors/info/bad.png';
        if (index === 9) {
          this.btnstyle[index] = 'assets/vectors/info/Good-active.png';
        }
        if (index === 10) {
          this.btnstyle[index] = 'assets/vectors/info/Average-active.png';
        }
        if (index === 11) {
          this.btnstyle[index] = 'assets/vectors/info/bad-active.png';
        }
        break;
    }
  }

  submitfun() {
    if (!this.isValid()) {
      if (this.tooltip) {
        this.tooltipShowDelay = 0;
        setTimeout(() => this.tooltip.show());

        setTimeout(() => this.tooltipShowDelay = 999999, 3000);
      }

      return console.warn('Feedback form not fully completed');
    }

    const feedback = <any>{
      app_id: AppSettings.APP_ID,
      lm2_url: AppSettings.LM2_URL,
      name: AppSettings.FEEDBACK_NAME,
      project_id: this.mapService.projectId.getValue(),
      campus_id: this.mapService.campusId.getValue(),
      feedback_type: 5,
      message: '',
      useragent: <any>window.navigator.userAgent
    };

    if (this.activityService.ipAddress) {
      feedback.ip_address = this.activityService.ipAddress;
    }

    for (let i = 0; i < this.feedbackQuestions.length; i++) {
      feedback.message += `${this.feedbackQuestions[i]}: ${this.feedbackArray[i]}`;
      if (i < this.feedbackQuestions.length - 1) {
        feedback.message += '<br/>';
      }
    }

    this.showFeedbackContent = false;
    this.feedbackLoading = true;

    const reset = () => {
      this.showFeedbackContent = true;
      this.feedbackMessage = null;
      this.feedbackArray = [];
      this.initFeedbackButtons();
    };

    const showError = () => {
      this.feedbackMessage = AppSettings.FEEDBACK_ERROR_MESSAGE;
      this.feedbackLoading = false;

      if (AppSettings.FEEDBACK_SUCCESS_TIMEOUT) {
        setTimeout(() => reset(), AppSettings.FEEDBACK_SUCCESS_TIMEOUT * 1000);
      }
    };

    this.feedbackService
      .send(feedback)
      .take(1)
      .subscribe(
        (data: any) => {
          if (!data.created_at) {
            return showError();
          }

          this.feedbackMessage = AppSettings.FEEDBACK_SUCCESS_MESSAGE;
          this.feedbackLoading = false;

          if (AppSettings.FEEDBACK_SUCCESS_TIMEOUT) {
            setTimeout(() => reset(), AppSettings.FEEDBACK_SUCCESS_TIMEOUT * 1000);
          }
        },
        (err: any) => {
          console.error(err.error);
          showError();
        });
  }

  isValid() {
    if (this.feedbackQuestions.length !== this.feedbackArray.length) {
      return false;
    }

    for (let i = 0; i < this.feedbackArray.length; i++) {
      if (!this.feedbackArray[i]) {
        return false;
      }
    }

    return true;
  }
}
