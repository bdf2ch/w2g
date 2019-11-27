import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({
  name: 'timeFromToPipe'
})
export class TimeFromToPipePipe implements PipeTransform {
  transform(from: Date, to: Date, ...args: any[]): any {
    const date = moment(from).format('ll');
    const fromHours = moment(from).format('hh:mm A');
    const toHours = moment(to).format('hh:mm A');
    return date + ' from ' + fromHours + " to " + toHours;
  }
}
