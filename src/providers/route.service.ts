import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';

import 'rxjs/add/operator/take';

import * as CheapRuler from 'cheap-ruler';
import * as Graph from 'node-dijkstra';
import * as moment from 'moment';

import { AuthService } from './auth.service';
import { AppSettings } from '../app/app.settings';

@Injectable()
export class RouteService {
  public graph: BehaviorSubject<any> = new BehaviorSubject<any>(null);

  private vertices: any;

  private graphData: any;
  private lGraphData: any;

  private ruler: any;

  constructor(
    private authService: AuthService,
    private http: HttpClient
  ) {
    this.ruler = CheapRuler(AppSettings.ROUTING_LATITUDE, 'meters');
  }

  getGraph(): Promise<any> {
    const lm2Url = AppSettings.LM2_URL;

    return new Promise((resolve, reject) => {
      this.http
        .get(`${AppSettings.APP_MANAGER_URL}/api/route/vertices?lm2Url=${lm2Url}&projectId=${AppSettings.PROJECT_ID}&campusId=${AppSettings.CAMPUS_ID}`, {
          headers: this.authService.headers
        })
        .take(1)
        .subscribe(data => {
          this.vertices = data;

          this.http
            .get(`${AppSettings.APP_MANAGER_URL}/api/route/graph?lm2Url=${lm2Url}&projectId=${AppSettings.PROJECT_ID}&campusId=${AppSettings.CAMPUS_ID}`, {
              headers: this.authService.headers
            })
            .take(1)
            .subscribe(data => {
              this.graphData = data;

              this.http
                  .get(`${AppSettings.APP_MANAGER_URL}/api/route/lGraph?lm2Url=${lm2Url}&projectId=${AppSettings.PROJECT_ID}&campusId=${AppSettings.CAMPUS_ID}`, {
                  headers: this.authService.headers
                })
                .take(1)
                .subscribe(data => {
                  this.lGraphData = data;

                  const graph = new Graph();

                  const finalGraphData = { };
                  for (let vertexId in this.graphData) {
                    const nodes = this.graphData[vertexId];
                    if (!finalGraphData[vertexId]) {
                      finalGraphData[vertexId] = { };
                    }

                    for (let otherVertexId in nodes) {
                      const cost = nodes[otherVertexId];
                      finalGraphData[vertexId][otherVertexId] = cost;

                      if (!finalGraphData[otherVertexId]) {
                        finalGraphData[otherVertexId] = { };
                      }
                      finalGraphData[otherVertexId][vertexId] = cost;
                    }
                  }

                  for (let vertexId in finalGraphData) {
                    const reverseNodes = finalGraphData[vertexId];
                    graph.addNode(vertexId, reverseNodes);
                  }

                  this.graph.next(graph);
                  resolve();
                });
            });
        });
    });
  }

  getRoute(origin: any, destination: any, originFloorId?: any, destinationFloorId?: any): Promise<any> {
    let graph = this.graph.getValue();

    if (graph) {
      return this.doRoute(origin, destination, graph, originFloorId, destinationFloorId);
    }
    else {
      return new Promise((resolve, reject) => {
        this.graph
          .take(2)
          .subscribe(graph => {
            if (graph) {
              this.doRoute(origin, destination, graph, originFloorId, destinationFloorId)
                .then(polylines => resolve(polylines))
                .catch(err => reject(err))
            }
          });
      });
    }
  }

  doRoute(origin: any, destination: any, graph: any, originFloorId?: any, destinationFloorId?: any): Promise<any> {
    return new Promise((resolve, reject) => {
      let startVertex, endVertex;

      if ((origin.lng && origin.lat) || (origin instanceof String && origin.match(AppSettings.GPS_REGEX))) {
        let gpsLat, gpsLon;

        if (origin instanceof String) {
          gpsLon = parseFloat(origin.split(',')[0].trim());
          gpsLat = parseFloat(origin.split(',')[1].trim());
        }
        else {
          gpsLon = origin.lng;
          gpsLat = origin.lat;
        }

        let minDistance = Number.MAX_VALUE;
        let nearestVertexId;
        for (let vertexId in this.vertices) {
          const vertex = this.vertices[vertexId];

          if (originFloorId == 'undefined' || (originFloorId == 'null' && !vertex.f) || (originFloorId !== 'null' && parseInt(originFloorId) == vertex.f)) {
            const distance = this.ruler.distance([vertex.ln, vertex.lt], [gpsLon, gpsLat]);

            if (distance < minDistance) {
              minDistance = distance;
              nearestVertexId = vertexId.toString();
            }
          }
        }

        if (nearestVertexId) {
          startVertex = nearestVertexId;
        }
      }

      if (!startVertex) {
        return reject(new Error(`No start vertex found for origin ${origin}`));
      }

      if ((destination.lng && destination.lat) || (destination instanceof String && destination.match(AppSettings.GPS_REGEX))) {
        let gpsLat, gpsLon;

        if (destination instanceof String) {
          gpsLon = parseFloat(destination.split(',')[0].trim());
          gpsLat = parseFloat(destination.split(',')[1].trim());
        }
        else {
          gpsLon = destination.lng;
          gpsLat = destination.lat;
        }

        let minDistance = Number.MAX_VALUE;
        let nearestVertexId;
        for (let vertexId in this.vertices) {
          const vertex = this.vertices[vertexId];

          if (destinationFloorId == 'undefined' || (destinationFloorId == 'null' && !vertex.f) || (destinationFloorId !== 'null' && parseInt(destinationFloorId) == vertex.f)) {
            const distance = this.ruler.distance([vertex.ln, vertex.lt], [gpsLon, gpsLat]);

            if (distance < minDistance) {
              minDistance = distance;
              nearestVertexId = vertexId.toString();
            }
          }
        }

        if (nearestVertexId) {
          endVertex = nearestVertexId;
        }
      }

      if (!endVertex) {
        return reject(new Error(`No end vertex found for destination ${destination}`));
      }

      if (startVertex && endVertex) {
        const lNodes = { };

        let route = graph.path(startVertex, endVertex, {
          cost: true
        });

        let distance = route.cost;
        route = route.path;

        if (!route) {
          for (let vertexId in this.lGraphData) {
            if ([startVertex, endVertex].indexOf(vertexId) > -1) {
              lNodes[vertexId] = this.lGraphData[vertexId];
            }

            for (var nodeVertexId in this.lGraphData[vertexId]) {
              if ([startVertex, endVertex].indexOf(nodeVertexId) > -1) {
                if (!lNodes[vertexId]) {
                  lNodes[vertexId] = {};
                }
                lNodes[vertexId][nodeVertexId] = this.lGraphData[vertexId][nodeVertexId];
              }
            }
          }

          for (let vertexId in lNodes) {
            const nodes = graph.graph.get(vertexId);
            if (nodes) {
              nodes.forEach((length, nodeVertexId) => {
                lNodes[vertexId][nodeVertexId] = length;
              });
            }
            graph.addNode(vertexId, lNodes[vertexId]);
          }

          route = graph.path(startVertex, endVertex, {
            cost: true
          });

          distance = route.cost;
          route = route.path;

          // Only remove last edge if the destination is a location vertex
          if (route && route.length > 0) {
            route.splice(route.length - 1, 1);
          }
        }

        if (route) {
          const polylines = [];

          let currentFloorId = this.vertices[route[0]].f;
          let currentIndex = 0;
          let preduplicateIndices = [];
          for (let i = 0; i < route.length; i++) {
            const vertex = this.vertices[route[i]];
            if (vertex.f !== currentFloorId) {
              currentIndex++;
              currentFloorId = vertex.f;
            }

            if (!polylines[currentIndex]) {
              polylines[currentIndex] = {
                geojson: {
                  type: 'LineString',
                  coordinates: [ ]
                },
                floorId: currentFloorId
              }
            }

            // Handle overlapping/duplicate paths
            let duplicate = false;
            for (let j = 0; j < polylines[currentIndex].geojson.coordinates.length; j++) {
              if (polylines[currentIndex].geojson.coordinates[j][0] == vertex.ln && polylines[currentIndex].geojson.coordinates[j][1] == vertex.lt) {
                duplicate = true;
                preduplicateIndices.push([currentIndex, j]);
                break;
              }
            }

            if (!duplicate) {
              polylines[currentIndex].geojson.coordinates.push([vertex.ln, vertex.lt]);
            }
            else if (i > 0) {
              distance -= 2 * this.ruler.distance([vertex.ln, vertex.lt], [this.vertices[route[i-1]].ln, this.vertices[route[i-1]].lt])
            } // Deduct distance added by overlap
          }

          // Remove overlapped/duplicate paths
          for (let i = 0; i < preduplicateIndices.length; i++) {
            polylines[preduplicateIndices[i][0]].geojson.coordinates.splice(preduplicateIndices[i][1], 1);
          }

          return resolve({
            polylines: polylines,
            distance: distance
          });
        }

        reject('No route found');
      }
    });
  }

  getLineDistance(pointA: number[], pointB: number[]) {
    return this.ruler.distance(pointA, pointB);
  }
}
