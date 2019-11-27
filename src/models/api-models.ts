export class LocationCategory {
    id: string;
    name: string;
    icon: string;
    exclude_from_directory: boolean;
    children: LocationCategoryChildren[];
}

export class LocationCategoryChildren {
    id: string;
    icon: string;
    name: string;
    category: string;
    exclude_from_directory: false;
}
export class MeetRoomCategory {
    id: string;
    name: string;
    query_source: string;
    api: string;
    license_failed: boolean;
    last_update: Date;
    last_result: boolean;
    last_status: string;
    settings: MeetRoomCategorySettings;
}

export class MeetRoomCategorySettings {
    show_setting_action: boolean;
    locale: string;
    resources: string[];
    rooms: MeetRoom[];
}

export class MeetRoom {
    id: string;
    sourceId: string;
    sourceName: string;
    name: string;
}

export class MeetRoomFull extends MeetRoom {
   event: MeetRoomEvent[];
}

export class MeetRoomEvent {
    uid: string;
    subject: string;
    from_name: string;
    from_email: string;
    start_time: Date;
    end_time: Date;
    all_day: boolean;
    type: string;
    meeting_status: string;
    breakdownTime: number;
    setupTime: number;
}

export class MeetRoomFullResponse {
    resource: MeetRoomFull[];
}

export class Meeting {
    /** acmUrl: "https://uob.wai2go.com:8081"
     allDay: false
     campusId: 24
     categories: [{…}]
     contentId: 165791
     displayName: "Boost up your languages! (Year 12 & 13)"
     endDate: "2019-11-27T15:00:00+00:00"
     featured: false
     fee: null
     gpsLat: null
     gpsLon: null
     imageUrl: "https://demo.wai2go.com:8081//api/media/5dc0f3c9bf011200356038b2/raw"
     liveId: null
     metadataId: "5dc0f3f254f614003a184e20"
     performer: null
     projectId: 23
     startDate: "2019-11-27T13:00:00+00:00"
     status: "enabled"
     timezone: "utc"
     unpublished: false
     venue: "University of Birmingham" **/
    allDay: boolean;
    displayName: string;
    campusId: number;
    contentId: number;
    startDate: Date;
    endDate: Date;
    featured: boolean;
    fee: number;
    gpsLat: number;
    gpsLon: number;
    imageUrl: string;
    liveId: number;
    timezone: string;
    venue: string;
}

