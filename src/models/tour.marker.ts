import * as mapboxgl from 'mapbox-gl';

export class TourMarker extends mapboxgl.Marker {
  private id: string;

  constructor(element?: HTMLElement, options?: { offset?: mapboxgl.PointLike }) {
    super(element, options);
  }

  public setId(id: string) {
    this.id = id;
    return this;
  }

  public getId() {
    return this.id;
  }
}
