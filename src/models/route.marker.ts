import * as mapboxgl from 'mapbox-gl';

export class RouteMarker extends mapboxgl.Marker {
  constructor(element?: HTMLElement, options?: { offset?: mapboxgl.PointLike }) {
    super(element, options);
  }
}
