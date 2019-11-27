import { Injectable } from "@angular/core";
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import 'rxjs/add/operator/take';

import { AppSettings } from '../app/app.settings';
import { AppUtils } from '../app/app.utils';

import { AuthService } from './auth.service';

@Injectable()
export class FloorsService {
  public buildings: BehaviorSubject<Map<string, any>> = new BehaviorSubject<Map<string, any>>(new Map<string, any>());
  public floors: BehaviorSubject<any[]> = new BehaviorSubject<any[]>([]);
  public layers: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  public campus: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private campusById: Map<string, any> = new Map<string, any>();
  private layersByFloorId: Map<number, any> = new Map<number, any>();

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  getAll(projectId): Observable<any> {
    return this.http.get(`${AppSettings.APP_MANAGER_URL}/api/lm2/projects/${projectId}/floors`, {
      headers: this.authService.jsonHeaders
    });
  }

  get(id, projectId): Observable<any> {
    return this.http.get(`${AppSettings.APP_MANAGER_URL}/api/lm2/projects/${projectId}/floors/${id}`, {
      headers: this.authService.jsonHeaders
    });
  }

  getAllStyles(projectId): Observable<any> {
    return this.http.get(`${AppSettings.LM2_URL}/api/internal/projects/${projectId}/floors/allstyle.json`)
  }

  getLayersByFloorId(floorId, projectId): Promise<any> {
    let layers = this.layersByFloorId.get(floorId);
    if (layers) {
      return new Promise((resolve, reject) => resolve(layers));
    }
    
    return new Promise((resolve, reject) => {
      this.http
        //.get(`http://localhost:8081/projects/${projectId}/floors/${floorId}?raw=true&context=${AppSettings.IS_STAGING ? 'staging' : 'live'}`, {
        .get(`${AppSettings.APP_MANAGER_URL}/api/styles/projects/${projectId}/floors/${floorId}?raw=true&context=${AppSettings.IS_STAGING ? 'staging' : 'live'}`, {
          headers: this.authService.headers
        })
        .take(1)
        .subscribe(data => {
          this.layersByFloorId.set(floorId, data);
          resolve(data);
        })
    });
  }

  getLayersByFloorIdLm2(floorId, projectId): Promise<any> {
    let layers = this.layersByFloorId.get(floorId);
    if (!layers) {
      return new Promise((resolve, reject) => {
        this
          .getAllStyles(projectId)
          .take(1)
          .subscribe((styles: any) => {
            layers = {
              source: styles.sources[floorId],
              layers: styles.layers.filter((layer) => parseInt(layer.source) == floorId)
            };
            this.layersByFloorId.set(floorId, layers);
            resolve(layers);
          });
      });
    }
    else {
      return new Promise((resolve, reject) => resolve(layers));
    }
  }

  getById(id, projectId): Promise<any> {
    const floors = this.floors.getValue();
    if (floors.length > 0) {
      return new Promise((resolve, reject) => {
        try {
          resolve(floors.filter((floor) => floor.id == id)[0]);
        }
        catch (ex) {
          reject(`Unable to find floor by ID ${id} and project ID ${projectId}`)
        }
      });
    }
    else {
      return this.get(id, projectId).toPromise();
    }
  }

  getByIdSiblings(id, projectId): Promise<any> {
    const floors = this.floors.getValue();
    if (floors.length > 0) {
      return new Promise((resolve, reject) => {
        this
          .getById(id, projectId)
          .then((floor) => {
            resolve({
              floor: floor,
              siblings: floors.filter((eachFloor) => {
                return eachFloor.parent_id == floor.parent_id && eachFloor.id !== floor.id;
              })
            });
          })
          .catch((err) => {
            reject(err);
          })
      });
    }
    else {
      return new Promise((resolve, reject) => {
        this
          .getAll(projectId)
          .take(1)
          .subscribe((data: any) => {
            const buildings = AppUtils.objectToMap(data.floors);
            buildings.forEach((floors, building) => {
              if (floors[0] && floors[0].campus_id !== this.campus.getValue().id) {
                buildings.delete(building);
              }
            });
            this.buildings.next(buildings);

            this.floors.next(Object.keys(data.floors).reduce(function (r, k) {
              return r.concat(data.floors[k]);
            }, []));

            resolve(this.getByIdSiblings(id, projectId));
          });
      });
    }
  }

  getCampusById(projectId, id): Promise<any> {
    if (this.campusById.has(id)) {
      return new Promise((resolve, reject) => resolve(this.campusById.get(id)));
    }
    else {
      return new Promise((resolve, reject) => {
        this
          .getAll(projectId)
          .take(1)
          .subscribe((data: any) => {
            if (data.floors) {
              const buildings = AppUtils.objectToMap(data.floors);
              buildings.forEach((floors, building) => {
                if (floors[0] && floors[0].campus_id !== id) {
                  buildings.delete(building);
                }
              });
              this.buildings.next(buildings);

              this.floors.next(Object.keys(data.floors).reduce(function (r, k) {
                return r.concat(data.floors[k]);
              }, []));
            }

            const campus = data.campuses.filter((campus) => campus.id == id)[0];
            this.campus.next(campus);
            this.campusById.set(id, campus);

            resolve(campus)
          });
      });
    }
  }

  getFloorByBf(bf: number, projectId: number): Promise<any> {
    return this.http.get(`${AppSettings.LM2_MOCK_URL}/api/projects/${projectId}/floorplans/${bf}`).take(1).toPromise();
  }
}
