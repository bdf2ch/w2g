import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'w2g-footer',
  templateUrl: 'footer.component.html',
  styleUrls: [ 'footer.component.scss' ]
})
export class FooterComponent implements OnInit {
  @Input('hasSidebar') hasSidebar: boolean = false;

  constructor() { }

  ngOnInit() { }
}
