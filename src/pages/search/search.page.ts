import * as turf from '@turf/turf';
import * as moment from 'moment';
import * as Color from 'color';

import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Subscription } from 'rxjs';

import { ActivityService } from '../../providers/activity.service';
import { KeyboardService } from '../../providers/keyboard.service';
import { LocationsService } from '../../providers/locations.service';
import { MapService } from '../../providers/map.service';
import { NotificationsService } from '../../providers/notifications.service';

import { AppSettings } from '../../app/app.settings';
import { AppUtils } from '../../app/app.utils';

@Component({
    selector: 'w2g-search',
    templateUrl: 'search.page.html',
    styleUrls: ['search.page.scss']
})
export class SearchPage implements OnInit , OnDestroy {
  @HostBinding('class.has-header') hasHeader: boolean = AppSettings.SHOW_HEADER && !AppSettings.SHOW_HEADER_ONLY_ON_HOME;
  @HostBinding('class.has-footer') hasFooter: boolean = AppSettings.SHOW_FOOTER;
  @HostBinding('class.has-sidebar') hasSidebar: boolean = AppSettings.MENU_SIDEBAR;

  public topPop: string;
  public themeColor: string = AppSettings.THEME_COLORS['search'] ? AppSettings.THEME_COLORS['search'].lightHex : '#87002c';
  public lightThemeColor: string = Color(this.themeColor).lighten(0.4);
  public popcss: any[] = [this.topPop, '65px', '88%'];
  public disabled_tf: boolean;
  public res_height: string = '370px';
  public selectedIndex: number = 0;
  public popularLocations: any[] = [];
  public popularCategoryId = AppSettings.SEARCH_POPULAR_CATEGORY_ID;
  public popularLabel = AppSettings.SEARCH_POPULAR_LABEL;
  public hasCloseButton: boolean = AppSettings.SEARCH_CLOSE_BUTTON;
  public graphOptions: any[] = AppSettings.ROUTING_GRAPH_OPTIONS;
  public graphChoice: string = 'default';
  public collapsedSearch: boolean = false;
  public showingNotification: boolean = false;
  public showSearch: boolean = true;
  public searchResults: any[];
  public userInput: any = null;
  public close_bol: string = 'block';

  private subscription:  Subscription;
  private routerSubscription: Subscription;
  private mapSubscription: Subscription;
  private disabledSubscription: Subscription;
  private notificationsSubscription: Subscription;
  private pageready: boolean;

  constructor(
    private activityService: ActivityService,
    private locationsService: LocationsService,
    private mapService: MapService,
    private notificationsService: NotificationsService,
    private router: Router,
    private keyboard: KeyboardService
  ) { }

  ngOnInit() {
    let count = 0;

    this.showSearch = !this.router.url.endsWith('closed');
    this.pageready = false;

    this.mapSubscription = this.mapService.ready
      .subscribe(ready => {
        if (ready) {
          this.pageready = true;
          this.getPopularCategory();
        }
      });

    this.disabledSubscription = this.mapService.disabled_tf
      .subscribe(disabled_tf => {
        this.mapService.removeMoreInfo.next(true);
        this.disabled_tf = disabled_tf;
      });

    this.notificationsSubscription = this.notificationsService
      .showingNotification
      .subscribe((showingNotification: boolean) => this.showingNotification = showingNotification);

    this.subscription = this.keyboard.keyboard.subscribe((data) => {
      if (data != null) {
        if (data.value != null ) {
          this.userInput = data.value;
          if (data.value.length > 1 && count !== 0) {
            this.searchFun();
          }
          if (data.value.length === 0) {
            this.userInput = '';
            this.searchResults = [];
          }
        }
      }
    });

    this.routerSubscription = this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        if (event.url.endsWith('closed')) {
          this.showSearch = false;
        }
      }
    });

    count = 1;
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }

    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    if (this.mapSubscription) {
      this.mapSubscription.unsubscribe();
    }

    if (this.disabledSubscription) {
      this.disabledSubscription.unsubscribe();
    }

    if (this.notificationsSubscription) {
      this.notificationsSubscription.unsubscribe();
    }

    this.userInput = null;
  }

  getPopularCategory() {
    if (this.popularCategoryId) {
      this.locationsService
        .getByCategoryId(this.popularCategoryId, this.mapService.projectId.getValue())
        .then(data => {
          this.popularLocations = data.locations;
        }, err => console.error(err.message));
    }
  }

  public searchFun() {
    this.recordSearch(this.userInput);
    this.searchLocation(this.userInput)
      .then((location) => { });
  }

  public request_search_div() {
    if (this.close_bol === 'none') {
      this.toggle();
    }
  }

  public resultClickedHandler(location) {
    const data = {
        value: location.name,
        update: true
    };
    this.keyboard.keyboard.next(data);
    this.userInput = location.name;

    if (location.type === 'Location') {
      if (location.geom && location.geom.length > 0 && location.geom[0].length > 0) {
        const turfPolygon = turf.polygon(location.geom[0]);
        const centerOfMass = turf.centerOfMass(turfPolygon);
        location.point = centerOfMass.geometry.coordinates;
      }
    } else if (location.geom) {
        location.point = location.geom;
    }

    this.toggle();
    if (location.point) {
      this.mapService.getpopupinfo.next(location);
      this.mapService.location.next(location);
    }
    else {
      console.warn(`Unable to calculate point for ${location.name}`);
    }
  }

  public inputChangeHandler() {
    if (this.userInput.length > 2) {
      this.searchFun();
    }
    if (this.userInput.length === 0) {
      this.searchResults = [];
    }
  }

  public clickHeader(event) {
    if (event.target.getAttribute('id') === 'toggle-search-button') {
      return this.toggle();
    }

    if (this.collapsedSearch) {
      this.toggle();
    }
  }

  private toggle() {
    this.mapService.removeMoreInfo.next(true);
    this.collapsedSearch = !this.collapsedSearch;
    this.close_bol = this.close_bol === 'block' ? 'none' : 'block';
  }

  private toggleOld() {
      this.mapService.removeMoreInfo.next(true);
      if (this.close_bol === 'block') {
          this.close_bol = 'none';
          this.popcss = ['1350px', '155px', '80%'];
      } else {
          this.close_bol = 'block';
          if (this.disabled_tf === true) {
              this.popcss = ['880px', '155px', '80%'];
          } else {
              this.popcss = [this.topPop, '65px', '88%'];
          }
      }
  }

  public clearSearch() {
    this.keyboard.keyboard.next({
      value: '',
      update: true
    });
  }

  public closeSearch() {
    this.router.navigate(['/search/closed'], {queryParamsHandling: "preserve"});
  }

  private recordSearch(query) {
    this.activityService.action.next({
      name: 'w2g-search',
      createdAt: moment.utc().format(),
      params: {
        term: query,
        projectId: this.mapService.projectId.getValue()
      }
    });
  }

  private searchLocation(query) {
    return new Promise((resolve, reject) => {
      this.locationsService
        .autocomplete(query, AppSettings.PROJECT_ID, {
            context: AppUtils.getContext()
        })
        .take(1)
        .subscribe((data) => {
          this.searchResults = data.map(result => {
            if (result.display_name !== result.name) {
              result.display_name = `${result.display_name} (${result.name})`;
            }
            return result;
          });
        });
    });
  }
}
