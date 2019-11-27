import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { AuthService } from './auth.service';
import { AppSettings } from '../app/app.settings';

@Injectable()
export class PcLabsService {
  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {}

  getAll(): Observable<any> {
    return this.http.get(AppSettings.PC_LABS_URL, {
      headers: this.authService.headers
    });
  }
}
