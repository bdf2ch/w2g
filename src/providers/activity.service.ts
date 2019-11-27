import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import * as uuid from 'uuid/v4';

import { AuthService } from './auth.service';
import { MapService } from './map.service';
import { AppSettings } from '../app/app.settings';

@Injectable()
export class ActivityService {
  public activity: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public event: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public user: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public action: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public usedQuestionId: BehaviorSubject<string> = new BehaviorSubject<string>(null);

  public ipAddress: string;

  private inactivityTime: number = -1;
  private trail: any;
  private trailStarted: boolean = false;
  private actionPending: any;

  constructor(
    private authService: AuthService,
    private mapService: MapService,
    private http: HttpClient,
    private router: Router
  ) {
    this.authService
      .token
      .subscribe(token => {
        if (token) {
          this.http
            .get(`https://api.ipify.org?format=json`)
            .take(1)
            .subscribe((data: any) => {
              this.ipAddress = data.ip;

              this.createUser();
              this.incrementTime();

              this.activity
                .subscribe(event => {
                  if (event) {
                    this.inactivityTime = -1;

                    if (!this.trailStarted) {
                      this.createTrail();
                    }
                  }
                });

              this.usedQuestionId
                .subscribe(questionId => {
                  if (questionId) {
                    this.user.getValue().usedQuestionIds.push(questionId);
                  }
                });

              this.action
                .subscribe(action => {
                  if (action) {
                    this.registerAction(action);
                  }
                });
            });
        }
      });
  }

  createUser() {
    this.user.next({
      id: uuid(),
      usedQuestionIds: [ ]
    });
    this.event.next('new-user');
  }

  incrementTime() {
    this.inactivityTime++;
    this.checkInactivity();

    setTimeout(() => {
      this.incrementTime();
    }, 1000)
  }

  checkInactivity() {
    if (this.inactivityTime > AppSettings.INACTIVITY_TIMEOUT * 60) {
      this.inactivityTime = -1;
      this.createUser();

      if (this.trail) {
        this.endTrail();
      }

      this.mapService.disabled_tf.next(false);

      if (AppSettings.INITIAL_URL && AppSettings.INITIAL_URL.length > 0) {
        this.router.navigate([AppSettings.INITIAL_URL], {queryParamsHandling: "preserve"});
      }
      else {
        this.router.navigate(['/'], {queryParamsHandling: "preserve"});
      }
    }
  }

  registerAction(action: any) {
    if (this.trail) {
      this.createAction(action);
    }
    else if (!this.trailStarted) {
      this.createTrail(action);
    }
    else {
      this.actionPending = action;
    }
  }

  createTrail(action?: any) {
    this.trailStarted = true;

    const actions = [];
    if (action) {
      actions.push(action);
    }

    this.http
      .post(`${AppSettings.APP_MANAGER_URL}/api/broker/activity`, {
        appId: AppSettings.APP_ID,
        userId: this.user.getValue().id,
        ipAddress: this.ipAddress,
        userAgent: window.navigator.userAgent,
        actions: actions
      }, {
        headers: this.authService.headers
      })
      .take(1)
      .subscribe(data => {
        this.trail = data;

        if (this.actionPending) {
          this.createAction(this.actionPending);
          this.actionPending = null;
        }
      });
  }

  createAction(action: any) {
    this.http
      .post(`${AppSettings.APP_MANAGER_URL}/api/broker/activity/${this.trail._id}/actions`, action, {
        headers: this.authService.headers
      })
      .take(1)
      .subscribe(data => { });
  }

  endTrail() {
    this.http
      .post(`${AppSettings.APP_MANAGER_URL}/api/broker/activity/${this.trail._id}/end`, null, {
        headers: this.authService.headers
      })
      .take(1)
      .subscribe(data => {
        this.trailStarted = false;
        this.trail = null;
      });
  }
}
