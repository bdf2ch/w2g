import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';

import { ActivityService } from '../../providers/activity.service';
import { MapService } from '../../providers/map.service';

import { AppSettings } from '../../app/app.settings';

@Component({
  selector: 'w2g-question',
  templateUrl: 'question.widget.html',
  styleUrls: [ 'question.widget.scss' ]
})
export class QuestionWidget implements OnInit {
  @Input('question') question: any;
  @Input('rowWidth') rowWidth: number = 2;

  @Output('onRespond') onRespond: EventEmitter<any> = new EventEmitter<any>();
  @Output('onClose') onClose: EventEmitter<any> = new EventEmitter<any>();

  public color = AppSettings.SURVEY_COLOR;
  public popcss: any[] = ['330px', '60px', '88.8%'];
  private disabled_tf: boolean;

  constructor(
    private snackbar: MatSnackBar,
    private mapService: MapService,
    private activityService: ActivityService
  ) { }

  ngOnInit() {
    this.question.answerRows = [ [] ];

    this.mapService.disabled_tf
      .subscribe(data => {
        this.disabled_tf = data;
        if (this.disabled_tf === true ) {
          this.popcss = ['1186px', '155px', '80%'];
        } else {
          this.popcss = ['330px', '60px', '88.8%'];
        }
      });
    let counter = 0;
    let index = 0;
    for (let i = 0; i < this.question.answers.length; i++) {
      if (++counter > this.rowWidth) {
        this.question.answerRows[++index] = [];
        counter = 0;
      }

      this.question.answerRows[index].push(this.question.answers[i]);
    }
  }

  confirm(answer) {
    const message = `Your answer "${answer.title}" has been received, thank you!`

    this.snackbar.open(message, 'OK', {
      duration: 5000
    });
  }

  respond(answer) {
    if (
      answer &&
      answer._id
    ) {
      this.onRespond.emit(answer);
      this.confirm(answer);
    }

    if (
      answer &&
      (
        answer._id ||
        !!this.question.route
      )
    ) {
      this.activityService.usedQuestionId.next(this.question._id);
    }
    
    this.onClose.emit();
  }

  close() {
    this.respond({
      _id: null
    });
  }
}
