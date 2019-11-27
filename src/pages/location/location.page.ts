import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import 'rxjs/add/operator/take';

import { LocationsService } from '../../providers/locations.service';
import { MapService } from '../../providers/map.service';

import { AppUtils } from '../../app/app.utils';

@Component({
  selector: 'w2g-location',
  templateUrl: 'location.page.html',
  styleUrls: [ 'location.page.scss' ]
})
export class LocationPage implements OnInit {
  constructor(
    private activeRoute: ActivatedRoute,
    private locationsService: LocationsService,
    private mapService: MapService
  ) { }

  ngOnInit() {
    this.mapService
      .ready
      .take(2)
      .subscribe((ready) => {
        if (ready) {
          this.getLocation();
        }
      });
  }

  getLocation() {
    this.activeRoute.params
      .take(1)
      .subscribe((params) => {
        const locationId = params.locationId;

        if (locationId) {
          this.locationsService
            .get(locationId, {
              context: AppUtils.getContext()
            })
            .then(location => {
              this.mapService.getpopupinfo.next(location);
              this.mapService.location.next(location);
            });
        }
      });
  }
}
