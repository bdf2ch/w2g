import * as mapboxgl from 'mapbox-gl';

export class AnnotationMarker extends mapboxgl.Marker {
  public annotation: any;

  constructor(element?: HTMLElement, options?: { offset?: mapboxgl.PointLike }) {
    super(element, options);
  }

  public setAnnotation(annotation: any): this {
    this.annotation = annotation;

    return this;
  }
}
