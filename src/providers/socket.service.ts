import { Injectable } from '@angular/core';

import * as io from 'socket.io-client';

import { AuthService } from './auth.service';
import { AppSettings } from '../app/app.settings';

@Injectable()
export class SocketService {
  public socket: any;
  public instanceId: string;

  constructor(
    private authService: AuthService
  ) { }

  connect(instanceId: string) {
    return new Promise((resolve, reject) => {
      this.close();
      this.socket = io.connect(AppSettings.APP_MANAGER_URL, {
        path: '/io',
        query: `instanceId=${instanceId}&token=${this.authService.token.getValue()}`,
        transports: [ 'websocket' ]
      });

      this.socket.once('connect', () => {
        this.instanceId = instanceId;
        resolve(this.socket);
      });

      this.socket.once('connect_error', (err) => {
        console.error(err.message);
        if (err.message === 'xhr poll error') {
          reject(new Error('Unable to reach server, check network connection'))
        }
        else {
          reject(err);
        }
      });
    });
  }

  send(event, data) {
    if (this.socket && this.socket.connected) {
      this.socket.send(event, data);
    }
  }

  on(event, callback) {
    if (this.socket && this.socket.connected) {
      this.socket.on(event, callback);
    }
  }

  once(event, callback) {
    if (this.socket && this.socket.connected) {
      this.socket.once(event, callback);
    }
  }

  off(event) {
    if (this.socket && this.socket.connected) {
      this.socket.removeAllListeners(event);
    }
  }

  close() {
    if (this.socket && this.socket.connected) {
      this.socket.close();
    }
  }
}
