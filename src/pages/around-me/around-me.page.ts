import { Component, OnInit, OnDestroy, HostBinding } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import * as mapboxgl from 'mapbox-gl';

import { AnnotationsService } from '../../providers/annotations.service';
import { LocationsService } from '../../providers/locations.service';
import { MapService } from '../../providers/map.service';

import { AppSettings } from '../../app/app.settings';
import { AppUtils } from '../../app/app.utils';

@Component({
  selector: 'w2g-around-me',
  templateUrl: 'around-me.page.html',
  styleUrls: [ 'around-me.page.scss' ]
})
export class AroundMePage implements OnInit, OnDestroy {
  @HostBinding('class.has-header') hasHeader: boolean = AppSettings.SHOW_HEADER && !AppSettings.SHOW_HEADER_ONLY_ON_HOME;
  @HostBinding('class.has-footer') hasFooter: boolean = AppSettings.SHOW_FOOTER;
  @HostBinding('class.has-sidebar') hasSidebar: boolean = AppSettings.MENU_SIDEBAR;
  @HostBinding('class.has-subsidebar') hasSubSidebar: boolean = AppSettings.MENU_SUBSIDEBAR;

  public genericNavbar: boolean = AppSettings.SHOW_ALL_AROUND_ME_CATEGORIES;

  selectedId: any;
  newmenulist: any[] = [];
  private projectId: number = AppSettings.PROJECT_ID;
  private menuButtons: any[] = AppSettings.SHOW_ALL_AROUND_ME_CATEGORIES ? AppSettings.AROUND_ME_BUTTONS.filter(button => button.label === 'Nearest') : AppSettings.AROUND_ME_BUTTONS;
  private submenuButtons: any[] = [];
  private menuBtncss = [];
  private routerSubscription: any;
  private boundsSubscription: any;
  private showbackbtn: boolean = false;

  public page: string;
  public themeColor: any = AppSettings.THEME_COLORS['around-me'];
  public barTitle: string = AppSettings.DEFAULT_AROUND_ME_BAR_TITLE;
  public nearestLoading: boolean = false;
  public showMenu: boolean = true;
  public ready: boolean = false;
  public disabled: boolean = false;
  public nearestGradient: string = AppSettings.ROUTING_DISTANCE_STOPS ? `linear-gradient(${AppSettings.ROUTING_DISTANCE_STOPS.map((stop: any) => stop[1]).join(',')})` : '#fff';
  public gradientLabels: string[] = AppSettings.ROUTING_DISTANCE_GRADIENT ? AppSettings.ROUTING_DISTANCE_STOPS ? AppSettings.ROUTING_DISTANCE_STOPS.map((stop: any) => stop[2]) : null : null;
  public legendIconUrls: string[] = AppSettings.ROUTING_DISTANCE_STOP_ICONS;
  public nearestLocations: any[];
  public nearestCategories: any[];
  public nearestCategoryIndices: any[] = [];
  public nearestActiveCategoryId: string;

  constructor(
    private annotationsService: AnnotationsService,
    private locationsService: LocationsService,
    private mapService: MapService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit() {
    this.mapService.disabled_tf.subscribe(disabled_tf => this.disabled = disabled_tf);

    this.mapService.ready
      .subscribe(ready => {
        if (ready) {
          this.ready = ready;
          const categories = this.mapService.categories.getValue();

          for (let x in categories) {
            for (let y in this.menuButtons) {
              if (categories[x].id === this.menuButtons[y].id && categories[x].children) {
                if (categories[x].icons) {
                  for (let iconKey in categories[x].icons) {
                    if (categories[x].icons[iconKey]) {
                      categories[x].icons[iconKey] = categories[x].icons[iconKey].replace('http://lm2:8080', AppSettings.LM2_URL);
                    }
                  }
                }

                for (let a = 0; a < categories[x].children.length; a++) {
                  if (categories[x].children[a].icons) {
                    for (let iconKey in categories[x].children[a].icons) {
                      if (categories[x].children[a].icons[iconKey]) {
                        categories[x].children[a].icons[iconKey] = categories[x].children[a].icons[iconKey].replace('http://lm2:8080', AppSettings.LM2_URL);
                      }
                    }
                  }
                }

                this.submenuButtons.push({
                  id: categories[x].id,
                  items: categories[x].children
                });
              }
            }
          }

          // Subscribe to parameter changes since the activated route around-me is seen as common for all menu options
          this.routerSubscription = this.route.params.subscribe((params) => {
            this.page = params.page;

            this.showMenu = true;
            this.mapService.annotations.next(null);

            if (this.boundsSubscription) {
              this.boundsSubscription.unsubscribe();
            }

            if (this.page == 'remote') {
              return;
            }

            if (this.page) {
              try {
                const categoryId = this.page;
                this.locationsService
                  .getByCategoryId(categoryId)
                  .then(data => {
                    this.mapService.annotations.next(data.locations);
                  });

                if (!this.showbackbtn) {
                  this.selectedId = this.page;
                  const parentCategory = this.mapService.categories.getValue().filter(category => category.id == this.selectedId && category.children)[0];
                  this.barTitle = parentCategory ? parentCategory.name : null;

                  for (let i in this.submenuButtons) {
                    if (this.submenuButtons[i].id === this.page) {
                      this.newmenulist = this.submenuButtons[i].items;
                    }
                  }

                  if (this.newmenulist.length > 0) {
                    this.showbackbtn = true;
                  }
                }
              }
              catch (ex) {
                console.error(ex.message);
              }
            }
            else {
              const center = this.mapService.center.getValue();
              if (center) {
                this.barTitle = 'Nearest';
                this.nearestLoading = true;

                this.locationsService
                  .getInRadius(this.projectId, new mapboxgl.LngLat(AppSettings.CENTER[0], AppSettings.CENTER[1]), AppSettings.WALKING_DISTANCE, AppSettings.NEAREST_CATEGORY_IDS)
                  .take(1)
                  .subscribe(data => {
                    this.nearestLocations = data;
                    this.mapService.annotations.next(data);

                    const allCategories = this.mapService.categories.getValue();
                    let nearestCategories = [];
                    for (let i = 0; i < this.nearestLocations.length; i++) {
                      const categories = this.nearestLocations[i].categories.filter(category => nearestCategories.map(nCategory => nCategory.id).indexOf(category.id) == -1);
                      nearestCategories = nearestCategories.concat(categories.map(category => {
                        const theCategory = allCategories.filter(eachCategory => eachCategory.id == category.id)[0];
                        if (
                          theCategory && 
                          theCategory.icon &&
                          theCategory.icon.length > 0
                        ) {
                          return theCategory;
                        }

                        return null;
                      }).filter(category => category));
                    }

                    this.nearestCategories = nearestCategories.sort((categoryA, categoryB) => categoryA.name.localeCompare(categoryB.name));

                    this.nearestCategoryIndices = [];
                    for (let i = 0; i < this.nearestCategories.length; i += 2) {
                      this.nearestCategoryIndices.push(i);
                    }

                    this.nearestActiveCategoryId = null;
                    this.nearestLoading = false;
                  });
              }
            }
          });
        }

        this.mapService.categories.subscribe(data => {
          if (AppSettings.SHOW_ALL_AROUND_ME_CATEGORIES) {
            this.populateMenuButtons(data.filter(category => !category.parent_id && category.icon));
          }

          for (let x in data) {
            for (let y in this.menuButtons) {
              if (data[x].id === this.menuButtons[y].id && data[x].children) {
                this.submenuButtons.push({
                  id: data[x].id,
                  items: data[x].children
                });
              }
            }
          }
        });
    });
  }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }
    if (this.boundsSubscription) {
      this.boundsSubscription.unsubscribe();
    }
  }

  populateMenuButtons(categories) {
    this.menuButtons = (
      AppSettings.SHOW_ALL_AROUND_ME_CATEGORIES ?
        AppSettings.AROUND_ME_BUTTONS.filter(
          button => button.label === 'Nearest'
        ) :
        AppSettings.AROUND_ME_BUTTONS
    );

    for (let i = 0; i < categories.length; i++) {
      if (!categories[i].exclude_from_directory) {
        this.menuButtons.push({
          label: categories[i].name,
          url: `/around-me/${categories[i].id}`,
          iconUrl: categories[i].icon,
          id: categories[i].id
        });
      }
    }
  }

  filterNearest(filterCategory) {
    this.mapService.removeDirections.next(true);
    this.mapService.removeMoreInfo.next(true);
    this.mapService.removePopup.next(true);

    if (this.nearestActiveCategoryId !== filterCategory.id) {
      this.nearestActiveCategoryId = filterCategory.id;

      const filteredLocations = this.nearestLocations.filter(location => location.categories.map(category => category.id).indexOf(filterCategory.id) > -1).map(location => {
        location.icon = filterCategory.icon;
        return location;
      });

      this.mapService.annotations.next(filteredLocations);
    }
    else {
      this.nearestActiveCategoryId = null;

      this.mapService.annotations.next(this.nearestLocations);
    }
  }

  menuClickFun(n, id) {
    this.selectedId = id;
    this.newmenulist = [];

    const parentCategory = this.mapService.categories.getValue().filter(category => category.id == this.selectedId && category.children)[0];
    this.barTitle = parentCategory ? parentCategory.name : null;

    if (id !== 0) {
      for (let i of this.submenuButtons) {
        if (i.id === id) {
            this.newmenulist = i.items;
        }
      }

      if (this.newmenulist.length > 0 ) {
        this.showbackbtn = true;
      }
    }
  }

  backFun() {
    this.barTitle = AppSettings.DEFAULT_AROUND_ME_BAR_TITLE;

    for (let i in this.menuButtons) {
      this.menuBtncss[i] = true;
    }
    this.showbackbtn = false;
    this.newmenulist = [];

    this.router.navigate(['/around-me/remote'], { queryParamsHandling: "preserve" });
  }

  closeMenu() {
    this.showMenu = false;
  }

  isActive(button) {
    return this.ready && ((this.page && button.url.endsWith(this.page)) || !(this.page || button.url.split('/')[2]));
  }
}
