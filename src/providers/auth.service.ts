import 'rxjs/add/operator/take';

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpLink } from 'apollo-angular-link-http';
import { Apollo } from 'apollo-angular';
import { BehaviorSubject } from 'rxjs';

import { createApollo } from '../graphql/graphql.service';
import { AppSettings } from '../app/app.settings';

@Injectable()
export class AuthService {
  public instanceId: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public token: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  public authRetryCount: BehaviorSubject<number> = new BehaviorSubject<number>(1);
  public headers: HttpHeaders;
  public jsonHeaders: HttpHeaders;

  constructor(
    private httpLink: HttpLink,
    private http: HttpClient,
    private apollo: Apollo
  ) { }

  public authenticate() {
    this.http
      .post(`${AppSettings.APP_MANAGER_URL}/api/oauth2/token`, 'grant_type=client_credentials', {
        headers: new HttpHeaders()
          .set('Authorization', 'Basic ' + btoa(AppSettings.APP_ID + ':' + AppSettings.APP_SECRET))
          .set('Content-type', 'application/x-www-form-urlencoded')
      })
      .take(1)
      .subscribe((data: any) => {
        createApollo(
          this.httpLink,
          data.access_token.value,
          this.apollo
        );

        this.createAuthHeaders(data.access_token.value);
        this.instanceId.next(data.access_token.instance.id);
        this.token.next(data.access_token.value);
      }, err => {
        console.warn(err.message);
        setTimeout(() => {
          this.authRetryCount.next(this.authRetryCount.getValue() + 1);
          this.authenticate();
        }, AppSettings.AUTH_RETRY_TIMEOUT * 1000);
      });
  }

  public createAuthHeaders(token: String): void {
    this.headers = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token);

    this.jsonHeaders = new HttpHeaders()
      .set('Authorization', 'Bearer ' + token)
      .set('Accept', 'application/json');
  }

  public getInstance(instanceId: string, screenName?: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.http
        .get(`${AppSettings.APP_MANAGER_URL}/api/clients/instance/${instanceId}`, {
          headers: this.headers
        })
        .take(1)
        .subscribe((instance: any) => {
          let screen;
          let zone;

          if (Array.isArray(instance.screens)) {
            if (screenName) {
              for (let i = 0; i < instance.screens.length; i++) {
                if (screenName === instance.screens[i].name) {
                  screen = instance.screens[i];
                  break;
                }
              }
            }
            else if (instance.screens.length > 0) {
              screen = instance.screens[0];
            }
          }

          if (screen && screen.layout) {
            this.http
              .get(`${AppSettings.APP_MANAGER_URL}/api/layouts/${screen.layout.id}/data`, {
                headers: this.headers
              })
              .take(1)
              .subscribe((layout: any) => {
                for (let i = 0; i < layout.zones.length; i++) {
                  try {
                    const path = window.location.href.match(/^(https?\:)\/\/(([^:\/?#]*)(?:\:([0-9]+))?)([\/]{0,1}[^?#]*)(\?[^#]*|)(#.*|)$/)[5];
                    if (typeof layout.zones[i].overrideUrl === 'string' && layout.zones[i].overrideUrl.includes(path)) {
                      zone = layout.zones[i];
                      return resolve({
                        instance: instance,
                        screen: screen,
                        zone: zone
                      });
                    }
                  }
                  catch (ex) {
                    return resolve({
                      instance: instance,
                      screen: screen
                    });
                  }
                }

                resolve({
                  instance: instance,
                  screen: screen
                });
              }, err => {
                resolve({
                  instance: instance,
                  screen: screen
                });
              });
          }
          else {
            resolve({
              instance: instance,
              screen: screen
            });
          }
        }, err => reject(err));
    });
  }

  public setStagingHeaders() {
    this.jsonHeaders = this.jsonHeaders
      .set('W2g-Staging', 'true');
  }
}
