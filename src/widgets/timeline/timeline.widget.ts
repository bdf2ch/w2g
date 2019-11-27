import { Component, OnInit, OnChanges, ViewChild, Input, Output, EventEmitter, ElementRef } from '@angular/core';

import * as vis from 'vis';

@Component({
  selector: 'w2g-timeline',
  templateUrl: 'timeline.widget.html',
  styleUrls: [ 'timeline.widget.scss' ]
})
export class TimelineWidget implements OnInit, OnChanges {
  @Input('data') data: any[];
  @Input('options') options: any;

  @Output('onCallback') onCallback: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild('timeline') timelineRef: ElementRef;

  private timeline: any;
  private defaultOptions = {
    width: '100%',
    height: '75px'
  };

  ngOnInit() {
    this.render();
  }

  ngOnChanges() {
    this.render();
  }

  render() {
    if (this.timeline) {
      this.timeline.destroy();
    }

    this.timeline = new vis.Timeline(this.timelineRef.nativeElement, this.data, this.options || this.defaultOptions);
    this.timeline.on('select', (event) => {
      if (event.items.length > 0) {
        this.onCallback.emit(event.items[0]);
      }
    });
  }
}
