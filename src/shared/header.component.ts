import { Component, OnInit } from '@angular/core';

import { AppSettings } from '../app/app.settings';

@Component({
  selector: 'w2g-header',
  templateUrl: 'header.component.html',
  styleUrls: [ 'header.component.scss' ]
})
export class HeaderComponent implements OnInit {
  public logo: string = AppSettings.LOGO;

  ngOnInit() {
  }
}
