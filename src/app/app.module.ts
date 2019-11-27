import {BrowserModule} from '@angular/platform-browser';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {NgModule, LOCALE_ID} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatProgressSpinnerModule,
    MatTabsModule,
    MatTooltipModule,
    MatRadioModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatExpansionModule,
    MatDividerModule
} from '@angular/material';

import {AmazingTimePickerModule} from 'amazing-time-picker';

import {NgxCarouselModule} from 'ngx-carousel';
import {NgCircleProgressModule} from 'ng-circle-progress';
import {TimeAgoPipe} from 'time-ago-pipe';

import {ApolloModule} from 'apollo-angular';
import {HttpLinkModule} from 'apollo-angular-link-http';

import {AppComponent} from './app.component';

import {HeaderComponent} from '../shared/header.component';
import {FooterComponent} from '../shared/footer.component';
import {NavbarComponent} from '../shared/navbar.component';

import {HomePage} from '../pages/home/home.page';
import {AroundMePage} from '../pages/around-me/around-me.page';
import {TransportPage} from '../pages/transport/transport.page';
import {EventsPage} from '../pages/events/events.page';
import {HeritagePage} from '../pages/heritage/heritage.page';
import {LocationPage} from '../pages/location/location.page';
import {LocationsPage} from '../pages/locations/locations.page';
import {InfoPage} from '../pages/info/info.page';
import {SearchPage} from '../pages/search/search.page';

import {AuthService} from '../providers/auth.service';

import {ActivityService} from '../providers/activity.service';
import {AnnotationsService} from '../providers/annotations.service';
import {DirectionsService} from '../providers/directions.service';
import {EventsService} from '../providers/events.service';
import {FeedbackService} from '../providers/feedback.service';
import {FloorsService} from '../providers/floors.service';
import {GeocodeService} from '../providers/geocode.service';
import {InfosService} from '../providers/infos.service';
import {KeyboardService} from '../providers/keyboard.service';
import {LocationsService} from '../providers/locations.service';
import {MapService} from '../providers/map.service';
import {NotificationsService} from '../providers/notifications.service';
import {PcLabsService} from '../providers/pc-labs.service';
import {PopupService} from '../providers/popup.service';
import {RouteService} from '../providers/route.service';
import {SocketService} from '../providers/socket.service';
import {StudySpacesService} from '../providers/study-spaces.service';
import {SurveysService} from '../providers/surveys.service';
import {ToursService} from '../providers/tours.service';
import {TrafficService} from '../providers/traffic.service';
import {TransportService} from '../providers/transport.service';
import {TwitterService} from '../providers/twitter.service';
import {WeatherService} from '../providers/weather.service';

import {MomentPipe} from '../pipes/moment.pipe';

import {CarouselWidget} from '../widgets/carousel/carousel.widget';
import {MapWidget} from '../widgets/map/map.widget';
import {NotificationsWidget} from '../widgets/notifications/notifications.widget';
import {PopupWidget} from '../widgets/popup/popup.widget';
import {QrWidget} from '../widgets/qr/qr.widget';
import {QuestionWidget} from '../widgets/question/question.widget';
import {TimelineWidget} from '../widgets/timeline/timeline.widget';
import {WeatherWidget} from '../widgets/weather/weather.widget';
import {keyboardWidget} from '../widgets/keyboard/keyboard.widget';
import {FloorplanWidget} from '../widgets/Floorplan/Floorplan.widget';
import {HomeScreenPage} from '../pages/home-screen/home-screen.page';
import {LocationSearchPage} from '../pages/location-search/location-search.page';
import {PeopleDirectoryPage} from '../pages/people-directory/people-directory.page';
import {PersonInfoPage} from '../pages/person-info/person-info.page';
import {TodaysMeetingsPage} from '../pages/todays-meetings/todays-meetings.page';
import {EventListItemWidget} from '../widgets/event-list-item/event-list-item.widget';
import {MeetingRoomsService} from '../providers/meeting-rooms.service';
import {MeetingRoomsPage} from '../pages/meeting-rooms/meeting-rooms.page';
import {TimeFromToPipePipe} from '../pipes/time-from-to.pipe';
import {PeopleDirectoryService} from '../providers/people-directory.service';
import {TimePipe} from '../pipes/time.pipe';

const appRoutes: Routes = [
    {
        path: '',
        component: HomeScreenPage
    },
    {
        path: 'location-searches',
        pathMatch: 'prefix',
        component: LocationSearchPage
    },
    {
        path: 'meeting-rooms',
        pathMatch: 'prefix',
        component: MeetingRoomsPage
    },
    {
        path: 'people-directory',
        pathMatch: 'prefix',
        component: PeopleDirectoryPage
    },
    {
        path: 'people-directory/:_id',
        pathMatch: 'prefix',
        component: PersonInfoPage
    },
    {
        path: 'todays-meetings',
        component: TodaysMeetingsPage
    }
];

@NgModule({
    declarations: [
        AppComponent,
        HomePage,
        HomeScreenPage,
        LocationSearchPage,
        AroundMePage,
        TransportPage,
        EventsPage,
        HeritagePage,
        LocationPage,
        LocationsPage,
        MeetingRoomsPage,
        InfoPage,
        HeaderComponent,
        FooterComponent,
        NavbarComponent,
        MomentPipe,
        TimeFromToPipePipe,
        TimePipe,
        TimeAgoPipe,
        CarouselWidget,
        MapWidget,
        NotificationsWidget,
        PopupWidget,
        QrWidget,
        QuestionWidget,
        TimelineWidget,
        WeatherWidget,
        SearchPage,
        keyboardWidget,
        FloorplanWidget,
        PeopleDirectoryPage,
        PersonInfoPage,
        TodaysMeetingsPage,
        EventListItemWidget
    ],
    entryComponents: [
        PopupWidget
    ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule.forRoot(appRoutes),
        HttpClientModule,
        MatButtonModule,
        MatIconModule,
        MatExpansionModule,
        MatListModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatTooltipModule,
        NgxCarouselModule,
        NgCircleProgressModule.forRoot(),
        MatRadioModule,
        FormsModule,
        ReactiveFormsModule,
        AmazingTimePickerModule,
        MatAutocompleteModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
        ApolloModule,
        HttpLinkModule,
        MatDividerModule
    ],
    providers: [
        AuthService,
        ActivityService,
        AnnotationsService,
        DirectionsService,
        EventsService,
        FeedbackService,
        FloorsService,
        GeocodeService,
        InfosService,
        KeyboardService,
        LocationsService,
        MapService,
        MeetingRoomsService,
        NotificationsService,
        PcLabsService,
        PopupService,
        RouteService,
        SocketService,
        StudySpacesService,
        SurveysService,
        ToursService,
        TrafficService,
        TransportService,
        TwitterService,
        WeatherService,
        PeopleDirectoryService,
        {
            provide: LOCALE_ID,
            useValue: 'en-UK'
        }
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule {
}
