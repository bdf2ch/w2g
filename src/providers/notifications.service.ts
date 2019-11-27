import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

import * as moment from 'moment-timezone';

import { AuthService } from './auth.service';
import { SocketService } from './socket.service';
import { TrafficService } from './traffic.service';
import { TwitterService } from './twitter.service';

import { AppSettings } from '../app/app.settings';
import { AppUtils } from '../app/app.utils';

@Injectable()
export class NotificationsService {
  public mostRecent: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public notificationsSubject: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);

  private notifications: any[] = [];
  private twitterScreenName = AppSettings.TWITTER_SCREEN_NAME;

  private trafficReady: boolean = false;
  private twitterReady: boolean = false;
  private acmReady: boolean = false;
  private ready: boolean = false;
  public showingNotification: BehaviorSubject<any> = new BehaviorSubject<any>(false);
  public disabledfromNotification: BehaviorSubject<any> = new BehaviorSubject<any>(false);

  constructor(
    private http: HttpClient,
    private authService: AuthService,
    private socketService: SocketService,
    private trafficService: TrafficService,
    private twitterService: TwitterService
  ) {
    this.authService
      .token
      .subscribe((token) => {
        if (token) {
          if (this.socketService.instanceId) {
            this.socketService
              .connect(this.socketService.instanceId)
              .then(socket => {
                this.getNotifications();
                this.schedule();
              })
              .catch(err => {
                console.error(err.message);
                this.getNotifications();
                this.schedule();
              });
          }
          else {
            this.getNotifications();
            this.schedule();
          }
        }
      });
  }

  subscribe() {
    const addTopic = `add-notification-${this.socketService.instanceId}`;
    const removeTopic = `remove-notification-${this.socketService.instanceId}`;

    this.socketService.off(addTopic);
    this.socketService.off(removeTopic);

    this.socketService.on(addTopic, notification => this.addNotification(AppUtils.parseNotification(notification)));

    this.socketService.on(removeTopic, notification => {
      if (!notification.id && notification._id) {
        notification.id = notification._id;
      }

      this.removeNotification(notification);
    });
  }

  schedule() {
    setInterval(() => {
      this.twitterReady = false;
      this.trafficReady = false;
      this.acmReady = false;

      this.getNotifications(true);
    }, AppSettings.NOTIFICATION_UPDATE_INTERVAL * 60 * 1000);
  }

  getNotifications(isUpdate: boolean = false) {
    this.getFromTwitter(isUpdate);
    this.getFromTraffic(isUpdate);
    this.getFromAcm(isUpdate);
  }

  getFromTwitter(isUpdate: boolean = false) {
    if (this.twitterScreenName && this.twitterScreenName.length > 0) {
      this.twitterService
        .get(this.twitterScreenName, 3)
        .take(1)
        .subscribe(data => {
          const notifications = this.trafficReady || this.acmReady ? this.notifications : [];

          if (data.error) {
            console.error(data.error);
            this.twitterReady = true;
            return this.render(notifications, isUpdate);
          }

          for (let i = 0; i < data.length; i++) {
            notifications.push({
              id: data[i].id,
              title: `@${this.twitterScreenName}`,
              source: AppSettings.TWITTER_MODULE,
              message: AppUtils.removeUrls(data[i].full_text),
              date: data[i].created_at,
              primaryColor: AppSettings.TWITTER_COLOR,
              icon: AppSettings.TWITTER_ICON
            });
          }

          this.twitterReady = true;
          this.render(notifications, isUpdate);
        });
    }
    else {
      this.twitterReady = true;
      this.render(this.twitterReady || this.acmReady ? this.notifications : [], isUpdate);
    }
  }

  getFromTraffic(isUpdate: boolean = false) {
    if (AppSettings.TRAFFIC_MODULE && AppSettings.TRAFFIC_MODULE.length > 0) {
      this.trafficService
        .getInBounds(AppSettings.MAX_BOUNDS)
        .take(1)
        .subscribe(data => {
          const notifications = this.twitterReady || this.acmReady ? this.notifications : [];

          if (data.error) {
            console.error(data.error);
            this.trafficReady = true;
            return this.render(notifications, isUpdate);
          }

          for (let i = 0; i < data.length; i++) {
            notifications.push({
              id: data[i].id,
              title: data[i].title,
              source: AppSettings.TRAFFIC_MODULE,
              message: data[i].description,
              date: data[i].pubDate,
              primaryColor: AppSettings.TRAFFIC_COLOR,
              icon: AppSettings.TRAFFIC_ICON
            });
          }

          this.trafficReady = true;
          this.render(notifications, isUpdate);
        });
    }
    else {
      this.trafficReady = true;
      this.render(this.twitterReady || this.acmReady ? this.notifications : [], isUpdate);
    }
  }

  getFromAcm(isUpdate: boolean = false) {
    if (this.socketService.instanceId) {
      this.http
        .get(`${AppSettings.APP_MANAGER_URL}/api/notifications/instance/${this.socketService.instanceId}`, {
          headers: this.authService.headers
        })
        .take(1)
        .subscribe((data: any) => {
          let notifications = this.twitterReady || this.trafficReady ? this.notifications : [];

          const newNotifications = data.map(AppUtils.parseNotification);
          for (let i = 0; i < newNotifications.length; i++) {
            if (newNotifications[i].expiryDate) {
              newNotifications[i].timeout = setTimeout(() => {
                this.removeNotification({
                  id: newNotifications[i].id
                });
              }, moment(newNotifications[i].expiryDate).diff(moment()));
            }
          }

          notifications = notifications.concat(newNotifications);

          this.acmReady = true;
          this.render(notifications, isUpdate);
        }, err => {
          console.error(err.message);
          this.acmReady = true;
          return this.render(this.twitterReady || this.trafficReady ? this.notifications : [], isUpdate);
        });
    }
    else {
      this.acmReady = true;
      this.render(this.twitterReady || this.acmReady ? this.notifications : [], isUpdate);
    }
  }

  render(notifications, isUpdate: boolean = false) {
    this.notifications = notifications.sort((notA, notB) => <any>new Date(notB.date) - <any>new Date(notA.date));

    if (!isUpdate) {
      this.checkReady();
    }

    if (this.ready) {
      this.prefix();
      this.notifications.splice(AppSettings.MAX_NOTIFICATIONS, this.notifications.length - AppSettings.MAX_NOTIFICATIONS);
      this.notificationsSubject.next(this.notifications);

      if (this.notifications.length > 0 && (!this.notifications[0].date || Math.abs(Date.now() - new Date(this.notifications[0].date).getTime()) <= AppSettings.NOTIFICATION_RECENT_INTERVAL * 60 * 1000)) {
        this.mostRecent.next(this.notifications[0]);
        this.showingNotification.next(true);
      }
      else {
        this.mostRecent.next(null);
        this.showingNotification.next(false);
      }

      this.subscribe();
    }
  }

  addNotification(notification) {
    const notifications = [...this.notifications];

    if (notification.expiryDate) {
      notification.timeout = setTimeout(() => {
        this.removeNotification({
          id: notification.id
        });
      }, moment(notification.expiryDate).diff(moment()));
    }

    let match = false;
    for (let i = 0; i < notifications.length; i++) {
      if (notifications[i].id === notification.id) {
        if (notifications[i].timeout) {
          clearTimeout(notifications[i].timeout);
        }

        notifications[i] = notification;
        match = true;
        break;
      }
    }

    if (!match) {
      notifications.unshift(notification);
    }

    this.render(notifications, true);
  }

  removeNotification(notification) {
    const notifications = [...this.notifications];

    let match = false;
    for (let i = notifications.length - 1; i >= 0; i--) {
      if (notifications[i].id === notification.id) {
        if (notifications[i].timeout) {
          clearTimeout(notifications[i].timeout);
        }

        notifications.splice(i, 1);
        match = true;
        break;
      }
    }

    if (!match) {
      console.warn(`Unable to find notification ${notification.id}, removal aborted`);
    }

    if (notifications.length < AppSettings.MAX_NOTIFICATIONS) {
      this.twitterReady = false;
      this.trafficReady = false;
      this.acmReady = false;

      this.getNotifications(false);
    }
    else {
      this.render(notifications, true);
    }
  }

  prefix() {
    outerLoop:
    for (let i = 0; i < AppSettings.NOTIFICATION_PREFIX_ITEMS.length; i++) {
      for (let j = this.notifications.length - 1; j >= 0; j--) {
        if (this.notifications[j].source == AppSettings.NOTIFICATION_PREFIX_ITEMS[i].source && this.notifications[j].id == AppSettings.NOTIFICATION_PREFIX_ITEMS[i].id) {
          continue outerLoop;
        }
      }

      this.notifications.unshift(AppSettings.NOTIFICATION_PREFIX_ITEMS[i]);
    }
  }

  checkReady() {
    this.ready = this.twitterReady && this.trafficReady && this.acmReady;
  }
}
