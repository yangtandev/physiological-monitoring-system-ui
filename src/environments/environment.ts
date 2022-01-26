// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
const port = 3000;
// const domain = `http://192.168.5.52:${port}`;
const domain = `http://localhost:${port}`;

export const environment = {
  appName: '生理監測儀錶板(HR Dashboard)',
  documentTitle: '生理監測儀錶板(HR Dashboard)',
  home: '/',
  favicon: 'favicon.ico',
  production: false,
  identityPoolId: 'ap-northeast-1:2cc2246f-4ceb-412e-93ee-679b04bb4ccd',
  userPoolId: 'ap-northeast-1_TkbJwWU2j',
  clientId: '68pt8b96i12sgrr5k587v42okv',
  region: 'ap-northeast-1',

  // DB Table
  personnelTable: 'personnel',
  dataTable: 'data',
  currentDataTable: 'current_data',
  oneDayHrTable: '1day_hr',
  oneWeekHrTable: '1week_hr',
  oneMonthHrTable: '1month_hr',
  gatewayTable: 'gateway',
  wrisbandTable: 'wristband',
  fiveMinuteHRVTable: '5minute_hrv',
  oneHourHRVTable: '1hour_hrv',
  oneDayHRVTable: '1day_hrv',
  oneWeekHRVTable: '1week_hrv',
  oneMonthHRVTable: '1month_hrv',

  // Current-data API
  getCurrentData: `${domain}/current-data`, // + user_id
  getAllCurrentData: `${domain}/all-current-data`, // + user_id

  // Data API
  getData: `${domain}/data`, // + user_id & start_time & end_time

  // Hr API
  get5MinuteHr: `${domain}/5minute-hr`, // + user_id & start_time & end_time
  getLatest1DayHr: `${domain}/latest-1day-hr`, // + user_id & start_time & end_time
  getLatest1MonthHr: `${domain}/latest-1month-hr`, // + user_id & start_time & end_time

  // Hrv API
  get5MinuteHrv: `${domain}/5minute-hrv`, // + user_id & start_time & end_time
  getLatest5MinuteHrv: `${domain}/latest-5minute-hrv`, // + user_id & start_time & end_time
  get1HourHrv: `${domain}/1hour-hrv`, // + user_id & start_time & end_time
  get1DayHrv: `${domain}/1day-hrv`, // + user_id & start_time & end_time
  getLatest1DayHrv: `${domain}/latest-1day-hrv`, // + user_id & start_time & end_time
  getLatest1WeekHrv: `${domain}/latest-1week-hrv`, // + user_id & start_time & end_time
  getLatest1MonthHrv: `${domain}/latest-1month-hrv`, // + user_id & start_time & end_time
  getFrequencyRatio: `${domain}/frequency-domain`, // + user_id & start_time & end_time

  // Personnel API
  getPersonnels: `${domain}/personnels`,
  getPersonnel: `${domain}/personnel`, // + user_id
  postPersonnel: `${domain}/personnel`,
  putPersonnel: `${domain}/personnel`,
  putPersonnelPairMac: `${domain}/personnel-pair-mac`,
  deletePersonnel: `${domain}/personnel`, // + user_id

  // Gateway API
  getGateways: `${domain}/gateways`,
  getGateway: `${domain}/gateway`, // + gateway
  postGateway: `${domain}/gateway`,
  putGateway: `${domain}/gateway`,
  deleteGateway: `${domain}/gateway`, // + gateway

  // Wristband API
  getWristbands: `${domain}/wristbands`,
  getWristband: `${domain}/wristband`, // + mac,
  postWristband: `${domain}/wristband`,
  putWristband: `${domain}/wristband`,
  deleteWristband: `${domain}/wristband`, // + mac

  //選項欄
  sidebarEnabled: true,
  sidebarLinks: [
    {
      title: '管理',
      links: [
        {
          text: '人員管理',
          link: '/personnel',
        },
        {
          text: '設備管理',
          link: '/devices/pair',
        },
        {
          text: '定位器管理',
          link: '/devices/pi',
        },
      ],
    },
  ],
};

//   title: '功能',
//   links: [
//     {
//       text: '定位系統',
//       link: '/map',
//     }, {
//       text: '連線設備',
//       link: '/devices',
//     }
//   ]
// }, {
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
