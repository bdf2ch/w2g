import { Component, OnInit, ViewChild, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'w2g-carousel',
  templateUrl: 'carousel.widget.html',
  styleUrls: [ 'carousel.widget.scss' ]
})
export class CarouselWidget implements OnInit {
  @ViewChild('theCarousel') carouselRef: any;

  @Input('media') media: any;
  @Input('direction') direction: string = 'horizontal';
  @Input('interactive') interactive: boolean = false;
  @Input('showCaption') showCaption: boolean = false;
  @Input('buttonIcon') buttonIcon: string = 'directions';
  @Input('buttonText') buttonText: string = 'Go';

  @Output('onCallback') onCallback: EventEmitter<any> = new EventEmitter<any>(null);

  public carousel = {
    grid: {xs: 1, sm: 1, md: 1, lg: 1, all: 0},
    slide: 1,
    speed: 400,
    point: {
      visible: true
    },
    load: 2,
    touch: true,
    loop: true,
    custom: 'banner'
  };

  public currentMediumIndex = 0;

  private slideIndex = 0;
  private videos: any[] = [];
  private timeout: any;

  constructor(
    private router: Router,
    private domSanitizer: DomSanitizer
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.videos = this.carouselRef.el.nativeElement.getElementsByTagName('video');
      this.scheduleCarousel();
      this.handleVideos();
    }, 0);
  }

  carouselLoaded(event) { }

  carouselMoved(event) {
    //TODO: Add support for multiple visible items
    if (event.items == 1) {
      this.currentMediumIndex = event.visibleItems.start;
    }
  }

  scheduleCarousel() {
    this.timeout = setTimeout(() => {
      if (this.currentMediumIndex >= this.media.length - 1) {
        this.currentMediumIndex = 0;
      }
      else {
        this.currentMediumIndex++;
      }
      this.slideIndex++;
      this.handleVideos();
      this.scheduleCarousel();
    }, this.media[this.currentMediumIndex].duration * 1000);
  }

  handleVideos() {
    for (let i = 0; i < this.media.length; i++) {
      const medium = this.media[i];
      if (medium.type == 'video') {
        for (let j = 0; j < this.videos.length; j++) {
          if (this.videos[j].getAttribute('data-id') == this.media[i].id) {
            if (i == this.currentMediumIndex) {
              this.videos[j].play();
            }
            else if (!this.videos[j].paused || this.videos[j].ended) {
              this.videos[j].pause();
              this.videos[j].currentTime = 0;
            }
          }
        }
      }
    }
  }

  redirectCallback(medium) {
    if (medium.redirectUrl) {
      this.router.navigate([medium.redirectUrl], { queryParamsHandling: "preserve" });
    }
    else if (
      medium.point ||
      medium.locationId ||
      medium.surveyId
    ) {
      this.callback();
    }
  }

  callback() {
    this.onCallback.emit(this.media[this.currentMediumIndex]);
  }
}
