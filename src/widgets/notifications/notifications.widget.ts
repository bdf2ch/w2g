import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import {AppSettings} from '../../app/app.settings';
import { MapService } from '../../providers/map.service';
import {NotificationsService} from '../../providers/notifications.service';


@Component({
  selector: 'w2g-notifications',
  templateUrl: 'notifications.widget.html',
  styleUrls: [ 'notifications.widget.scss' ]
})
export class NotificationsWidget implements OnInit {
  disabled_tf: boolean;

  @Input()
  set notifications(notifications: any[]) {
    this.inputNotifications = notifications;

    if (!this.extended) {
      this.renderedNotifications = notifications.slice(0, 1);
    }
    else {
      this.renderedNotifications = notifications;
    }
  }

  @Input('extended') extended: boolean = false;
  @Input('truncated') truncated: boolean = false;
  @Input('marquee') marquee: boolean = false;
  @Input('extendToggle') extendToggle: boolean = true;

  @Output('onExtended') onExtended: EventEmitter<boolean> = new EventEmitter<boolean>();

  public inputNotifications: any[];
  public renderedNotifications: any[];

  private disabledbtn: any = AppSettings.MAP_BUTTONS[3];
  private showmoreCss: any[] = ['initial' , '0px'];


  constructor(
    private router: Router,
    private mapService: MapService
  ) { }

  ngOnInit() {
    if (!this.extended) {
      this.renderedNotifications = this.inputNotifications.slice(0, 1);
    }
    else {
      this.renderedNotifications = this.inputNotifications;
    }

    this.disabled_tf = this.mapService.disabled_tf.getValue();

    this.mapService.disabled_tf
      .subscribe(data => {
        this.disabled_tf = data;
        if (this.disabled_tf === true ) {
          this.showmoreCss = ['absolute', `${AppSettings.MAX_NOTIFICATIONS * 200 + (AppSettings.MAX_NOTIFICATIONS - 1) * 20 + 67}px`];
        } else {
          this.showmoreCss = ['initial', '0px'];
        }
      });
  }

  toggleExtended() {
    this.extended = !this.extended;

    if (this.extended) {
      this.renderedNotifications = this.inputNotifications;
      this.showmoreCss = ['absolute', `${AppSettings.MAX_NOTIFICATIONS * 200 + (AppSettings.MAX_NOTIFICATIONS - 1) * 20 + 67}px`];
    }
    else {
      this.renderedNotifications = this.inputNotifications.slice(0, 1);
      if (this.mapService.disabled_tf.getValue() === false) {
        this.showmoreCss = ['initial', '0px'];
      }
    }

    this.onExtended.emit(this.extended);
  }

  redirectCallback(notification) {
    if (notification.redirectUrl) {
      this.router.navigate([notification.redirectUrl], { queryParamsHandling: "preserve" });
    }
  }
}
