import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';

import 'rxjs/add/operator/take';

import { MapService } from '../../providers/map.service';
import { LocationsService } from '../../providers/locations.service';
import { AppUtils } from '../../app/app.utils';

@Component({
  selector: 'w2g-locations',
  templateUrl: 'locations.page.html',
  styleUrls: [ 'locations.page.scss' ]
})
export class LocationsPage implements OnInit, OnDestroy {
  private subscription: Subscription;

  constructor(
    private activeRoute: ActivatedRoute,
    private mapService: MapService,
    private locationsService: LocationsService
  ) { }

  ngOnInit() {
    this.mapService
      .ready
      .take(2)
      .subscribe((ready) => {
        if (ready) {
          this.getLocations();
        }
      });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  getLocations() {
    this.subscription = this.activeRoute.params
      .subscribe((params) => {
        const categoryId = params.categoryId;
        const category = this.mapService.categories.getValue().filter(category => category.id == categoryId)[0];

        if (category && category.icon) {
          const categoryIcon = category.icon;

          this.locationsService
            .getByCategoryId(categoryId)
            .then(data => {
              this.mapService.annotations.next(data.locations.map(location => {
                location.icon = categoryIcon;
                return location;
              }));
            });
        }
      });
  }
}
