import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, HostListener } from '@angular/core';

import * as qrcode from 'qrcode';

@Component({
  selector: 'w2g-qr',
  templateUrl: 'qr.widget.html',
  styleUrls: [ 'qr.widget.scss' ]
})
export class QrWidget implements OnInit {
  @HostListener('window:mousedown', ['$event'])
  onMouseDown(event) {
    this.onClose.emit();
  }

  @ViewChild('qrCanvas') qrCanvas: ElementRef;

  @Input('url') url: string;
  @Input('width') width: number = 400;
  @Input('height') height: number = 400;

  @Output('onClose') onClose: EventEmitter<any> = new EventEmitter<any>();

  ngOnInit() {
    qrcode.toCanvas(this.qrCanvas.nativeElement, this.url, {
      width: this.width,
      height: this.height
    }, (err) => {
      if (err) {
        console.error(err);
      }
    });
  }
}
