import {Component, Input, OnInit, OnDestroy} from "@angular/core";
import {ActivatedRoute, Router} from '@angular/router';
import {Subscription} from 'rxjs';
import {AppSettings} from "../../app/app.settings";
import {KeyboardService} from '../../providers/keyboard.service';

@Component({
  selector: 'w2g-keyboard',
  templateUrl: './keyboard.widget.html',
  styleUrls: ['./keyboard.widget.scss']
})
export class keyboardWidget implements OnInit , OnDestroy{

  public keys_array: any[] = AppSettings.KEYBOARD_KEYS;
  private userInput: any;
  public keyboardSubscription;


  constructor(
    private router: Router,
    private keyboardService: KeyboardService,
    private route: ActivatedRoute,

  ) {
      this.keyboardSubscription = this.keyboardService.keyboard.subscribe((data) => {
          if (data != null) {
              if (data.value != null && data.update === true) {
                  this.userInput = data.value;
              }
          }

      });
  }

  ngOnInit() {

  }
  ngOnDestroy() {
    this.userInput = null;
    this.keyboardService.keyboard.next(null);
    if (this.keyboardSubscription) {
      this.keyboardSubscription.unsubscribe();
    }
  }

  public key_input(x) {
    if (x === 'DEL') {
      if (this.userInput !== undefined ) {
        this.userInput = this.userInput.slice(0, -1);
      }
    }  else if (x === 'space') {
      this.userInput += ' ';
    } else if (this.userInput === undefined) {
      this.userInput = x;
    } else {
      this.userInput += x;
    }

    const data = {
      value: this.userInput,
      update: false
    };
    this.keyboardService.keyboard.next(data);
  }


}
