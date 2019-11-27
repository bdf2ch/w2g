import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

import { AppSettings } from '../app/app.settings';
import { MapService } from '../providers/map.service';

@Component({
  selector: 'w2g-navbar',
  templateUrl: 'navbar.component.html',
  styleUrls: [ 'navbar.component.scss' ]
})
export class NavbarComponent implements OnInit, OnDestroy {
  @Input('isSidebar') isSidebar: boolean = false;
  @Input('isFullSize') isFullSize: boolean = false;

  public AMbackground: any = '#6a6a6a';
  public status: any = 'OFF';
  public menuButtons: any[] = AppSettings.MENU_BUTTONS;
  public globalButtons: any[] = AppSettings.GLOBAL_BUTTONS;
  public disabled_tf: boolean;
  public hideAccessibleLabel: boolean = true;

  public disabledbtn: any = AppSettings.MAP_BUTTONS[3];
  public checkChecked: boolean = true;

  private activeButton: string;
  private activeUrl: string;

  private comingSoonTimeout: any = null;
  private acccessibilityTimeout: any = null;

  constructor(
    private router: Router,
    private mapService: MapService,
  ) { }

  ngOnInit() {
    this.activeButton = `/${this.router.url.split('/')[1].split('?')[0]}`;
    this.activeUrl = `${this.router.url.split('?')[0]}`;

    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.activeButton = `/${event.url.split('/')[1].split('?')[0]}`;
        this.activeUrl = `${event.url.split('?')[0]}`;
      }
    });

    this.mapService.disabled_tf.subscribe(disabled_tf => this.disabled_tf = disabled_tf);
  }

  ngOnDestroy() {
    if (this.comingSoonTimeout) {
      clearTimeout(this.comingSoonTimeout);
      this.comingSoonTimeout = null;
    }

    if (this.acccessibilityTimeout) {
      clearTimeout(this.acccessibilityTimeout);
      this.acccessibilityTimeout = null;
    }
  }

  isActive(button) {
    return (this.activeButton.length == 1 && button.url == this.activeButton) ||
           (this.activeButton.length > 1 && (this.activeUrl.match(/\//g) || []).length == 2 && this.activeUrl.split('/')[2] && this.activeUrl.split('/')[2].includes(',') && this.activeUrl.split('/')[2].split(',')[0].match(AppSettings.OBJECT_ID_REGEX) && button.url == this.activeUrl) ||
           (this.activeButton.length > 1 && ((this.activeUrl.match(/\//g) || []).length != 2 || (!this.activeUrl.split('/')[2].match(AppSettings.OBJECT_ID_REGEX)) && (!this.activeUrl.split('/')[2].includes(',') || !this.activeUrl.split('/')[2].split(',')[0].match(AppSettings.OBJECT_ID_REGEX))) && button.url.startsWith(this.activeButton)) ||
           (this.activeButton.length > 1 && (this.activeUrl.match(/\//g) || []).length == 2 && this.activeUrl.split('/')[2].match(AppSettings.OBJECT_ID_REGEX) && button.url == this.activeUrl);
  }

  disabledFun(id) {
    const disabledButton = this.disabledbtn;
    if (disabledButton) {
      if (this.disabled_tf) {
        disabledButton.currentIconUrl = disabledButton.iconUrl;

        this.disabled_tf = false;
        this.mapService.disabled_tf.next(false);
        this.status = disabledButton.statusOff;
      } else {
        disabledButton.currentIconUrl = disabledButton.activeIconUrl;

        this.disabled_tf = true;
        this.mapService.disabled_tf.next(true);
        this.status = disabledButton.statusOn;
      }
    }
  }

  onAccessibleMode(event) {
    this.disabled_tf = !this.disabled_tf;
    this.mapService.disabled_tf.next(this.disabled_tf);
    this.checkChecked = true;

    if (this.disabledbtn.tempIconUrl) {
      this.disabledbtn.iconUrl = this.disabledbtn.tempIconUrl;
      delete this.disabledbtn.tempIconUrl;
    }
    else if (this.disabledbtn.activeIconUrl) {
      this.disabledbtn.tempIconUrl = this.disabledbtn.iconUrl;
      this.disabledbtn.iconUrl = this.disabledbtn.activeIconUrl;
    }

    if (this.acccessibilityTimeout) {
      clearTimeout(this.acccessibilityTimeout);
      this.acccessibilityTimeout = null;
    }

    this.hideAccessibleLabel = false;
    this.acccessibilityTimeout = setTimeout(() => {
      this.hideAccessibleLabel = true;
    }, 2000);
  }

  activateComingSoon(button) {
    if (button.label && !button.defaultLabel) {
      button.defaultLabel = button.label;
      button.label = 'Coming Soon';

      if (this.comingSoonTimeout) {
        clearTimeout(this.comingSoonTimeout);
        this.comingSoonTimeout = null;
      }

      this.comingSoonTimeout = setTimeout(() => {
        button.label = button.defaultLabel;
        delete button.defaultLabel;
      }, 5000);
    }
  }
}
