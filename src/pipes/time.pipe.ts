import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'time'
})
export class TimePipe implements PipeTransform {
  transform(value: Date): any {
    const time = moment(new Date(value)).format('HH:mm');
    return time;
  }
}
