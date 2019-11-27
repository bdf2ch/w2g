import { PopupWidget } from '../widgets/popup/popup.widget';
import {ComponentFactoryResolver, Injectable, Inject, ViewContainerRef} from "@angular/core";

@Injectable()
export class PopupService {
  private factoryResolver: ComponentFactoryResolver;
  private rootViewContainerRef: ViewContainerRef;

  constructor(@Inject(ComponentFactoryResolver) factoryResolver) {
    this.factoryResolver = factoryResolver;
  }

  setRootViewContainerRef(viewContainerRef) {
    this.rootViewContainerRef = viewContainerRef;
  }

  addPopupWidget(location?, projectId?: number, method?: string): any {
    const factory = this.factoryResolver.resolveComponentFactory(PopupWidget);

    const component = factory.create(this.rootViewContainerRef.parentInjector);
    if (location) {
      component.instance.location = location;
    }
    if (projectId) {
      component.instance.projectId = projectId;
    }
    if (method) {
      component.instance.method = method;
    }
    this.rootViewContainerRef.insert(component.hostView);

    return component;
  }
}
