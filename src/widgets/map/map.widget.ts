import * as moment from 'moment';
import * as turf from '@turf/turf';
import * as mapboxgl from 'mapbox-gl';
import * as stripHtml from 'string-strip-html';

import { Component, OnInit, OnDestroy, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { take } from 'rxjs/operators';

import { ActivityService } from '../../providers/activity.service';
import { AnnotationsService } from '../../providers/annotations.service';
import { AuthService } from '../../providers/auth.service';
import { FloorsService } from '../../providers/floors.service';
import { GeocodeService } from '../../providers/geocode.service';
import { LocationsService } from '../../providers/locations.service';
import { MapService } from '../../providers/map.service';
import { PopupService } from '../../providers/popup.service';
import { RouteService } from '../../providers/route.service';
import { DirectionsService } from '../../providers/directions.service';
import { EventsService } from '../../providers/events.service';
import { PcLabsService } from '../../providers/pc-labs.service';
import { StudySpacesService } from '../../providers/study-spaces.service';

import { AnnotationMarker } from '../../models/annotation.marker';
import { RouteMarker } from '../../models/route.marker';
import { TourMarker } from '../../models/tour.marker';

import { AppSettings } from '../../app/app.settings';
import { AppUtils } from '../../app/app.utils';
import {NotificationsService} from '../../providers/notifications.service';
import {Subscription} from '../../../node_modules/rxjs';


@Component({
  selector: 'w2g-map',
  templateUrl: 'map.widget.html',
  styleUrls: ['map.widget.scss']
})
export class MapWidget implements OnInit, OnDestroy {
  @ViewChild('popup', {
    read: ViewContainerRef
  }) viewContainerRef: ViewContainerRef;

  @Input('hasHeader') hasHeader: boolean = false;
  @Input('hasSidebar') hasSidebar: boolean = false;
  @Input('hasSubSidebar') hasSubSidebar: boolean = false;
  @Input('isFullSize') isFullSize: boolean = false;

  journeyMarkers: any[];
  fitboundserviceSubcribtion: Subscription;
  mapcategories: any;
  getpopupinfoSubcribtion: Subscription;
  infopopSubcribtion: Subscription;
  disabled_Subcribtion: Subscription;

  private map: mapboxgl.Map;
  private popup: mapboxgl.Popup;
  private markers: mapboxgl.Marker[] = [];
  private projectId: number = AppSettings.PROJECT_ID;
  private campusId: number = AppSettings.CAMPUS_ID;
  private center: number[] = AppSettings.CENTER;
  private bearing: number = AppSettings.BEARING;
  private zoom: number = AppSettings.ZOOM;
  private mapButtons: any[] = AppSettings.MAP_BUTTONS;
  public mapButtonstoprint: any[] = AppSettings.MAP_BUTTONS.slice(0, 3);

  private initialStyle: any;
  private hasInitialStyle: boolean = true;

  private initialBounds: number[][];
  private floorIdsMap: Map<string, string[]> = new Map<string, string[]>();
  public currentFloor: any;

  public preloading: boolean = true;
  public loading: boolean = false;

  public method: string;
  public themeColor: string;
  public lightColor: string;
  public spinnerColor: string;

  private routerSubscription;
  private annotationsSubscription;
  private searchSubscription;

  private routeLegs: any[];
  private routeLegIndex: number;
  private routeGeojson: any;
  private routeCoordinates: number[][];
  private speedFactor: number = 1;
  private animation: any;
  private progress: number = 0;

  private isJourneyPlanner: boolean = false;
  public Einfo: any[];
  public showingInfo: boolean = false;
  private disabled_tf: boolean = false;
  private LM2_URL: any = AppSettings.LM2_URL;
  private popCss: any[] = ['90px', '35px', '93%', 'initial'];
  private topPop: string;
  private notificationSubscription: Subscription;
  private tourPolylineIds: string[] = [];
  private tourIntroTimeout;

  private pcLabs: any[] = [];
  private pcLabsInterval: any;

  private studySpaces: any[] = [];
  private studySpacesInterval: any;

  public qrShareUrl: string;

  constructor(
    private activityService: ActivityService,
    private annotationsService: AnnotationsService,
    private authService: AuthService,
    private floorsService: FloorsService,
    private geocodeService: GeocodeService,
    private locationsService: LocationsService,
    private mapService: MapService,
    private popupService: PopupService,
    private routeService: RouteService,
    private router: Router,
    private directionsService: DirectionsService,
    private eventsService: EventsService,
    private NotifiService: NotificationsService,
    private pcLabsService: PcLabsService,
    private studySpacesService: StudySpacesService
  ) { }

  ngOnInit() {
    this.mapService.projectId.next(this.projectId);
    this.mapService.campusId.next(this.campusId);

    // this.notificationsService.disabledfromNotification.subscribe((data) => this.disabledhandler(data));

    this.mapService
      .loading
      .subscribe((loading) => this.loading = loading);


    const disabledButton = this.mapButtons.filter(button => button.id == 'disabled')[0];
    if (disabledButton) {
      if (this.disabled_tf) {
        disabledButton.currentIconUrl = disabledButton.activeIconUrl;
      }
      else {
        disabledButton.currentIconUrl = disabledButton.iconUrl;
      }
    }

    this.themeColor = AppSettings.THEME_COLORS.search.hex;//AppSettings.THEME_COLORS[this.router.url.split('/')[1].split('?')[0]].hex;
    this.lightColor = AppSettings.THEME_COLORS.search.lightHex;//AppSettings.THEME_COLORS[this.router.url.split('/')[1].split('?')[0]].lightHex;
    this.spinnerColor = AppSettings.THEME_COLORS.search.name;//AppSettings.THEME_COLORS[this.router.url.split('/')[1].split('?')[0]].name;
    this.mapService.spinnerColor.next(this.spinnerColor);

    this.getCategories()
      .then((categories) => {
        this.floorsService
          .getCampusById(this.projectId, this.campusId)
          .then((campus) => {
            if (campus) {
              if (!mapboxgl.supported() && window.parent) {
                window.parent.postMessage({
                  error: 'webglcontextlost'
                }, '*');
              }

              this.map = new mapboxgl.Map(<any>{
                container: 'map',
                center: this.center,
                bearing: this.bearing,
                zoom: this.zoom,
                maxZoom: 20,
                style: `${AppSettings.APP_MANAGER_URL}/api/styles/projects/${this.projectId}/floors/overview`,
                transformRequest: (url, type) => {
                  if (url.startsWith(AppSettings.APP_MANAGER_URL) && (
                    type === 'Style' ||
                    type === 'Tile'
                  )) {
                    return {
                      url: `${url}?context=${AppSettings.IS_STAGING ? 'staging' : 'live'}`,
                      headers: {
                        'Authorization': `Bearer ${this.authService.token.getValue()}`
                      }
                    };
                  }
                  else if (url.startsWith('http://lm2:8080')) {
                    return {
                      url: url.replace('http://lm2:8080', AppSettings.LM2_URL)
                    };
                  }
                }
              });

              this.map.on('webglcontextlost', (event) => {
                if (window.parent) {
                  window.parent.postMessage({
                    error: 'webglcontextlost'
                  }, '*');
                }
              });

              this.map.on('click', this.onClick.bind(this));
              this.map.on('moveend', this.onMoveEnd.bind(this));

              this.map.once('load', () => {
                console.log("MAP LOADED", this.map);
                this.drawCenter();

                this.parseMethod(this.router.url);

                this.routerSubscription = this.router.events.subscribe((event) => {
                  if (event instanceof NavigationEnd) {
                    if (event.url.endsWith('closed')) {
                      return;
                    }

                    this.parseMethod(event.url);
                    const themeColor = AppSettings.THEME_COLORS[event.url.split('/')[1].split('?')[0]];
                    if (themeColor) {
                      this.themeColor = themeColor.hex;
                      this.lightColor = themeColor.lightHex;
                      this.spinnerColor = themeColor.name;
                      this.mapService.spinnerColor.next(this.spinnerColor);
                    }
                  }
                });

                this.mapService.center.next(this.map.getCenter());
                this.mapService.bounds.next(this.map.getBounds());

                this.mapService.directionsLegIndex
                  .subscribe((directionsLegIndex: number) => {
                    if (this.routeLegs && directionsLegIndex !== null) {
                      if(directionsLegIndex < 0){
                          this.routeLegIndex = this.routeLegIndex + directionsLegIndex;
                      } else {
                          this.routeLegIndex = directionsLegIndex;
                      }

                      this.drawOfflineRouteLeg();
                    }
                  });

                this.mapService.tour
                  .subscribe((tour) => {
                    if (tour) {
                      this.removeTourPolylines();
                      this.drawTour(tour);
                    }
                  });

                this.mapService.rawTours
                  .subscribe((tours) => {
                    if (tours) {
                      this.removeTourPolylines();
                      for (let i = 0; i < tours.length; i++) {
                        this.drawTour(tours[i]);
                      }
                    }
                  });

                this.mapService.journey
                  .subscribe((journey) => {
                    this.removeJourneyMarkers();
                    if (journey) {
                      this.drawJourney(journey);
                    }
                    else {
                      this.removeJourneyPolylines();
                    }
                  });

                this.mapService.directionsDestination
                  .subscribe((destination) => {
                    if (destination) {
                      if (AppSettings.ROUTING_OFFLINE) {
                        this.routeService
                          .getRoute({
                            lng: this.center[0],
                            lat: this.center[1]
                          }, {
                            lng: destination.split(',')[1],
                            lat: destination.split(',')[0]
                          }, destination.split(',')[2], destination.split(',')[3])
                          .then(data => this.drawOfflineRoute(data));
                      }
                      else {
                        this.directionsService
                            .get(this.center.join(','), destination, this.projectId, this.campusId, this.disabled_tf, false)
                            .pipe(take(1))
                            .subscribe(data => {
                              this.recordDirectionsNavigation(this.center.join(','), destination, this.disabled_tf, !data.error, data.error);
                              this.drawOfflineRoute(data);
                            }, err => {
                              console.error(err.message);
                              this.recordDirectionsNavigation(this.center.join(','), destination, this.disabled_tf, false, err.message);
                            });
                      }

                      this.mapService.directionsDestination.next(null);
                    }
                  });

                this.mapService.removeDirections
                  .subscribe((removeDirections) => {
                    if (removeDirections) {
                      this.removePolyline();
                      this.mapService.removeDirections.next(false);
                    }
                  });

                this.mapService.removePopup
                  .subscribe((removePopup) => {
                    if (removePopup) {
                      this.removePopup();
                      this.mapService.removePopup.next(false);
                    }
                  });

                const goReady = () => {
                  const doSpaces = () => {
                    if (AppSettings.STUDY_SPACES_URL && AppSettings.STUDY_SPACES_CATEGORY_ID) {
                      if (this.studySpaces.length > 0) {
                        this.preloading = false;
                        this.mapService.ready.next(true);
                      }
                      else {
                        this.studySpacesService
                          .getAll()
                          .take(1)
                          .subscribe(data => {
                            if (data.errorText) {
                              console.warn(data.errorText);

                              this.preloading = false;
                              return this.mapService.ready.next(true);
                            }

                            this.studySpaces = data.filter(space => space.ratio);

                            this.preloading = false;
                            this.mapService.ready.next(true);
                          }, err => {
                            console.warn(err.message);

                            this.preloading = false;
                            this.mapService.ready.next(true);
                          });
                      }
                    }
                    else {
                      this.preloading = false;
                      this.mapService.ready.next(true);
                    }
                  };

                  if (AppSettings.PC_LABS_URL && AppSettings.PC_LABS_CATEGORY_ID) {
                    if (this.pcLabs.length > 0) {
                      doSpaces();
                    }
                    else {
                      this.pcLabsService
                        .getAll()
                        .take(1)
                        .subscribe(data => {
                          if (data.errorText) {
                            console.warn(data.errorText);
                            return doSpaces();
                          }

                          this.pcLabs = data.filter(lab => lab.ratio);
                          doSpaces();
                        }, err => {
                          console.warn(err.message);
                          doSpaces();
                        });
                    }
                  }
                  else {
                    doSpaces();
                  }
                };

                if (this.routeService.graph.getValue()) {
                  goReady();
                }
                else {
                  this.routeService
                    .getGraph()
                    .then(() => {
                      goReady();
                    });
                }
              });
            }
          });
      });

      this.infopopSubcribtion = this.mapService.removeMoreInfo.subscribe(value => {
        if (value) {
          this.closeMoreInfo();
        }
      });

      this.disabled_tf = this.mapService.disabled_tf.getValue();
      this.disabled_Subcribtion = this.mapService.disabled_tf.subscribe((data) =>{
          this.disabled_tf = data;
          if (this.disabled_tf === true) {
            this.popCss = ['1050px', '155px', '80%'];
          } else {
            this.popCss = [this.topPop, '35px', '93%'];
          }
      });

      this.notificationSubscription = this.NotifiService.showingNotification.subscribe((data) => {
          if (data === true) {
              this.topPop = '180px';
              if (this.disabled_tf === false) {
                  this.popCss[0] = '180px';
              } else {
                  this.popCss[0] = '1050px';
              }
          } else {
              this.topPop = '90px';
              if (this.disabled_tf === false) {
                  this.popCss[0] = '90px';
              } else {
                  this.popCss[0] = '1050px';
              }
          }
      });

      this.getpopupinfoSubcribtion = this.mapService.getpopupinfo.subscribe((location) => {
        if(location !== null) {
          this.locationsService
            .get(location.id, {
              context: AppUtils.getContext()
            })
            .then((data) => {
              if (data) {
                this.parseLocation(data);
              }
            });
        }

      });
      this.fitboundserviceSubcribtion = this.mapService.fitboundservice.subscribe((data) => {
        if (data !== null ) {
            if (this.disabled_tf) {
                this.map.fitBounds(data, <any>{
                    bearing: AppSettings.BEARING,
                    padding: {
                        top: 200,
                        bottom: 700,
                        left: 100,
                        right: 100
                    }
                });
            } else {
                this.map.fitBounds(data, <any>{
                  bearing: AppSettings.BEARING,
                    padding: {
                        top: 700,
                        bottom: 200,
                        left: 100,
                        right: 100
                    }
                });
            }
        }
      });


      }

  ngOnDestroy() {
    if (this.routerSubscription) {
      this.routerSubscription.unsubscribe();
    }

    if (this.pcLabsInterval) {
      clearInterval(this.pcLabsInterval);
      this.pcLabsInterval = null;
    }

    if (this.studySpacesInterval) {
      clearInterval(this.studySpacesInterval);
      this.studySpacesInterval = null;
    }

    if (this.tourIntroTimeout) {
      clearInterval(this.tourIntroTimeout);
      this.tourIntroTimeout = null;
    }

    this.removePolyline();
    this.removeTourPolylines();
    this.removeJourneyPolylines();
    this.removeMarkers();
    this.removeClusteredMarkers();
    this.removeJourneyMarkers();

    this.mapService.reset();
  }

  getCategories() {
    return new Promise((resolve, reject) => {
      this.locationsService
        .getCategories()
        .then(categories => {
          for (let i = categories.length - 1; i >= 0; i--) {
            if (categories[i].parent_id) {
              for (let j = 0; j < categories.length; j++) {
                if (categories[j].id == categories[i].parent_id) {
                  if (!categories[j].children) {
                    categories[j].children = [];
                  }
                  categories[j].children.push(categories[i]);
                  break;
                }
              }
            }
          }

          this.mapService.categories.next(categories);
          resolve(categories.filter((category) => !category.exclude_from_directory));
        });
    });
  }

  parseMethod(url) {
    this.removeJourneyPolylines();
    this.removePolyline();
    this.removeAllFloors();

    setTimeout(() => this.map.resize(), 0);

    if (this.annotationsSubscription) {
      this.annotationsSubscription.unsubscribe();
    }

    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }

    this.method = url.slice(1).split('?')[0];
    this.isJourneyPlanner = this.method.startsWith('transport/planner');

    if (this.method === '') {
      this.map.setCenter(AppSettings.CENTER);
      this.map.setBearing(AppSettings.BEARING);
      this.map.setZoom(AppSettings.ZOOM);
    }

    if (!this.method.startsWith('transport/services')) {
      this.removeMarkers();
      this.removePopup();
      this.removeJourneyMarkers();
    }

    if (this.method === 'transport/rail') {
      this.map.flyTo({center: this.center, zoom: 14.6});
    }
    else if (this.method === 'transport/cycle') {
      this.map.flyTo({center: this.center, zoom: AppSettings.ZOOM});
    }
    else if (this.method === 'transport/walking') {
      this.map.flyTo({center: this.center, zoom: AppSettings.ZOOM});
    }
    else if (this.method == 'around-me') {
      if (AppSettings.RENDER_CIRCLE) {
          this.darkenStyle();
          this.drawRadius();
      }
    }
    else if (!this.method.includes('/services/') && !this.method.includes('/around-me/remote') && !this.method.startsWith('heritage')) {
      this.showingInfo = false;
      if (AppSettings.RENDER_CIRCLE) {
          this.resetStyle();
          this.removeRadius();
      }
    }
    else if (this.method === 'transport') {
      this.map.flyTo({
          center: this.center,
          zoom: 16
      });
    }

    if (this.method.startsWith('around-me') || this.method.startsWith('transport') || this.method.startsWith('events') || this.method.startsWith('locations')) {
      this.annotationsSubscription = this.mapService.annotations
        .subscribe((annotations) => {
          if (annotations) {
            this.activityService.event.next('draw-annotations');
            this.drawClusteredMarkers(annotations, this.method !== 'around-me' && !this.method.includes('transport/parking'));
          }
          else {
            this.removeMarkers();
            this.removeClusteredMarkers();
            this.removeJourneyMarkers();
          }
        });

      this.mapService.bounds.next(this.map.getBounds());
    }

    if (this.method.startsWith('around-me')) {
      if (this.pcLabsInterval) {
        clearInterval(this.pcLabsInterval);
        this.pcLabsInterval = null;
      }

      if (this.studySpacesInterval) {
        clearInterval(this.studySpacesInterval);
        this.studySpacesInterval = null;
      }
    }

    if (this.method.startsWith('around-me') || this.method.startsWith('search')) {
      this.searchSubscription = this.mapService.location
        .subscribe((location) => {
          if (location) {
            this.showingInfo = false;

            this.drawPopup(location.center_point ? location.center_point : location.point, location);
            this.getLocation(location.id, false);

            if (AppSettings.ROUTING_OFFLINE) {
              if (location.point) {
                this.routeService
                  .getRoute({
                    lng: this.center[0],
                    lat: this.center[1]
                  }, {
                    lng: location.point[0],
                    lat: location.point[1]
                  }, AppSettings.FLOOR_ID ? AppSettings.FLOOR_ID.toString() : 'undefined', location.floor_id ? location.floor_id.toString() : 'null')
                  .then(data => {
                    if (data.distance < AppSettings.ROUTING_MAX_WALK_DISTANCE) {
                      this.drawOfflineRoute(data)
                    }
                    else {
                      this.map.panTo(location.point);
                    }
                  })
                  .catch(err => {
                    console.error(err.message);
                    this.map.panTo(location.point);
                  });
              }
            }
            else {
              this.directionsService
                .get(this.center.join(','), location.parent && location.parent.id ? location.parent.id : location.id, this.projectId, this.campusId, this.disabled_tf, false)
                .pipe(take(1))
                .subscribe(data => {
                  this.recordDirectionsNavigation(this.center.join(','), location.parent && location.parent.id ? location.parent.id : location.id, this.disabled_tf, !data.error, data.error);
                  this.drawOfflineRoute(data)
                }, err => {
                  console.error(err.message);
                  this.recordDirectionsNavigation(this.center.join(','), location.parent && location.parent.id ? location.parent.id : location.id, this.disabled_tf, false, err.message);
                });
            }
            this.mapService.location.next(null);
          }
        });
    }

    if (this.method.startsWith('heritage')) {
      this.removeClusteredMarkers();
      this.closeMoreInfo();
    }
    else {
      this.removeTourPolylines();
      this.removeClusteredMarkers();
      this.removeMarkers();

      if (this.tourIntroTimeout) {
        clearInterval(this.tourIntroTimeout);
        this.tourIntroTimeout = null;
      }
    }
  }

  recordDirectionsNavigation(origin, destination, disabled, success, error) {
    const params: any = {
      url: `/directions/projects/${AppSettings.PROJECT_ID}/from/${origin}/to/${destination}?campusId=${AppSettings.CAMPUS_ID}&disabled=${disabled}`,
      queryParams: {
        campusId: AppSettings.CAMPUS_ID,
        disabled: disabled
      },
      success: success
    };

    if (typeof error !== 'undefined') {
      params.error = error;
    }

    this.activityService.action.next({
      name: 'w2g-navigation',
      createdAt: moment.utc().format(),
      params: params
    });
  }

  onMapButtonClick(id) {
    if (id == 'zoom-in') {
      this.map.zoomIn();
    }
    else if (id == 'zoom-out') {
      this.map.zoomOut();
    }
    else if (id == 'center-pan') {
      this.removeAllFloors();
        this.map.flyTo({
            center: this.center,
            bearing: this.bearing,
            zoom: 16
        });
    } else if (id == 'disabled') {
      this.disabledhandler(id);
    }
  }

  private disabledhandler(id) {
      const disabledButton = this.mapButtons.filter(button => button.id == id)[0];
      if (disabledButton) {
        if (this.disabled_tf) {
          disabledButton.currentIconUrl = disabledButton.iconUrl;
          this.disabled_tf = false;
        }
        else {
          disabledButton.currentIconUrl = disabledButton.activeIconUrl;
          this.disabled_tf = true;
        }
      }

  }

  onClick(event) {
    const features = this.map.queryRenderedFeatures(event.point);
    if (event.originalEvent.target.classList.contains('marker')) {
      return;
    }

    if (this.isJourneyPlanner) {
      this.geocodeService
        .reverse(event.lngLat)
        .take(1)
        .subscribe((data) => {
          if (data.address) {
            this.drawPopup(event.lngLat, {
              //name: data.display_name,
              name: `${data.address.road ? data.address.road : data.address.pedestrian ? data.address.pedestrian : data.address.suburb}, ${data.address.city ? data.address.city : data.address.town}, ${data.address.postcode}`,
              point: event.lngLat,
              isDestination: true
            });
          }
        });
    }
    else {
      const cluster = features.filter(function (feature: any) {
        return feature.properties.cluster;
      })[0];

      if (cluster) {
        this.expandCluster((<any>cluster).layer.source, cluster.properties.cluster_id);
      }
      else {
        let marker = features.filter(function (feature: any) {
          return feature.layer.id === 'annotation-markers-layer' ||
            feature.layer.id === 'annotation-pc-labs-markers-layer' ||
            feature.layer.id === 'annotation-study-spaces-markers-layer' ||
            feature.layer.id === 'annotations';
        })[0];

        let drawn = false;
        if (marker) {
          this.showingInfo = false;

          const location = marker.properties;
          location.point = (<any>marker.geometry).coordinates;
          const point = [event.lngLat.lng, event.lngLat.lat];
          this.map.flyTo({center: point});

          this.drawPopup(event.lngLat, marker.properties);
          drawn = true;

          if (!location.disable_selection || location.disable_selection == 0) {
            this.getLocation(marker.properties.id);
          }
        }
        else if (this.method.startsWith('around-me') || this.method.startsWith('search') || this.method.startsWith('locations')) {
          let polygon = features.filter(function (feature: any) {
            return feature.layer.id.match(/^[0-9]*-polygons$/);
          })[0];

          if (!polygon) {
            polygon = features.filter(function (feature: any) {
              return feature.layer.id == 'polygons' || feature.layer.id == 'polygons_rooftop';
            })[0];
          }

          if (polygon) {
            const location = polygon.properties;
            if (!location.categories || location.categories.includes('Sites') || !location.categories.includes('Site')) {
              this.showingInfo = false;

              if (!location.floor_id) {
                location.floor_id = null;
              }

              this.drawPopup(event.lngLat, location);
              drawn = true;

              if (!location.disable_selection || location.disable_selection == 0) {
                this.getLocation(location.id);
              }
            }
          }
        }

        if (!drawn && this.method.startsWith('around-me')) { // Fall back to Reverse Geocode
          this.geocodeService
            .reverse(event.lngLat)
            .take(1)
            .subscribe((data) => {
              if (data.address) {
                this.drawPopup(event.lngLat, {
                  name: `${data.address.road ? data.address.road : data.address.pedestrian ? data.address.pedestrian : data.address.suburb}, ${data.address.city ? data.address.city : data.address.town}, ${data.address.postcode}`,
                  point: [event.lngLat.lng, event.lngLat.lat]
                });
              }
            });
        }
      }
    }
  }

  expandCluster(source, clusterId) {
    (<any>this.map.getSource(<any>source)).getClusterChildren(clusterId, (err, features) => {
      if (err) {
        return console.error(err.message);
      }

      for (let i = 0; i < features.length; i++) {
        if (!features[i].properties.cluster) {
          const line = turf.lineString(features.map(feature => feature.geometry.coordinates));
          const bbox = turf.bbox(line);

          const bounds = [
            [
              bbox[0],
              bbox[1]
            ],
            [
              bbox[2],
              bbox[3]
            ]
          ];

          if (this.disabled_tf) {
            this.map.fitBounds(bounds, <any>{
              bearing: this.map.getBearing(),
              padding: {
                top: 200,
                bottom: 700,
                left: 100,
                right: 100
              }
            });
          } else {
            this.map.fitBounds(bounds, <any>{
              bearing: this.map.getBearing(),
              padding: {
                top: 700,
                bottom: 200,
                left: 100,
                right: 100
              }
            });
          }

          return true;
        }
      }

      this.expandCluster(source, features[0].properties.cluster_id);
    });
  }

  onMoveEnd(event) {
    this.mapService.center.next(this.map.getCenter());
    this.mapService.bounds.next(this.map.getBounds());
  }

  drawPopup(position: any, location?) {
    if (!position) {
      let errorMessage = 'Unable to draw popup as no position was provided';
      if (location) {
        errorMessage += ` for location ${location.name} (${location.id})`;
      }

      return console.warn(errorMessage);
    }

    if (typeof position === 'string') {
      position = JSON.parse(position);
    }

    this.removePopup();

    this.popupService.setRootViewContainerRef(this.viewContainerRef);
    const component = this.popupService.addPopupWidget(location, this.projectId, this.method.split('/')[0]);

    component.instance.floorEvent
      .subscribe((floor) => this.changeFloor(floor));

    component.instance.removeFloorEvent
      .subscribe((floor) => this.removeFloor(floor));

    component.instance.shareEvent
      .subscribe((url) => this.qrShareUrl = url);

    component.instance.closeEvent
      .subscribe(() => this.removePopup());

    this.popup = new mapboxgl.Popup({
      closeOnClick: false
    })
      .setLngLat(position)
      .setDOMContent(component._view.nodes[0].renderElement)
      .addTo(this.map);
  }

  unsetQrShareUrl() {
    this.qrShareUrl = null;
  }

  removePopup() {
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
    }
  }

  changeFloor(floor, fitBounds = true) {
    if (floor) {
      this.currentFloor = null;

      this.removeMarkers();
      this.removePopup();
      this.removePolyline();

      this.floorsService
        .getLayersByFloorId(floor.id, this.projectId)
        .then((data) => {
          if (data) {
            const addFloor = () => {
              this.removeAllFloors();

              this.map.addSource(floor.id.toString(), {
                type: data.source.type,
                tiles: data.source.tiles,
                minzoom: data.source.minzoom
              });
              for (let i = 0; i < data.layers.length; i++) {
                data.layers[i].layout.visibility = 'visible';
                this.map.addLayer(data.layers[i]);
              }
              this.floorIdsMap.set(floor.id, data.layers.map((layer) => layer.id));
              this.currentFloor = floor;
              this.mapService.floor.next(floor);
            };

            if (fitBounds) {
              const bounds = mapboxgl.LngLatBounds.convert(data.source.bounds);
              if (bounds) {
                this.map.once('moveend', addFloor);
                this.map.fitBounds(bounds, <any>{
                  bearing: AppSettings.BEARING
                });
              }
              else {
                addFloor();
                console.warn(`Source for floor ${floor.id} does not provide valid bounds, panning aborted.`);
              }
            }
            else {
              addFloor();
            }
          }
        });
    }
  }

  removeAllFloors() {
    this.floorIdsMap.forEach((entry, floorId) => this.removeFloor({
      id: floorId
    }));
  }

  removeFloor(floor) {
    this.removePopup();

    if (floor) {
      const layerIds = this.floorIdsMap.get(floor.id);
      if (layerIds) {
        for (let i = 0; i < layerIds.length; i++) {
          this.map.removeLayer(layerIds[i]);
        }
        this.map.removeSource(floor.id.toString());

        this.floorIdsMap.delete(floor.id);
      }

      if (this.currentFloor && this.currentFloor.id == floor.id) {
        this.currentFloor = null;
      }
      if (this.mapService.floor.getValue().id == floor.id) {
        this.mapService.floor.next(null);
      }
    }
  }

  private drawTour(tour) {
    if (tour.type == 'line') {
      this.addPolyline(`tour-polyline-${tour._id}`, AppSettings.TOURS_PAINT && AppSettings.TOURS_PAINT[tour._id] ? AppSettings.TOURS_PAINT[tour._id] : AppSettings.TOUR_PAINT, tour.polyline);
      this.tourPolylineIds.push(`tour-polyline-${tour._id}`);
    }

    if (AppSettings.TOUR_IDS && AppSettings.TOUR_IDS.indexOf(tour._id) > -1 || tour._id == AppSettings.DEFAULT_TOUR_ID) {
      this.map.fitBounds(this.getTourBounds(tour), <any>{
        bearing: AppSettings.BEARING,
        padding: {
          top: this.mapService.disabled_tf.getValue() ? 160 : 600,
          bottom: this.mapService.disabled_tf.getValue() ? 800 : 200,
          left: 100,
          right: 100
        },
        maxZoom: 18
      });
    }

    let introPoint = null;
    let introIndex;
    for (let i = 0; i < tour.poi.length; i++) {
      if (tour.poi[i].type !== 'intro') {
        this.drawTourMarker(new mapboxgl.LngLat(tour.poi[i].geometry.coordinates[0], tour.poi[i].geometry.coordinates[1]), tour.poi[i].icon ? tour.poi[i].icon : `${AppSettings.W2G_URL}/${AppSettings.TOUR_MARKER_ICON}`, tour.poi[i]._id, () => {
          const tourMarkers: TourMarker[] = <TourMarker[]>this.markers.filter(marker => marker instanceof TourMarker);
          for (let j = 0; j < tourMarkers.length; j++) {
            if (tourMarkers[j].getId() == tour.poi[i]._id) {
              (<any>tourMarkers[j])._element.classList.add('large');
            }
            else {
              (<any>tourMarkers[j])._element.classList.remove('large');
            }
          }

          this.mapService.tourPoint.next(tour.poi[i]);
        }, tour.poi[i].className ? `tour-marker ${tour.poi[i].className}` : 'tour-marker');
      }
      else if (!introPoint) {
        introPoint = tour.poi[i];
        introIndex = i;
      }
    }

    if (introPoint && AppSettings.TOUR_INTRO_POINT_TIMEOUT) {

      return; //don't dismiss the intro - wait for the user to select a POI

      this.tourIntroTimeout = setTimeout(() => {
        const currentPoint = this.mapService.tourPoint.getValue();
        if (introPoint._id == currentPoint._id) {
          if (tour.poi[introIndex + 1]) {
            const tourMarkers: TourMarker[] = <TourMarker[]>this.markers.filter(marker => marker instanceof TourMarker);
            for (let j = 0; j < tourMarkers.length; j++) {
              if (tourMarkers[j].getId() == tour.poi[introIndex + 1]._id) {
                (<any>tourMarkers[j])._element.classList.add('large');
              }
              else {
                (<any>tourMarkers[j])._element.classList.remove('large');
              }
            }

            this.mapService.tourPoint.next(tour.poi[introIndex + 1]);
          }
        }
      }, AppSettings.TOUR_INTRO_POINT_TIMEOUT * 1000);
    }
  }

  private getTourBounds(tour: any) {
    var coords = turf.lineString(tour.poi.map(point => point.geometry.coordinates)).geometry.coordinates;

    return coords.reduce(function(bounds: any, coords) {
      return bounds.extend(coords);
    }, new mapboxgl.LngLatBounds(coords[0], coords[0]));
  }

  private drawJourney(journey) {
    this.removeJourneyPolylines();
    const boundpoint = [];

    for (let i = 0; i < journey.route_parts.length; i++) {
      const route = journey.route_parts[i];
      this.addPolyline(`journey-polyline-${i}`, AppSettings.JOURNEY_PAINT[route.mode], {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: route.coordinates
            }
          }
        ]
      });
      if (route.boundpoint) {
          boundpoint.push(route.boundpoint);
      }
    }
    this.journeyMarkers = [];
    for (let i in boundpoint) {
        let el = document.createElement('span');
        el.className = 'bluepulse';
        this.journeyMarkers[i] = new mapboxgl.Marker(el)
            .setLngLat(boundpoint[i][1])
            .addTo(this.map);
    }
      const bounds = journey.route_parts[0].coordinates.reduce(function(bounds, coord) {
          return bounds.extend(coord);
      }, new mapboxgl.LngLatBounds(journey.route_parts[0].coordinates[0], journey.route_parts[0].coordinates[0]));

      if (this.disabled_tf) {
          this.map.fitBounds(bounds, <any>{
            bearing: AppSettings.BEARING,
              padding: {
                  top: 200,
                  bottom: 700,
                  left: 100,
                  right: 100
              }
          });
      } else {
          this.map.fitBounds(bounds, <any>{
            bearing: AppSettings.BEARING,
              padding: {
                  top: 700,
                  bottom: 200,
                  left: 100,
                  right: 100
              }
          });
      }
  }

  private removeJourneyMarkers() {
      if (this.journeyMarkers !== undefined) {
          for (let i  of this.journeyMarkers) {
              i.remove();
          }
      }
  }

  private drawOfflineRoute(data) {
    this.routeLegs = data.polylines;

    this.mapService.directionsTime.next(data.distance / 1.38);
    this.mapService.directionsLegIndex.next(0);
    this.mapService.directions.next(null);

    this.activityService.event.next('show-directions');
  }

  private drawOfflineRouteLeg() {
    this.progress = 0;

    this.routeCoordinates = this.routeLegs[this.routeLegIndex].geojson.coordinates;
    this.routeGeojson = this.routeLegs[this.routeLegIndex].geojson;

    const routeBounds = this.routeCoordinates.reduce((bounds: any, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(this.routeCoordinates[0], this.routeCoordinates[0]));
    this.map.once('moveend', () => {
      this.removeMarkers();

      const floorId = this.routeLegs[this.routeLegIndex].floorId;
      if (floorId) {
        this.floorsService
          .getById(floorId, this.mapService.projectId.getValue())
          .then(floor => {
            this.removeAllFloors();

            const checkSource = (event) => {
              if (event.dataType !== 'source') {
                return;
              }

              if (event.sourceId == floor.id.toString()) {
                this.map.off('data', checkSource);

                this.drawPath();
              }
            };

            this.map.on('data', checkSource);
            this.changeFloor(floor, false);
          })
          .catch(noFloor => {
            this.removeAllFloors();
            this.drawPath();
          });
      }
      else {
        this.removeAllFloors();
        this.drawPath();
      }

    });

    this.map.fitBounds(routeBounds, <any>{
      bearing: AppSettings.BEARING,
      padding: {
        top: 700,
        bottom: 200,
        left: 100,
        right: 100
      }
    });
  }

  private drawPath() {
    this.drawStartMarker();
    this.removePolyline();
    setTimeout(() => {
      this.addPolyline('route-polyline-bg', AppSettings.ROUTE_BG_PAINT);
      this.addPolyline('route-polyline-fg', AppSettings.ROUTE_FG_PAINT);

      this.animateRoute();
    }, 50);
  }

  private drawRoute(directions) {
    if (directions) {
      if (JSON.stringify(directions) == '[]') {
        return; // TODO: Throw error message for failed route
      }

      this.routeLegs = directions.default.legs.map((leg) => {
        leg.coordinates = AppUtils.decodePolyline(leg.polylines[0], leg.mode == 'w2g' ? 7 : leg.mode == 'mapbox' ? 6 : 5);
        leg.coordinates = leg.coordinates.slice(1, leg.coordinates.length - 1);
        return leg;
      });

      this.mapService.directionsTime.next(directions.default.time);
      this.mapService.directionsLegIndex.next(0);
      this.mapService.directions.next(null);

      this.activityService.event.next('show-directions');
    }
  }

  private drawRouteLeg() {
    this.progress = 0;

    this.routeCoordinates = this.routeLegs[this.routeLegIndex].coordinates;
    this.routeGeojson = {
      type: 'FeatureCollection',
      features: [
        {
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: this.routeCoordinates
          }
        }
      ]
    };

    const routeBounds = this.routeCoordinates.reduce((bounds: any, coord) => bounds.extend(coord), new mapboxgl.LngLatBounds(this.routeCoordinates[0], this.routeCoordinates[0]));
    this.map.once('moveend', () => {
      this.removeMarkers();
      this.removePolyline();

      const bfs = this.routeLegs[this.routeLegIndex].bfs;
      this.floorsService
        .getFloorByBf(bfs[0], this.projectId)
        .then((floor) => {
          this.removeAllFloors();

          const checkSource = (event) => {
            if (event.dataType !== 'source') {
              return;
            }

            if (event.sourceId == floor.id.toString()) {
              this.map.off('data', checkSource);
              this.drawStartMarker();

              this.removePolyline();
              setTimeout(() => {
                this.addPolyline('route-polyline-bg', AppSettings.ROUTE_BG_PAINT);
                this.addPolyline('route-polyline-fg', AppSettings.ROUTE_FG_PAINT);

                this.animateRoute();
              }, 50);
            }
          };

          this.map.on('data', checkSource);
          this.changeFloor(floor, false);
        })
        .catch((noFloor) => {
          this.removeAllFloors();
          this.drawStartMarker();

          this.removePolyline();
          setTimeout(() => {
            this.addPolyline('route-polyline-bg', AppSettings.ROUTE_BG_PAINT);
            this.addPolyline('route-polyline-fg', AppSettings.ROUTE_FG_PAINT);

            this.animateRoute();
          }, 50);
        });
    });

    this.map.fitBounds(routeBounds, <any>{
      bearing: AppSettings.BEARING,
      padding: {
          top: 700,
          bottom: 200,
          left: 100,
          right: 100
      }
    });
  }

  private addPolyline(id, paint, geojson?) {
    this.map.addLayer(<any>{
      id: id,
      type: 'line',
      source: {
        type: 'geojson',
        data: geojson ? geojson : this.routeGeojson
      },
      layout: {
        'line-cap': 'round',
        'line-join': 'round'
      },
      paint: paint
    });
  }

  private animateRoute(timestamp?) {
    this.progress += 1;

    if (this.progress <= this.routeCoordinates.length * this.speedFactor) {
      this.routeGeojson.coordinates = this.routeCoordinates.slice(0, Math.floor(this.progress / this.speedFactor));

      const bgPolyline = this.map.getSource('route-polyline-bg');
      if (bgPolyline) {
        (<mapboxgl.GeoJSONSource>bgPolyline).setData(this.routeGeojson)
      }

      const fgPolyline = this.map.getSource('route-polyline-fg');
      if (fgPolyline) {
        (<mapboxgl.GeoJSONSource>fgPolyline).setData(this.routeGeojson)
      }

      this.animation = requestAnimationFrame(this.animateRoute.bind(this));
    }
    else {
      this.drawEndMarker();
    }
  }

  private removePolyline() {
    if (this.map) {
      if (this.map.getLayer('route-polyline-bg')) {
        this.map.removeLayer('route-polyline-bg');
      }
      if (this.map.getSource('route-polyline-bg')) {
        this.map.removeSource('route-polyline-bg');
      }
      if (this.map.getLayer('route-polyline-fg')) {
        this.map.removeLayer('route-polyline-fg');
      }
      if (this.map.getSource('route-polyline-fg')) {
        this.map.removeSource('route-polyline-fg');
      }
    }
  }

  private removeTourPolylines() {
    if (this.map) {
      for (let i = this.tourPolylineIds.length - 1; i >= 0; i--) {
        if (this.map.getLayer(this.tourPolylineIds[i])) {
          this.map.removeLayer(this.tourPolylineIds[i]);
        }
        if (this.map.getSource(this.tourPolylineIds[i])) {
          this.map.removeSource(this.tourPolylineIds[i]);
        }

        this.tourPolylineIds.splice(i, 1);
      }
    }
  }

  private removeJourneyPolylines() {
    if (this.map) {
      let index = 0;
      let layer = this.map.getLayer(`journey-polyline-${index}`);
      let source = this.map.getSource(`journey-polyline-${index}`);

      while (source && layer) {
        this.map.removeLayer(`journey-polyline-${index}`);
        this.map.removeSource(`journey-polyline-${index}`);

        layer = this.map.getLayer(`journey-polyline-${++index}`);
        source = this.map.getSource(`journey-polyline-${index}`);
      }
    }
  }

  private drawStartMarker() {
    if (this.routeLegIndex == 0) {
      const legMarkerIcon = `${AppSettings.START_MARKER}`;
      this.drawRouteMarker(mapboxgl.LngLat.convert(this.routeCoordinates[0]), legMarkerIcon, 'start');
    }
    else {
      const previousMarkerIcon = `${AppSettings.PREVIOUS_MARKER}`;
      this.drawRouteMarker(mapboxgl.LngLat.convert(this.routeCoordinates[0]), previousMarkerIcon, 'previous');
    }
  }

  private drawEndMarker() {
    if (this.routeLegIndex < this.routeLegs.length - 1) {
      const nextLegMarkerIcon = `${AppSettings.NEXT_MARKER}`;
      this.drawRouteMarker(mapboxgl.LngLat.convert(this.routeCoordinates[this.routeCoordinates.length - 1]), nextLegMarkerIcon, 'next');
    }
    else {
      const endMarkerIcon = `${AppSettings.END_MARKER}`;
      this.drawRouteMarker(mapboxgl.LngLat.convert(this.routeCoordinates[this.routeCoordinates.length - 1]), endMarkerIcon, 'end');
    }
  }

  private drawClusteredMarkers(annotations, cluster: boolean = true) {
    //this.removeClusteredMarkers();
    this.removePcLabMarkers();
    this.removeStudySpaceMarkers();

    if (annotations.length === 0) {
      return;
    }

    if (this.method !== 'transport' && annotations[0].categoryId === AppSettings.TRANSPORT_CATEGORY_ID) {
      return;
    }

    if (this.method !== 'transport/rail' && annotations[0].categoryId === AppSettings.TRANSPORT_RAIL_CATEGORY_ID) {
      return;
    }

    if (this.method !== 'transport/parking' && AppSettings.PARKING_CATEGORY_IDS.indexOf(annotations[0].categoryId) > -1) {
      return;
    }

    let parentIconUrl;
    if (annotations.length > 0 && annotations[0].parentIcon) {
      parentIconUrl = annotations[0].parentIcon;
    }

    const isPcLabs = this.method.includes(AppSettings.PC_LABS_CATEGORY_ID);
    const isStudySpaces = this.method.includes(AppSettings.STUDY_SPACES_CATEGORY_ID);

    let primaryCategoryId;
    let isNearest = false;

    const pcLabs = [];
    const studySpaces = [];
    if (this.method !== 'around-me') {
      for (let a = annotations.length - 1; a >= 0; a--) {
        if (annotations[a].categories) {
          categoryLoop:
          for (let i = 0; i < annotations[a].categories.length; i++) {
            if (this.method.includes(annotations[a].categories[i].id)) {
              primaryCategoryId = annotations[a].categories[i].id;
            }

            if (isPcLabs && annotations[a].categories[i].id == AppSettings.PC_LABS_CATEGORY_ID) {
              for (let y = 0; y < this.pcLabs.length; y++) {
                if (annotations[a].id == this.pcLabs[y].id) {
                  annotations[a].available = this.pcLabs[y].available;
                  annotations[a].total = this.pcLabs[y].total;
                  annotations[a].ratio = this.pcLabs[y].ratio;

                  pcLabs.push(annotations[a]);

                  annotations.splice(a, 1);
                  break categoryLoop;
                }
              }
            }
            else if (isStudySpaces && annotations[a].categories[i].id == AppSettings.STUDY_SPACES_CATEGORY_ID) {
              for (let y = 0; y < this.studySpaces.length; y++) {
                if (annotations[a].id == this.studySpaces[y].id) {
                  annotations[a].available = this.studySpaces[y].available;
                  annotations[a].total = this.studySpaces[y].total;
                  annotations[a].ratio = this.studySpaces[y].ratio;

                  studySpaces.push(annotations[a]);

                  annotations.splice(a, 1);
                  break categoryLoop;
                }
              }
            }
          }
        }
      }
    }
    else if (annotations[0].distance) {
      isNearest = true;
    }

    if (isPcLabs) {
      this.map.addSource('annotation-pc-labs-source', <any>{
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': pcLabs.map(AppUtils.toGeoJson)
        },
        'cluster': false,
        'clusterMaxZoom': AppSettings.CLUSTER_MAX_ZOOM
      });

      this.schedulePcLabs();
    }
    else if (this.pcLabsInterval) {
      clearInterval(this.pcLabsInterval);
      this.pcLabsInterval = null;
    }

    if (isStudySpaces) {
      this.map.addSource('annotation-study-spaces-source', <any>{
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': studySpaces.map(AppUtils.toGeoJson)
        },
        'cluster': false,
        'clusterMaxZoom': AppSettings.CLUSTER_MAX_ZOOM
      });

      this.scheduleStudySpaces();
    }
    else if (this.studySpacesInterval) {
      clearInterval(this.studySpacesInterval);
      this.studySpacesInterval = null;
    }

    const icons = { };

    if (annotations[0].eventid) {
      icons[annotations[0].eventid] = annotations[0].icon;
      annotations[0].categoryIcon = `annotation-marker-${annotations[0].eventid}`;
    }
    else {
      for (let i = 0; i < annotations.length; i++) {
        if (annotations[i].icon) {
          if (annotations[i].categories) {
            for (let j = 0; j < annotations[i].categories.length; j++) {
              icons[annotations[i].categories[j].id] = annotations[i].icon;
              annotations[i].categoryIcon = `annotation-marker-${annotations[i].categories[j].id}`;
            }
          }
          else if (annotations[i].category) {
            icons[annotations[i].category.id] = annotations[i].icon;
            annotations[i].categoryIcon = `annotation-marker-${annotations[i].category.id}`;
          }
        }
      }
    }

    const annotationMarkersSource = this.map.getSource('annotation-markers-source');
    if (annotationMarkersSource) {
      (<any>annotationMarkersSource).setData({
        'type': 'FeatureCollection',
        'features': annotations.map(AppUtils.toGeoJson)
      });
    }
    else {
      this.map.addSource('annotation-markers-source', <any>{
        'type': 'geojson',
        'data': {
          'type': 'FeatureCollection',
          'features': annotations.map(AppUtils.toGeoJson)
        },
        'cluster': cluster && !(isPcLabs || isStudySpaces),
        'clusterMaxZoom': AppSettings.CLUSTER_MAX_ZOOM
      });
    }

    const renderPcLabsLayers = () => {
      if (isPcLabs && this.map.getSource('annotation-pc-labs-source')) {
        this.map.addLayer({
          'id': 'annotation-pc-labs-markers-layer',
          'type': 'symbol',
          'source': 'annotation-pc-labs-source',
          'layout': {
            'icon-image': 'annotation-marker',
            'icon-allow-overlap': true
          },
          'paint': <any>{
            'icon-opacity': 1,
            'icon-opacity-transition': {
              'duration': 0,
              'delay': 0
            }
          }
        });

        this.map.addLayer({
          'id': 'annotation-pc-labs-badges-layer',
          'type': 'circle',
          'source': 'annotation-pc-labs-source',
          'paint': {
            'circle-radius': 10,
            'circle-translate': [16, -16],
            'circle-color': [
              'step',
              [ 'get', 'ratio' ],
              AppSettings.AVAILABILITY_RATIO_STOPS[0][1],
              AppSettings.AVAILABILITY_RATIO_STOPS[1][0], AppSettings.AVAILABILITY_RATIO_STOPS[1][1],
              AppSettings.AVAILABILITY_RATIO_STOPS[2][0], AppSettings.AVAILABILITY_RATIO_STOPS[2][1]
            ],
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 2,
            'circle-translate-anchor': 'viewport'
          }
        });

        this.map.addLayer({
          'id': 'annotation-pc-labs-badges-text-layer',
          'type': 'symbol',
          'source': 'annotation-pc-labs-source',
          'layout': {
            'text-field': '{available}',
            'text-font': ['Klokantech Noto Sans Regular'],
            'text-size': 12,
            'text-offset': [1.3, -1.35],
            'text-allow-overlap': true,
            'text-max-angle': 360,
            'text-rotation-alignment': 'viewport',
            'text-keep-upright': false
          },
          'paint': {
            'text-color': '#ffffff'
          }
        });
      }
    };

    const renderStudySpacesLayers = () => {
      if (isStudySpaces && this.map.getSource('annotation-study-spaces-source')) {
        this.map.addLayer({
          'id': 'annotation-study-spaces-markers-layer',
          'type': 'symbol',
          'source': 'annotation-study-spaces-source',
          'layout': {
            'icon-image': 'annotation-marker',
            'icon-allow-overlap': true
          },
          'paint': <any>{
            'icon-opacity': 1,
            'icon-opacity-transition': {
              'duration': 0,
              'delay': 0
            }
          }
        });

        this.map.addLayer({
          'id': 'annotation-study-spaces-badges-layer',
          'type': 'circle',
          'source': 'annotation-study-spaces-source',
          'paint': {
            'circle-radius': 10,
            'circle-translate': [16, -16],
            'circle-color': [
              'step',
              [ 'get', 'ratio' ],
              '#ff3a00',
              0.25, '#ff9800',
              0.75, '#94c11f'
            ],
            'circle-stroke-color': '#fff',
            'circle-stroke-width': 2,
            'circle-translate-anchor': 'viewport'
          }
        });

        this.map.addLayer({
          'id': 'annotation-study-spaces-badges-text-layer',
          'type': 'symbol',
          'source': 'annotation-study-spaces-source',
          'layout': {
            'text-field': '{available}',
            'text-font': ['Klokantech Noto Sans Regular'],
            'text-size': 12,
            'text-offset': [1.3, -1.35],
            'text-allow-overlap': true,
            'text-max-angle': 360,
            'text-rotation-alignment': 'viewport',
            'text-keep-upright': false
          },
          'paint': {
            'text-color': '#ffffff'
          }
        });
      }
    };

    const renderSourcesAndLayers = () => {
      if (this.map.getSource('annotation-markers-source')) {
        this.map.addLayer(<any>{
          'id': 'annotation-markers-layer',
          'type': 'symbol',
          'source': 'annotation-markers-source',
          'layout': {
            'icon-image': 'annotation-marker',
            'icon-offset': [-8, 8],
            'icon-allow-overlap': !(isPcLabs || isStudySpaces)
          },
          'paint': {
            'icon-opacity': 1,
            'icon-opacity-transition': {
              'duration': 0,
              'delay': 0
            }
          }
        });

        this.map.addLayer({
          'id': 'annotation-markers-cluster-count-layer',
          'type': 'circle',
          'source': 'annotation-markers-source',
          'filter': ['has', 'point_count'],
          'paint': {
            'circle-radius': 10,
            'circle-translate': [8, -8],
            'circle-color': this.themeColor,
            'circle-stroke-color': '#fff',
            'circle-translate-anchor': 'viewport',
            'circle-stroke-width': 2
          }
        });

        this.map.addLayer({
          'id': 'annotation-markers-cluster-count-text-layer',
          'type': 'symbol',
          'source': 'annotation-markers-source',
          'filter': ['has', 'point_count'],
          'layout': {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Klokantech Noto Sans Regular'],
            'text-size': 12,
            'text-offset': [0.65, -0.675],
            'text-allow-overlap': true,
            'text-max-angle': 360,
            'text-rotation-alignment': 'viewport',
            'text-keep-upright': false
          },
          'paint': {
            'text-color': '#ffffff'
          }
        });
      }

      renderPcLabsLayers();
      renderStudySpacesLayers();
    };

    const renderDistanceLayers = () => {
      if (this.method == 'around-me' && this.map.getLayer('annotation-markers-layer')) {
        this.map.addLayer({
          'id': 'annotation-distances-badges-layer',
          'type': 'circle',
          'source': 'annotation-markers-source',
          'paint': {
            'circle-radius': AppSettings.ICON_SIZE[0] / 2 + 4,
            'circle-color': '#fff',
            'circle-opacity': 1,
            'circle-stroke-color': {
              'property': 'distance',
              'stops': AppSettings.ROUTING_DISTANCE_STOPS.map(stop => [ stop[0], stop[1] ] )
            },
            'circle-stroke-width': 4
          }
        }, 'annotation-markers-layer');
      }
    };

    const renderSourcesAndLayersMulti = () => {
      if (this.map.getSource('annotation-markers-source')) {
        this.map.addLayer(<any>{
          'id': `annotation-markers-layer`,
          'type': 'symbol',
          'source': 'annotation-markers-source',
          'filter': ['!has', 'point_count'],
          'layout': {
            'icon-image': ['get', 'categoryIcon'],
            'icon-allow-overlap': !(isPcLabs || isStudySpaces)
          },
          'paint': {
            'icon-opacity': 1,
            'icon-opacity-transition': {
              'duration': 0,
              'delay': 0
            }
          }
        });

        let iconImage = `annotation-marker-${primaryCategoryId}`;
        if ((<any>this.map).hasImage('annotation-marker-parent')) {
          iconImage = 'annotation-marker-parent';
        }

        this.map.addLayer(<any>{
          'id': `annotation-markers-cluster-layer`,
          'type': 'symbol',
          'source': 'annotation-markers-source',
          'filter': ['has', 'point_count'],
          'layout': {
            'icon-image': iconImage,
            'icon-offset': [-8, 8],
            'icon-allow-overlap': true
          },
          'paint': {
            'icon-opacity': 1,
            'icon-opacity-transition': {
              'duration': 0,
              'delay': 0
            }
          }
        });

        this.map.addLayer({
          'id': 'annotation-markers-cluster-count-layer',
          'type': 'circle',
          'source': 'annotation-markers-source',
          'filter': ['has', 'point_count'],
          'paint': {
            'circle-radius': 10,
            'circle-translate': [8, -8],
            'circle-color': this.themeColor,
            'circle-stroke-color': '#fff',
            'circle-translate-anchor': 'viewport',
            'circle-stroke-width': 2
          }
        });

        this.map.addLayer({
          'id': 'annotation-markers-cluster-count-text-layer',
          'type': 'symbol',
          'source': 'annotation-markers-source',
          'filter': ['has', 'point_count'],
          'layout': {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['Klokantech Noto Sans Regular'],
            'text-size': 12,
            'text-offset': [0.65, -0.675],
            'text-allow-overlap': true,
            'text-max-angle': 360,
            'text-rotation-alignment': 'viewport',
            'text-keep-upright': false
          },
          'paint': {
            'text-color': '#ffffff'
          }
        });

        renderDistanceLayers();
      }

      renderPcLabsLayers();
      renderStudySpacesLayers();
    };

    const removeLayers = () => {
      if (this.map.getLayer('annotation-markers-layer')) {
        this.map.removeLayer('annotation-markers-layer');
      }

      if (this.map.getLayer('annotation-markers-cluster-layer')) {
        this.map.removeLayer('annotation-markers-cluster-layer');
      }

      if (this.map.getLayer('annotation-markers-cluster-count-layer')) {
        this.map.removeLayer('annotation-markers-cluster-count-layer');
      }

      if (this.map.getLayer('annotation-markers-cluster-count-text-layer')) {
        this.map.removeLayer('annotation-markers-cluster-count-text-layer');
      }

      if (this.map.getLayer('annotation-distances-badges-layer')) {
        this.map.removeLayer('annotation-distances-badges-layer');
      }

      if (this.map.getLayer('annotation-pc-labs-markers-layer')) {
        this.map.removeLayer('annotation-pc-labs-markers-layer');
      }

      if (this.map.getLayer('annotation-pc-labs-badges-layer')) {
        this.map.removeLayer('annotation-pc-labs-badges-layer');
      }

      if (this.map.getLayer('annotation-pc-labs-badges-text-layer')) {
        this.map.removeLayer('annotation-pc-labs-badges-text-layer');
      }

      if (this.map.getLayer('annotation-study-spaces-markers-layer')) {
        this.map.removeLayer('annotation-study-spaces-markers-layer');
      }

      if (this.map.getLayer('annotation-study-spaces-badges-layer')) {
        this.map.removeLayer('annotation-study-spaces-badges-layer');
      }

      if (this.map.getLayer('annotation-study-spaces-badges-text-layer')) {
        this.map.removeLayer('annotation-study-spaces-badges-text-layer');
      }
    };

    const removePreviousImages = (removeDefault: boolean = true) => {
      const categories = this.mapService.categories.getValue();
      for (let i = 0; i < categories.length; i++) {
        if ((<any>this.map).hasImage(`annotation-marker-${categories[i].id}`)) {
          this.map.removeImage(`annotation-marker-${categories[i].id}`);
        }
      }

      if ((<any>this.map).hasImage('annotation-marker-parent')) {
        this.map.removeImage('annotation-marker-parent');
      }

      if (removeDefault && (<any>this.map).hasImage('annotation-marker')) {
        this.map.removeImage('annotation-marker');
      }
    };

    if (Object.keys(icons).length == 0) {
      console.warn('Unable to render annotations as no icon found');
    }
    else if (!isNearest && (isPcLabs || isStudySpaces || Object.keys(icons).length == 1 || primaryCategoryId)) {
      const icon = new Image(AppSettings.ICON_SIZE[0], AppSettings.ICON_SIZE[1]);
      icon.crossOrigin = 'Anonymous';
      icon.onload = () => {
        removePreviousImages();

        this.map.addImage('annotation-marker', icon);

        removeLayers();
        renderSourcesAndLayers();
        this.moveToMarkersBounds(annotations);
      };

      let match = false;
      if (primaryCategoryId) {
        const primaryCategory = this.mapService.categories.getValue().filter(category => category.id == primaryCategoryId)[0];
        if (primaryCategory && primaryCategory.icon) {
          icon.src = primaryCategory.icon;
          match = true;
        }
      }

      if (!match) {
        icon.src = annotations[0].icon;
      }
    }
    else {
      let counter = Object.keys(icons).length;
      const checkDone = () => {
        if (--counter == 0) {
          if (parentIconUrl) {
            const parentIcon = new Image(AppSettings.ICON_SIZE[0], AppSettings.ICON_SIZE[1]);
            parentIcon.crossOrigin = 'Anonymous';

            parentIcon.onload = () => {
              this.map.addImage('annotation-marker-parent', parentIcon);
              removeLayers();
              renderSourcesAndLayersMulti();
              this.moveToMarkersBounds(annotations);
            };

            parentIcon.onerror = (err) => {
              console.warn(err);
              removeLayers();
              renderSourcesAndLayersMulti();
              this.moveToMarkersBounds(annotations);
            };

            parentIcon.src = parentIconUrl;
          }
          else {
            removeLayers();
            renderSourcesAndLayersMulti();
            this.moveToMarkersBounds(annotations);
          }
        }
      };

      for (let categoryId in icons) {
        const icon = new Image(AppSettings.ICON_SIZE[0], AppSettings.ICON_SIZE[1]);
        icon.crossOrigin = 'Anonymous';

        icon.onload = () => {
          if (counter == Object.keys(icons).length) {
            removePreviousImages();
            this.map.addImage('annotation-marker', icon);
          }

          this.map.addImage(`annotation-marker-${categoryId}`, icon);
          checkDone();
        };

        icon.onerror = (err) => {
          console.warn(err);
          checkDone();
        };

        icon.src = icons[categoryId];
      }
    }
  }

  private drawMarkers(annotations) {
      this.removeMarkers();
      this.removeJourneyMarkers();
      this.removeClusteredMarkers();

      const categories = this.mapService.categories.getValue();
      if (annotations && annotations.hasOwnProperty('categories')) {
          for (let i in annotations) {
              for (let x of categories) {
                  if (x.name === annotations[i].categories[0].name) {
                      annotations[i].icon = x.icon;
                  }
              }
          }
      }

    annotations = annotations
      .map(annotation => {
        if (!annotation.point && annotation.polygon && annotation.polygon.length > 0 && annotation.polygon[0].length > 0) {
          const turfPolygon = turf.polygon(annotation.polygon[0]);
          const centerOfMass = turf.centerOfMass(turfPolygon);
          annotation.point = centerOfMass.geometry.coordinates;
        }

        return annotation;
      })
      .filter(annotation => annotation.point && annotation.icon);

    for (let i = 0; i < annotations.length; i++) {
      this.drawMarker(new mapboxgl.LngLat(annotations[i].point[0], annotations[i].point[1]), annotations[i].icon, annotations[i]);
    }

  }

  private drawMarker(position: mapboxgl.LngLat, iconUrl?: string, annotation?: any) {
    const marker = new AnnotationMarker(this.createIcon(iconUrl, AppSettings.ICON_SIZE, AppSettings.ICON_ANCHOR, annotation.className || 'annotation-marker', this.onMarkerClick.bind(this, position, annotation)))
      .setLngLat(position)
      .setAnnotation(annotation)
      .addTo(this.map);

    this.markers.push(marker);
  }

  private onMarkerClick(position: mapboxgl.LngLat, annotation?) {
    if (annotation.hasOwnProperty('eventid')) {
      this.eventsService.eventsIdService.next(annotation);
    }
    if (annotation.hasOwnProperty('polygon')) {
      this.showingInfo = false;

      this.getLocation(annotation.id);
      // this.eventsService.eventsIdService.next(annotation);
    }
    this.drawPopup(position, annotation);
  }

  private drawRouteMarker(position: mapboxgl.LngLat, iconUrl: string, context: any) {
    if (!iconUrl) {
      return false;
    }

    let callback;
    if (context == 'next') {
      callback = () => this.mapService.directionsLegIndex.next(this.mapService.directionsLegIndex.getValue() + 1);
    }
    else if (context == 'previous') {
      callback = () => this.mapService.directionsLegIndex.next(this.mapService.directionsLegIndex.getValue() - 1);
    }

    const marker = new RouteMarker(this.createIcon(iconUrl, AppSettings.ROUTE_ICON_SIZE, AppSettings.ROUTE_ICON_ANCHOR, 'route-marker', callback))
      .setLngLat(position)
      .addTo(this.map);

    this.markers.push(marker);
  }

  private drawTourMarker(position: mapboxgl.LngLat, iconUrl: string, id, callback, className: string = 'tour-marker') {
    const marker = new TourMarker(this.createIcon(iconUrl, AppSettings.ICON_SIZE, AppSettings.ICON_ANCHOR, className, callback))
      .setLngLat(position)
      .setId(id)
      .addTo(this.map);

    this.markers.push(marker);
  }

  private createIcon(iconUrl: string, iconSize: number[], iconAnchor: number[], className: string, callback?) {
    var icon = document.createElement('div');
    icon.className = `marker ${className}`;
    icon.style.background = `url(${iconUrl}) 0 / ${iconSize[0]}px ${iconSize[1]}px`;
    icon.style.borderRadius = '50%';
    icon.style.width = `${iconSize[0]}px`;
    icon.style.height = `${iconSize[1]}px`;

    const currentAnchorX = iconSize[0]/2;
    const currentAnchorY = iconSize[1]/2;

    const dAnchorX = currentAnchorX - iconAnchor[0];
    const dAnchorY = currentAnchorY - iconAnchor[1];

    icon.style.marginLeft = `-${dAnchorX}px`;
    icon.style.marginTop = `-${dAnchorY}px`;

    if (callback) {
      icon.onclick = callback;
    }

    return icon;
  }

  private moveToMarkersBounds(annotations) {
    if (!this.method.startsWith('around-me') || this.method.endsWith('remote')) {
      return false;
    }

    if (annotations.length === 1) {
      return this.map.flyTo({
        center: annotations[0].point,
        bearing: this.map.getBearing()
      });
    }

    if (this.method === 'around-me') {
      annotations = annotations.filter(annotation => annotation.distance && annotation.distance < 200);
    }

    const line = turf.lineString(annotations.map(annotation => annotation.point));
    const bbox = turf.bbox(line);

    const bounds = [
      [
        bbox[0],
        bbox[1]
      ],
      [
        bbox[2],
        bbox[3]
      ]
    ];

    if (this.disabled_tf) {
      this.map.fitBounds(bounds, <any>{
        bearing: this.map.getBearing(),
        padding: {
          top: 200,
          bottom: 700,
          left: 100,
          right: 100
        }
      });
    } else {
      this.map.fitBounds(bounds, <any>{
        bearing: this.map.getBearing(),
        padding: {
          top: 700,
          bottom: 200,
          left: 100,
          right: 100
        }
      });
    }
  }

  private removeClusteredMarkers() {
    if (this.map.getLayer('annotation-markers-layer')) {
      this.map.removeLayer('annotation-markers-layer');
    }

    if (this.map.getLayer('annotation-markers-cluster-layer')) {
      this.map.removeLayer('annotation-markers-cluster-layer');
    }

    if (this.map.getLayer('annotation-markers-cluster-count-layer')) {
      this.map.removeLayer('annotation-markers-cluster-count-layer');
    }

    if (this.map.getLayer('annotation-markers-cluster-count-text-layer')) {
      this.map.removeLayer('annotation-markers-cluster-count-text-layer');
    }

    if (this.map.getLayer('annotation-distances-badges-layer')) {
      this.map.removeLayer('annotation-distances-badges-layer');
    }

    if (this.map.getSource('annotation-markers-source')) {
      this.map.removeSource('annotation-markers-source');
    }

    this.removePcLabMarkers();
    this.removeStudySpaceMarkers();
  }

  private removePcLabMarkers() {
    if (this.map.getLayer('annotation-pc-labs-markers-layer')) {
      this.map.removeLayer('annotation-pc-labs-markers-layer');
    }

    if (this.map.getLayer('annotation-pc-labs-badges-layer')) {
      this.map.removeLayer('annotation-pc-labs-badges-layer');
    }

    if (this.map.getLayer('annotation-pc-labs-badges-text-layer')) {
      this.map.removeLayer('annotation-pc-labs-badges-text-layer');
    }

    if (this.map.getSource('annotation-pc-labs-source')) {
      this.map.removeSource('annotation-pc-labs-source');
    }
  }

  private removeStudySpaceMarkers() {
    if (this.map.getLayer('annotation-study-spaces-markers-layer')) {
      this.map.removeLayer('annotation-study-spaces-markers-layer');
    }

    if (this.map.getLayer('annotation-study-spaces-badges-layer')) {
      this.map.removeLayer('annotation-study-spaces-badges-layer');
    }

    if (this.map.getLayer('annotation-study-spaces-badges-text-layer')) {
      this.map.removeLayer('annotation-study-spaces-badges-text-layer');
    }

    if (this.map.getSource('annotation-study-spaces-source')) {
      this.map.removeSource('annotation-study-spaces-source');
    }
  }

  private removeMarkers() {
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].remove();
    }

    this.markers = [];
  }

  drawCenter() {
      let el = document.createElement('span');
      el.className = 'pulse';
      new mapboxgl.Marker(el)
          .setLngLat(this.center)
          .addTo(this.map);
  }

  darkenStyle() {
    if (!this.initialStyle) {
      this.initialStyle = {...this.map.getStyle()};
      this.initialStyle.transition = {
        duration: 0,
        delay: 0
      };
    }

    const darkStyle = this.mapService.darkenStyle(this.map.getStyle(), AppSettings.DARKEN_STYLE_BY);
    if (darkStyle) {
      this.map.setStyle(darkStyle);
      this.hasInitialStyle = false;
    }
  }

  resetStyle() {
    if (this.initialStyle && !this.hasInitialStyle) {
      this.map.setStyle(this.initialStyle);
      this.hasInitialStyle = true;
    }
  }

  drawRadius() {
    if (!this.map.getLayer('radius-layer')) {
      this.map.addLayer({
        'id': 'radius-layer',
        'type': 'circle',
        'source': 'center-source',
        'paint': {
          'circle-radius': {
            'stops': [
              [0, 0],
              [20, AppUtils.metersToPixelsAtMaxZoom(500, this.center[1])]
            ],
            'base': 2
          },
          'circle-color': '#ffffff',
          'circle-opacity': AppSettings.DARKEN_STYLE_BY
        }
      }/*, 'center-outer-bg-layer'*/);
    }
  }

  removeRadius() {
    if (this.map.getLayer('radius-layer')) {
      this.map.removeLayer('radius-layer');
    }
  }

  getLocation(id, pan: boolean = true) {
    if (this.method.startsWith('around-me') || this.method.startsWith('locations')) {
      this.locationsService
        .get(id, {
          context: AppUtils.getContext()
        })
        .then((data) => {
          if (data) {
            this.parseLocation(data, pan);
          }
        });
    }
  }

  parseLocation(data, pan: boolean = true) {
    if (
      data.point &&
      pan &&
      this.mapService.ready.getValue() === true
    ) {
      this.map.panTo(
        data.point
      );
    }

    if (
      data.content_type !== 0 &&
      (
        this.method.startsWith('around-me') ||
        this.method.startsWith('locations')
      )
    ) {
      for (let i = 0; i < data.categories.length; i++) {
        if (
          AppSettings.TRANSPORT_SHUTTLE_BUS_CATEGORY_IDS.includes(
            data.categories[i].id
          )
        ) {
          data.isShuttleBus = true;
          break;
        }
      }

      if (data.phone) {
        data.phone = AppUtils.formatPhoneNumber(data.phone);
      }

      if (
        data.opening_times &&
        data.opening_times.length > 0
      ) {
        data.opening_times = data.opening_times.replace(new RegExp('\n', 'g'), '<br/>');
      }

      if (
        data.address &&
        data.address.length > 0
      ) {
        data.address = data.address.replace(new RegExp('\n', 'g'), '<br/>');
      }

      data.metadata = data.metadata.map(
        metadata => ({
          header: metadata.header,
          content: (
            stripHtml(
              metadata.content,
              {
                onlyStripTags: ['a']
              }
            )
          )
        })
      );

      const description = data.metadata.filter(
        metadata => (
          metadata.header === 'Location Information'
        )
      )[0];

      if (description) {
        data.content = stripHtml(
          description.content,
          {
            onlyStripTags: ['a']
          }
        );

        data.metadata = (
          data.metadata
            .filter(
              metadata => (
                metadata.header !== description.header
              )
            )
        );
      }
      else {
        data.content = null;
      }

      this.Einfo = data;
      this.showingInfo = true;
    } else {
      this.showingInfo = false;
      this.Einfo = null;
    }
  }

  closeMoreInfo() {
    this.showingInfo = false;
  }

  schedulePcLabs() {
    this.pcLabsInterval = setInterval(() => {
      this.pcLabsService
        .getAll()
        .take(1)
        .subscribe((data) => {
          if (data.errorText) {
            return console.warn(data.errorText);
          }

          this.pcLabs = data.filter(lab => lab.ratio);

          const source = this.map.getSource('annotation-pc-labs-source');
          if (source) {
            const annotations = (<any>source)._options.data.features.map(feature => feature.properties);
            for (let a = 0; a < annotations.length; a++) {
              for (let y = 0; y < this.pcLabs.length; y++) {
                if (annotations[a].id == this.pcLabs[y].id) {
                  annotations[a].available = this.pcLabs[y].available;
                  annotations[a].total = this.pcLabs[y].total;
                  annotations[a].ratio = this.pcLabs[y].ratio;
                }
              }
            }

            (<any>this.map.getSource('annotation-pc-labs-source')).setData({
              'type': 'FeatureCollection',
              'features': annotations.filter(annotation => annotation.ratio).map(AppUtils.toGeoJson)
            });
          }
        });
    }, AppSettings.PC_LABS_REFRESH_INTERVAL * 1000);
  }

  scheduleStudySpaces() {
    this.studySpacesInterval = setInterval(() => {
      this.studySpacesService
        .getAll()
        .take(1)
        .subscribe((data) => {
          if (data.errorText) {
            return console.warn(data.errorText);
          }

          this.studySpaces = data.filter(space => space.ratio);

          const source = this.map.getSource('annotation-study-spaces-source');
          if (source) {
            const annotations = (<any>source)._options.data.features.map(feature => feature.properties);
            for (let a = 0; a < annotations.length; a++) {
              for (let y = 0; y < this.studySpaces.length; y++) {
                if (annotations[a].id == this.studySpaces[y].id) {
                  annotations[a].available = this.studySpaces[y].available;
                  annotations[a].total = this.studySpaces[y].total;
                  annotations[a].ratio = this.studySpaces[y].ratio;
                }
              }
            }

            (<any>this.map.getSource('annotation-study-spaces-source')).setData({
              'type': 'FeatureCollection',
              'features': annotations.filter(annotation => annotation.ratio).map(AppUtils.toGeoJson)
            });
          }
        });
    }, AppSettings.STUDY_SPACES_REFRESH_INTERVAL * 1000);
  }
}
