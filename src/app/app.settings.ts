import { environment } from '../environments/environment';

export class AppSettings {
  public static APP_MANAGER_URL = 'https://apps.swansea.wai2go.com';
  public static APP_ID = 'wai2go_kiosk';
  public static APP_SECRET = 'this_is_a_secret';

  public static LM2_URL = 'https://lm2.swansea.wai2go.com';
  public static LM2_MOCK_URL = 'http://broker.wai2go.com:8082';
  public static PROJECT_ID = 27;
  public static CAMPUS_ID = 28;
  public static PARKING_CATEGORY_IDS = [
  ];
  public static PARKING_ACCESSIBLE_CATEGORY_IDS = [
  ];

  public static IS_STAGING = environment.staging;

  public static W2G_URL = 'https://www.wai2go.co.uk';
  public static WEB_URL = 'https://campusmap.bham.ac.uk/';

  public static SHOW_FLOORPLANS = false;

  public static ROUTING_LATITUDE = 51.880922;
  public static ROUTING_OFFLINE = false;
  public static ROUTING_GPS_ONLY = false;
  public static ROUTING_MAX_WALK_DISTANCE = 3218;
  public static ROUTING_DISTANCE_STOPS = [
    [ 168, '#94c11f', '< 2 min. Walk' ],
    [ 357, '#ff9800', '2 to 5 min. Walk' ],
    [ 400, '#ff3a00', '> 5 min. Walk' ]
  ];
  public static ROUTING_DISTANCE_GRADIENT = false;
  public static ROUTING_DISTANCE_STOP_ICONS = [
    'assets/images/legend/under-2.png',
    'assets/images/legend/2-to-5.png',
    'assets/images/legend/over-5.png'
  ];
  public static ROUTING_GRAPH_OPTIONS = [ ];
  public static HEX_REGEX = /\b[0-9A-Fa-f]{32}\b/;
  public static GPS_REGEX = /^[-+]?([1-8]?\d(\.\d+)?|90(\.0+)?),\s*[-+]?(180(\.0+)?|((1[0-7]\d)|([1-9]?\d))(\.\d+)?)$/;
  public static OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;
  public static UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  public static INITIAL_URL = '/';

  public static CENTER: number[] = [ -3.940273, 51.626658 ];
  public static BEARING = 0;
  public static ZOOM = 19;
  public static CLUSTER_MAX_ZOOM = 19;
  public static FLOOR_ID = null;
  public static MAX_BOUNDS = [ [ 52.532632, -2.064980 ], [ 52.427485, -1.787516 ] ];
  public static WALKING_DISTANCE = 400;
  public static RENDER_CIRCLE = false;
  public static DARKEN_STYLE_BY = 0.5;
  public static TIMEZONE = 'Europe/London';

  public static NEAREST_CATEGORY_IDS = [
  ];

  public static INCLUDE_ONLY_BUILDING_IDS = [];

  public static TRANSPORT_CATEGORY_ID = '5d6dc44e6a4c3f006c2d164a';
  public static TRANSPORT_RAIL_CATEGORY_ID = '5d6dc44e6a4c3f006c2d1652';
  public static TRANSPORT_PROVIDER = 'transportapi';
  public static TRANSPORT_SHUTTLE_BUS_CATEGORY_IDS = [ '5d6dc44f6a4c3f006c2d1792' ];

  public static PC_LABS_URL = null;
  public static PC_LABS_CATEGORY_ID = null;
  public static PC_LABS_REFRESH_INTERVAL = 60;

  public static STUDY_SPACES_URL = null;
  public static STUDY_SPACES_CATEGORY_ID = null;
  public static STUDY_SPACES_REFRESH_INTERVAL = 60;

  public static PARENT_MORE_INFO_CATEGORIES = [
  ];


  public static AVAILABILITY_RATIO_STOPS: any[] = [
    [ 0, '#ff3a00' ],
    [ 0.25, '#ff9800' ],
    [ 0.75, '#94c11f' ]
  ];
  public static AVAILABILITY_CIRCLE_SHOW_FULL = true;

  public static FEEDBACK_NAME = 'UWTSD Information Point - Swansea Business School';
  public static FEEDBACK_PAGES = [
    'Location Search',
    'Directions',
    'People Directory',
    'Meetings',
    'Meeting Rooms'
  ];
  public static FEEDBACK_FOOTER = ``;

  public static FEEDBACK_ERROR_MESSAGE = 'Unable to reach server, feedback not submitted.';
  public static FEEDBACK_SUCCESS_MESSAGE = 'Thank you for your feedback!';
  public static FEEDBACK_SUCCESS_TIMEOUT = 3; // seconds

  public static DEFAULT_ICON_URL = '';
  public static ICON_SIZE = [42, 42];
  public static ICON_ANCHOR = [21, 21];

  public static ROUTE_BG_PAINT = {
    'line-color': '#45699c',
    'line-width': 4,
    'line-opacity': 1
  };

  public static ROUTE_SECONDARY_BG_PAINT = {
    'line-color': '#1a1a1a',
    'line-width': 4,
    'line-opacity': 1
  };

  public static ROUTE_FG_PAINT = {
    'line-color': '#659df6',
    'line-width': 3,
    'line-opacity': 1
  };

  public static ROUTE_SECONDARY_FG_PAINT = {
    'line-color': '#333333',
    'line-width': 3,
    'line-opacity': 1
  };

  public static TOUR_PAINT = {
    'line-color': '#659df6',
    'line-width': 8,
    'line-opacity': 1
  };

  public static JOURNEY_PAINT = {
    foot: {
      'line-color': '#73ad43',
      'line-width': 5,
      'line-dasharray': [1, 2]
    },
    tube: {
      'line-color': '#cb5f20',
      'line-width': 5,
    },
    train: {
      'line-color': '#fd2525',
      'line-width': 5,
    },
    overground: {
      'line-color': '#cb5f20',
      'line-width': 5,
    },
    bus: {
      'line-color': '#0dbac5',
      'line-width': 5,
    },
    tram: {
      'line-color': '#73ad43',
      'line-width': 5,
    },
    boat: {
      'line-color': '#73ad43',
      'line-width': 5,
    },
    dlr: {
      'line-color': '#cb5f20',
      'line-width': 5,
    }
  };

  public static ROUTE_ICON_SIZE = [48, 54];
  public static ROUTE_ICON_ANCHOR = [24, 0];

  public static START_MARKER = null;
  public static NEXT_MARKER = 'assets/markers/next-marker.png';
  public static PREVIOUS_MARKER = 'assets/markers/previous-marker.png';
  public static END_MARKER = 'assets/markers/end-marker.png';

  public static WEATHER_UPDATE_INTERVAL = 5;
  public static LOGO = 'assets/images/birmingham/logo.svg';
  public static HOME_MEDIA: {
    id: Number,
    url: String,
    type: String,
    duration?: Number,
    redirectUrl?: String,
    caption?: String
    locationId?: String
    surveyId?: String,
    default?: Boolean
  }[] = [
    {
      id: 1,
      url: 'assets/images/birmingham/touch-screen.jpg',
      type: 'image',
      duration: 40,
      redirectUrl: '/around-me/remote',
      default: true
    },
    {
      id: 3,
      url: 'assets/images/birmingham/clock-tower.jpg',
      type: 'image',
      duration: 20,
      caption: 'Joseph Chamberlain Memorial Clock Tower',
      redirectUrl: '/around-me/remote',
      default: true
    },
    {
      id: 4,
      url: 'assets/images/birmingham/app-poster.jpg',
      type: 'image',
      duration: 20,
      caption: 'Campus Map App',
      default: true
    }
  ];
  public static HOME_MEDIA_CAPTION_SHOW = true;
  public static HOME_MEDIA_FULL_SCREEN = false;

  public static TWITTER_MODULE = 'w2g-broker-twitter';
  public static TWITTER_COLOR = '#2d418a';
  public static TWITTER_SCREEN_NAME = 'unibirmingham';
  public static TWITTER_ICON = 'twitter-svg';

  public static TRAFFIC_MODULE = 'w2g-broker-traffic';
  public static TRAFFIC_COLOR = '#605270';
  public static TRAFFIC_ICON = 'warning';

  public static MAX_NOTIFICATIONS = 3;
  public static NOTIFICATION_UPDATE_INTERVAL = 1;
  public static NOTIFICATION_RECENT_INTERVAL = 5;
  public static NOTIFICATION_PREFIX_ITEMS = [];
  public static NOTIFICATION_DEFAULT_COLOR = '#605270';
  public static NOTIFICATION_DEFAULT_ICON = 'notification_important';

  public static AUTH_STATUS_MESSAGE = 'Device is authenticating, please wait...';
  public static AUTH_ERROR_MESSAGE = 'Unable to reach server, this is being investigated.';
  public static AUTH_RETRY_TIMEOUT = 3; // seconds
  public static INACTIVITY_TIMEOUT = 2; // minutes

  public static SVG_ICONS = [
    {
      name: 'twitter-svg',
      url: 'assets/vectors/social/twitter.svg'
    },
    {
      name: 'home-svg',
      url: 'assets/vectors/menu/home.svg'
    },
    {
      name: 'home-active-svg',
      url: 'assets/vectors/birmingham/home-active.svg'
    },
    {
      name: 'around-me-svg',
      url: 'assets/vectors/around-me/nearest.svg'
    },
    {
      name: 'around-me-active-svg',
      url: 'assets/vectors/birmingham/nearest-active.svg'
    },
    {
      name: 'transport-svg',
      url: 'assets/vectors/menu/transport.svg'
    },
    {
      name: 'transport-active-svg',
      url: 'assets/vectors/birmingham/transport-active.svg'
    },
    {
      name: 'events-svg',
      url: 'assets/vectors/menu/events.svg'
    },
    {
      name: 'events-active-svg',
      url: 'assets/vectors/birmingham/events-active.svg'
    },
    {
      name: 'heritage-svg',
      url: 'assets/vectors/menu/heritage.svg'
    },
    {
      name: 'heritage-active-svg',
      url: 'assets/vectors/menu/heritage-active.svg'
    },
    {
      name: 'info-svg',
      url: 'assets/vectors/menu/info.svg'
    },
    {
      name: 'info-active-svg',
      url: 'assets/vectors/birmingham/info-active.svg'
    },
    {
      name: 'search-svg',
      url: 'assets/vectors/menu/search.svg'
    },
    {
      name: 'search-active-svg',
      url: 'assets/vectors/birmingham/search-active.svg'
    },
    {
      name: 'nearest-svg',
      url: 'assets/vectors/around-me/nearest.svg'
    },
    {
      name: 'nearest-active-svg',
      url: 'assets/vectors/around-me/nearest-active.svg'
    },
    {
      name: 'study-spaces-svg',
      url: 'assets/vectors/around-me/study-spaces.svg'
    },
    {
      name: 'study-spaces-active-svg',
      url: 'assets/vectors/around-me/study-spaces-active.svg'
    },
    {
      name: 'pc-labs-svg',
      url: 'assets/vectors/around-me/pc-labs.svg'
    },
    {
      name: 'pc-labs-active-svg',
      url: 'assets/vectors/around-me/pc-labs-active.svg'
    },
    {
      name: 'shops-svg',
      url: 'assets/vectors/around-me/shops.svg'
    },
    {
      name: 'shops-active-svg',
      url: 'assets/vectors/around-me/shops-active.svg'
    },
    {
      name: 'campus-developments-svg',
      url: 'assets/vectors/around-me/campus-developments.svg'
    },
    {
      name: 'campus-developments-active-svg',
      url: 'assets/vectors/around-me/campus-developments-active.svg'
    },
    {
      name: 'teaching-and-learning-svg',
      url: 'assets/vectors/around-me/teaching-and-learning.svg'
    },
    {
      name: 'teaching-and-learning-active-svg',
      url: 'assets/vectors/around-me/teaching-and-learning-active.svg'
    },
    {
      name: 'health-and-security-svg',
      url: 'assets/vectors/around-me/health-and-security.svg'
    },
    {
      name: 'health-and-security-active-svg',
      url: 'assets/vectors/around-me/health-and-security-active.svg'
    },
    {
      name: 'lecture-rooms-svg',
      url: 'assets/vectors/around-me/lecture-rooms.svg'
    },
    {
      name: 'lecture-rooms-active-svg',
      url: 'assets/vectors/around-me/lecture-rooms-active.svg'
    },
    {
      name: 'food-and-drink-svg',
      url: 'assets/vectors/around-me/food-and-drink.svg'
    },
    {
      name: 'food-and-drink-active-svg',
      url: 'assets/vectors/around-me/food-and-drink-active.svg'
    },
    {
      name: 'pc-labs-svg',
      url: 'assets/vectors/around-me/pc-labs.svg'
    },
    {
      name: 'pc-labs-active-svg',
      url: 'assets/vectors/around-me/pc-labs-active.svg'
    },
    {
      name: 'lecture-rooms-svg',
      url: 'assets/vectors/around-me/lecture-rooms.svg'
    },
    {
      name: 'lecture-rooms-active-svg',
      url: 'assets/vectors/around-me/lecture-rooms-active.svg'
    },
    {
      name: 'food-and-drink-svg',
      url: 'assets/vectors/around-me/food-and-drink.svg'
    },
    {
      name: 'food-and-drink-active-svg',
      url: 'assets/vectors/around-me/food-and-drink-active.svg'
    },
    {
      name: 'family-fun-svg',
      url: 'assets/vectors/around-me/family-fun.svg'
    },
    {
      name: 'family-fun-active-svg',
      url: 'assets/vectors/around-me/family-fun-active.svg'
    },
    {
      name: 'toilets-svg',
      url: 'assets/vectors/around-me/toilets.svg'
    },
    {
      name: 'toilets-active-svg',
      url: 'assets/vectors/around-me/toilets-active.svg'
    },
    {
      name: 'bus-svg',
      url: 'assets/vectors/transport/bus.svg'
    },
    {
      name: 'bus-active-svg',
      url: 'assets/vectors/transport/bus-active.svg'
    },
    {
      name: 'rail-svg',
      url: 'assets/vectors/transport/rail.svg'
    },
    {
      name: 'rail-active-svg',
      url: 'assets/vectors/transport/rail-active.svg'
    },
    {
      name: 'parking-svg',
      url: 'assets/vectors/transport/parking.svg'
    },
    {
      name: 'parking-active-svg',
      url: 'assets/vectors/transport/parking-active.svg'
    },
    {
      name: 'planner-svg',
      url: 'assets/vectors/transport/planner.svg'
    },
    {
      name: 'planner-active-svg',
      url: 'assets/vectors/transport/planner-active.svg'
    },
    {
      name: 'cycle-svg',
      url: 'assets/vectors/transport/cycle.svg'
    },
    {
      name: 'cycle-active-svg',
      url: 'assets/vectors/transport/cycle-active.svg'
    },
    {
      name: 'walking-svg',
      url: 'assets/vectors/transport/walking.svg'
    },
    {
      name: 'walking-active-svg',
      url: 'assets/vectors/transport/walking-active.svg'
    },
    {
      name: 'events-events-active-svg',
      url: 'assets/vectors/events/events-active.svg'
    },
    {
      name: 'featured-svg',
      url: 'assets/vectors/events/featured.svg'
    },
    {
      name: 'featured-active-svg',
      url: 'assets/vectors/events/featured-active.svg'
    },
    {
      name: 'talks-svg',
      url: 'assets/vectors/events/talks.svg'
    },
    {
      name: 'talks-active-svg',
      url: 'assets/vectors/events/talks-active.svg'
    },
    {
      name: 'su-events-svg',
      url: 'assets/vectors/events/su-events.svg'
    },
    {
      name: 'su-events-active-svg',
      url: 'assets/vectors/events/su-events-active.svg'
    },
    {
      name: 'sports-svg',
      url: 'assets/vectors/events/sports.svg'
    },
    {
      name: 'sports-active-svg',
      url: 'assets/vectors/events/sports-active.svg'
    },
    {
      name: 'featured-info-svg',
      url: 'assets/vectors/info/featured.svg'
    },
    {
      name: 'featured-info-active-svg',
      url: 'assets/vectors/info/featured-active.svg'
    },
    {
      name: 'news-svg',
      url: 'assets/vectors/info/news.svg'
    },
    {
      name: 'news-active-svg',
      url: 'assets/vectors/info/news-active.svg'
    },
    {
      name: 'travel-svg',
      url: 'assets/vectors/info/travel.svg'
    },
    {
      name: 'travel-active-svg',
      url: 'assets/vectors/info/travel-active.svg'
    },
    {
      name: 'coming-soon-svg',
      url: 'assets/vectors/info/coming-soon.svg'
    },
    {
      name: 'coming-soon-active-svg',
      url: 'assets/vectors/info/coming-soon-active.svg'
    },
    {
      name: 'help-svg',
      url: 'assets/vectors/info/help.svg'
    },
    {
      name: 'help-active-svg',
      url: 'assets/vectors/info/help-active.svg'
    },
    {
      name: 'feedback-svg',
      url: 'assets/vectors/info/feedback.svg'
    },
    {
      name: 'feedback-active-svg',
      url: 'assets/vectors/info/feedback-active.svg'
    },
    {
      name: 'zoom-in-svg',
      url: 'assets/vectors/global/zoom-in.svg'
    },
    {
      name: 'zoom-out-svg',
      url: 'assets/vectors/global/zoom-out.svg'
    },
    {
      name: 'able-bodied-svg',
      url: 'assets/vectors/global/able-bodied.svg'
    },
    {
      name: 'disabled-svg',
      url: 'assets/vectors/global/disabled.svg'
    },
    {
      name: 'close-svg',
      url: 'assets/vectors/global/close.svg'
    },
    {
      name: 'close-dark-svg',
      url: 'assets/vectors/global/close-dark.svg'
    },
    {
      name: 'up-arrow-svg',
      url: 'assets/vectors/global/up-arrow.svg'
    },
    {
      name: 'up-arrow-dark-svg',
      url: 'assets/vectors/global/up-arrow-dark.svg'
    },
    {
      name: 'down-arrow-svg',
      url: 'assets/vectors/global/down-arrow.svg'
    },
    {
      name: 'down-arrow-dark-svg',
      url: 'assets/vectors/global/down-arrow-dark.svg'
    },
    {
      name: 'bus-planner-svg',
      url: 'assets/vectors/planner/bus.svg'
    },
    {
      name: 'rail-planner-svg',
      url: 'assets/vectors/planner/rail.svg'
    },
    {
      name: 'walk-planner-svg',
      url: 'assets/vectors/planner/walking.svg'
    },
    {
      name: 'study-spaces-birmingham-svg',
      url: 'assets/vectors/birmingham/study-spaces.svg'
    },
    {
      name: 'tours-svg',
      url: 'assets/vectors/menu/tours.svg'
    }
  ];

  public static MAP_BUTTONS = [
    {
      id: 'zoom-in',
      label: 'ZOOM IN',
      iconUrl: 'assets/images/buttons/ZoomIn.png',
      backgroundColor: '#2a2a2a'
    },
    {
      id: 'zoom-out',
      label: 'ZOOM OUT',
      iconUrl: 'assets/images/buttons/ZoomOut.png',
      backgroundColor: '#2a2a2a'
    },
    {
      id: 'center-pan',
      label: 'CENTER',
      iconUrl: 'assets/vectors/around-me/nearest.svg',
      backgroundColor: '#2a2a2a'
    },
    {
      id: 'disabled',
      label: 'Disabled',
      iconUrl: 'assets/images/buttons/disabled.png',
      statusOff: "OFF",
      statusOn:"ON",
      activeIconUrl: 'assets/images/buttons/able.png',
      backgroundColor: '#605270',
      className: 'titlecase'
    }
  ];

  public static THEME_COLORS: any = {
    '': {
      hex: '#605270',
      name: 'smoky'
    },
    'around-me': {
      hex: '#605270',
      name: 'smoky'
    },
    transport: {
      hex: '#605270',
      name: 'smoky'
    },
    events: {
      hex: '#605270',
      name: 'smoky'
    },
    heritage: {
      hex: '#605270',
      name: 'smoky'
    },
    locations: {
      hex: '#605270',
      name: 'smoky'
    },
    info: {
      hex: '#605270',
      name: 'smoky'
    },
    search: {
      hex: '#605270',
      name: 'smoky'
    }
  };

  public static FULL_SIZE = true;
  public static SHOW_HEADER = true;
  public static SHOW_HEADER_ONLY_ON_HOME = false;
  public static MENU_SIDEBAR = false;
  public static MENU_SUBSIDEBAR = false;
  public static SHOW_FOOTER = true;
  public static MENU_BUTTONS = [
    {
      label: 'Search',
      url: '/search',
      icon: 'search-svg',
      activeIcon: 'search-active-svg',
      activeColor: '#605270',
      className: 'size-64 titlecase'
    },
    {
      label: 'Campus Info',
      url: '/around-me/remote',
      icon: 'around-me-svg',
      activeIcon: 'around-me-active-svg',
      activeColor: '#605270',
      className: 'size-64 titlecase'
    },
    {
      label: 'Travel',
      url: '/transport',
      icon: 'transport-svg',
      activeIcon: 'transport-active-svg',
      activeColor: '#605270',
      className: 'size-76 titlecase'
    },
    {
      label: 'Events',
      url: '/events/week',
      icon: 'events-svg',
      activeIcon: 'events-active-svg',
      activeColor: '#605270 titlecase',
      className: 'size-62 titlecase'
    },
    {
      label: 'Study Spaces',
      url: '/locations/5d6dc44f6a4c3f006c2d1762',
      icon: 'study-spaces-birmingham-svg',
      activeIcon: 'study-spaces-birmingham-svg',
      activeColor: '#605270',
      className: 'size-54 titlecase bordered circle'
    },
    {
      label: 'Campus Mile',
      url: '/heritage/5d66d821ac0443003378a913',//'/tours/campusmile',
      icon: 'tours-svg',
      activeIcon: 'tours-svg',
      activeColor: '#605270',
      className: 'size-52 titlecase'
    }
  ];

  public static GLOBAL_BUTTONS = [
    {
      icon: 'home',
      url: '/',
      label: 'Home',
      tooltip: 'Home',
      primaryColor: '#605270',
      className: 'wide titlecase'
    }
  ];

  public static SEARCH_CLOSE_BUTTON = true;
  public static SEARCH_POPULAR_CATEGORY_ID = '5d6dc44f6a4c3f006c2d1772';
  public static SEARCH_POPULAR_LABEL = 'Key Landmarks';

  public static AROUND_ME_BUTTONS = [
    /* {
     label: 'Nearest',
     url: '/around-me',
     icon: 'nearest-svg',
     activeIcon: 'nearest-active-svg',
     id: 0
     }, */
    {
      label: 'Campus Developments',
      url: '/around-me/5d6dc44e6a4c3f006c2d1642',
      icon: 'campus-developments-svg',
      activeIcon: 'campus-developments-active-svg',
      id: '5d6dc44e6a4c3f006c2d1642'
    },
    {
      label: 'Computer Cluster',
      url: '/around-me/5d6dc44e6a4c3f006c2d1752',
      icon: 'pc-labs-svg',
      activeIcon: 'pc-labs-active-svg',
      id: '5d6dc44e6a4c3f006c2d1752'
    },
    {
      label: 'Defibrillators',
      url: '/around-me/5d6dc44e6a4c3f006c2d16e2',
      icon: 'health-and-security-svg',
      activeIcon: 'health-and-security-active-svg',
      id: '5d6dc44e6a4c3f006c2d16e2'
    },
    {
      label: 'Cafe, Shops & Other',
      url: '/around-me/5d6dc44f6a4c3f006c2d176a',
      icon: 'shops-svg',
      activeIcon: 'shops-active-svg',
      id: '5d6dc44f6a4c3f006c2d176a'
    },
    {
      label: 'Study Spaces',
      url: '/around-me/5d6dc44f6a4c3f006c2d1762',
      icon: 'study-spaces-birmingham-svg',
      activeIcon: 'study-spaces-birmingham-svg',
      id: '5d6dc44f6a4c3f006c2d1762'
    }
  ];

  public static SHOW_ALL_AROUND_ME_CATEGORIES = true;
  public static DEFAULT_AROUND_ME_BAR_TITLE = 'Tap on one of the options below to explore locations';

  public static TRANSPORT_BUTTONS = [
    {
      label: 'Bus',
      url: '/transport',
      icon: 'bus-svg',
      activeIcon: 'bus-active-svg'
    },
    {
      label: 'Rail',
      url: '/transport/rail',
      icon: 'rail-svg',
      activeIcon: 'rail-active-svg'
    },
    {
      label: 'Parking',
      url: '/transport/parking',
      icon: 'parking-svg',
      activeIcon: 'parking-active-svg'
    },
    {
      label: 'Planner',
      url: '/transport/planner',
      icon: 'planner-svg',
      activeIcon: 'planner-active-svg'
    }/*,
     {
     label: 'Cycle',
     url: '/transport/cycle',
     icon: 'cycle-svg',
     activeIcon: 'cycle-active-svg'
     },
     {
     label: 'Walking',
     url: '/transport/walking',
     icon: 'walking-svg',
     activeIcon: 'walking-active-svg'
     }*/
  ];

  public static EVENTS_BUTTONS = [
    {
      label: 'This Week',
      url: '/events/week',
      icon: 'events-svg',
      activeIcon: 'events-events-active-svg'
    },
    {
      label: 'This Month',
      url: '/events/month',
      icon: 'events-svg',
      activeIcon: 'events-events-active-svg'
    },
    {
      label: 'Featured',
      url: '/events/featured',
      icon: 'featured-svg',
      activeIcon: 'featured-active-svg'
    },
    {
      label: 'Talks',
      url: '/events/5bfc698e3df99d00306fddf5',
      icon: 'talks-svg',
      activeIcon: 'talks-active-svg'
    },
    {
      label: 'Research',
      url: '/events/5bfc698e3df99d00306fddfb',
      icon: 'events-svg',
      activeIcon: 'events-events-active-svg'
    },
    {
      label: 'Open Day',
      url: '/events/5bfc698e3df99d00306fde05',
      icon: 'events-svg',
      activeIcon: 'events-events-active-svg'
    }
  ];

  public static INFO_BUTTONS = [
    {
      label: 'Featured',
      url: '/info',
      icon: 'featured-info-svg',
      activeIcon: 'featured-info-active-svg'
    },
    {
      label: 'Campus Notices',
      url: '/info/14/Notifications',
      icon: 'news-svg',
      activeIcon: 'news-active-svg'
    },
    {
      label: 'University News',
      url: '/info/5/Feed',
      icon: 'news-svg',
      activeIcon: 'news-active-svg'
    },
    {
      label: 'Security',
      url: '/info/8/Security',
      icon: 'news-svg',
      activeIcon: 'news-active-svg'
    },
    {
      label: 'IT Services',
      url: '/info/6/IT Services',
      icon: 'help-svg',
      activeIcon: 'help-active-svg'
    },
    {
      label: 'Feedback',
      url: '/info/feedback',
      icon: 'feedback-svg',
      activeIcon: 'feedback-active-svg'
    }

  ];

  public static TIMELINE_TYPES = [
    {
      value: 'building',
      label: 'Building'
    },
    {
      value: 'historicPeriod',
      label: 'Historic Period'
    },
    {
      value: 'people',
      label: 'People'
    }
  ];

  public static EVENT_MARKER_ICON = 'assets/markers/event-marker';
  public static TOUR_MARKER_ICON = 'assets/markers/tour-marker.svg';
  public static CYCLEPATH_MARKER_ICON = 'assets/markers/cycle-marker.svg';

  public static DEFAULT_TOUR_ID = null;
  public static TOUR_IDS = [
  ];
  public static CYCLEPATH_TOUR_IDS = [
  ];

  public static TOURS_PAINT = {
  };

  public static TOUR_MARKER_ICONS = {
  };

  public static TOUR_MARKER_CLASSNAMES = {
  };

  public static TOUR_INTRO_NAME = null;
  public static TOUR_INTRO_POINT_TIMEOUT = 15; // seconds
  public static TOUR_DEFAULT_IMAGE = null;

  public static SURVEY_ID = null;
  public static SURVEY_COLOR = '#605270';

  public static QR_CODE = true;

  public static KEYBOARD_KEYS = [
    ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'],
    ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
    ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', '\''],
    ['Z', 'X', 'C', 'V', 'B', 'N', 'M', ',', '.']
  ];

  public static POPULAR_LOCATIONS = [
    /* {'name': 'Birmingham New Street Train Station', 'gpsLat': 52.47766, 'gpsLon': -1.89868},
     {'name': 'Birmingham International Airport', 'gpsLat': 52.45095, 'gpsLon': -1.72545} */
  ];

  public static HOME_SCREEN_BUTTONS = [
    {
      icon: 'edit',
      label: 'view floorplans',
      link: '#'
    },
    {
      icon: 'search',
      label: 'location searches',
      link: '/location-searches'
    },
    {
      icon: 'directions',
      label: 'directions',
      link: '#'
    },
    {
      icon: 'people',
      label: 'people directory',
      link: '/people-directory'
    },
    {
      icon: 'edit',
      label: `today's meetings`,
      link: '/todays-meetings'
    },
    {
      icon: 'edit',
      label: 'meeting rooms',
      link: '#'
    },
    {
      icon: 'help_outline',
      label: 'help',
      link: '#'
    }
  ];
}
