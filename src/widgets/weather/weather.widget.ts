import {Component, Input, OnInit} from '@angular/core';

import 'rxjs/add/operator/take';

import {WeatherService} from '../../providers/weather.service';
import {AppSettings} from '../../app/app.settings';
import * as moment from 'moment';
import {interval} from 'rxjs/observable/interval';

@Component({
    selector: 'w2g-weather',
    templateUrl: 'weather.widget.html',
    styleUrls: ['weather.widget.scss']
})
export class WeatherWidget implements OnInit {
    public temperature: number;
    public dateTime: any = moment();
    @Input('showDate') showDate: boolean;

    constructor(private weatherService: WeatherService) {
    }

    ngOnInit() {
        this.schedule();
        this.getWeather();
    }

    schedule() {
        interval(AppSettings.WEATHER_UPDATE_INTERVAL * 60 * 1000).subscribe(() => this.getWeather());
        interval(60 * 1000).subscribe(() => this.dateTime = moment());
    }

    getWeather() {
        this.weatherService
            .get()
            .take(1)
            .subscribe((data) => {
                this.temperature = data.temperature;
            });
    }
}
