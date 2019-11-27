import {Component, Input, OnInit, OnDestroy, EventEmitter, Output} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {AppSettings} from '../../app/app.settings';
import {MapService} from '../../providers/map.service';
import {FloorsService} from '../../providers/floors.service';
import {AppUtils} from '../../app/app.utils';


@Component({
  selector: 'w2g-floorplan',
  templateUrl: './Floorplan.widget.html',
  styleUrls: ['./Floorplan.widget.scss']
})
export class FloorplanWidget implements OnInit , OnDestroy {
  @Input('has-sidebar') hasSidebar: boolean = false;

  @Output('floorEvent') floorEvent: EventEmitter<any[]> = new EventEmitter<any[]>();
  @Output('removeFloorEvent') removeFloorEvent: EventEmitter<any> = new EventEmitter<any>();

  subscriptionfloor: Subscription;
  subscriptionbuildings: Subscription;
  parentfloor: any;

  public themeColor = AppSettings.THEME_COLORS['around-me'];

  public floorlist: any[];
  public currentFloor: any;

  private buildings: any;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private mapService: MapService,
    private floorsService: FloorsService
  ) {
  }


  ngOnInit() {
    this.subscriptionbuildings = this.floorsService.buildings
      .subscribe((data) => {
        this.buildings = data;
      });

    this.subscriptionfloor = this.mapService.floor
      .subscribe((data) => {
        if (data != null) {
          this.buildingBfHandler(data);
          this.parentfloor = data.id;
        }
      });
  }

  ngOnDestroy() {
    if(this.subscriptionfloor) {  this.subscriptionfloor.unsubscribe(); }
    if(this.subscriptionbuildings) {  this.subscriptionbuildings.unsubscribe(); }
  }

  floorbuttonFun(id) {
    this.floorEvent.emit(id);
  }

  goOutside() {
    if (this.currentFloor) {
      if (this.router.url.indexOf('/floorplans') > -1) {
        this.router.navigate([`/floorplans`], { queryParamsHandling: "preserve" });
      }

      this.removeFloorEvent.emit(this.currentFloor);
    }
  }

  buildingBfHandler(data) {
    let alreadyMapped = false;
    if (this.floorlist) {
      if (data.parent_name !== this.floorlist[0].parent_name) {
        alreadyMapped = true;
      }
    }

    if (alreadyMapped === false) {
      const id = data.id;

      this.buildings.forEach((value) => {
        for (const i of value) {
          if (i.id === id) {
            this.currentFloor = i;
            this.floorlist = value;
          }
        }
      });
    }
  }
}
