import {Component, OnInit, OnDestroy, ViewChild} from '@angular/core';
import {LocationsService} from '../../providers/locations.service';
import {ActivatedRoute, Router} from '@angular/router';
import {MapService} from '../../providers/map.service';
import {EventsService} from '../../providers/events.service';
import {BehaviorSubject, Subscription} from 'rxjs';
import {FormControl} from '@angular/forms';
import {Observable} from 'apollo-client/util/Observable';
import {LocationCategory, LocationCategoryChildren} from '../../models/api-models';
import {KeyboardService} from '../../providers/keyboard.service';

@Component({
    selector: 'w2g-location-search',
    templateUrl: 'location-search.page.html',
    styleUrls: ['location-search.page.scss']
})
export class LocationSearchPage implements OnInit {
    input: string;
    categories: LocationCategory[] = [];

    selectedCategory: LocationCategory;
    searchOrChildren: LocationCategoryChildren[] = [];

    options: Observable<any[]> = null;

    constructor(
        private eventsService: EventsService,
        private locationsService: LocationsService,
        private mapService: MapService,
        private route: ActivatedRoute,
        private router: Router,
        private keyboardService: KeyboardService
    ) {
    }

    ngOnInit() {
        this.getCategories();
        this.keyboardService.keyboard.subscribe((event) => {
            if (event) {
                this.input = event.value;
                this.inputChange();
            }
        });
    }

    getCategories() {
        this.locationsService.getCategories().then((result) => {
            this.categories = [];
            for (const cat of result) {
                if (!cat.exclude_from_directory) {
                    for (const child of cat.children) {
                        child.category = cat.name;
                    }
                    this.categories.push(cat);
                }
            }
        });
    }

    select(category: LocationCategory) {
      console.log('selected category', category);
        if (category != null) {
            this.selectedCategory = category;
            this.searchOrChildren = category.children;
            this.locationsService.getByCategoryId(category.id).then((result) => {
              console.log('locations by category', result);
            });
        } else {
            this.selectedCategory = null;
            this.searchOrChildren = [];
        }
    }

    inputChange() {
        if (!this.input) {
            this.select(this.selectedCategory);
            return;
        }
        this.searchOrChildren = [];
        for (const cat of this.categories) {
            for (const child of cat.children) {
                if (this.startWith(child.name, this.input)) {
                    this.searchOrChildren.push(child);
                }
            }
        }
    }

    back() {
        if (this.selectedCategory) {
            this.select(null);
        } else {
            this.router.navigate(['/']);
        }
    }

    private startWith(param1: string, param2: string) {
        return param1 != null && param2 != null && param1.toLocaleLowerCase().startsWith(param2.toLocaleLowerCase());
    }
}
