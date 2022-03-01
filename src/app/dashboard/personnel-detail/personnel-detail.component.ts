import {
  AfterViewInit,
  Component,
  NgModule,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { timer, Observable } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import {
  addDays,
  endOfDay,
  max,
  min,
  startOfDay,
  subDays,
  format,
  subMinutes,
} from 'date-fns';
import saveAs from 'file-saver';
import { unparse } from 'papaparse';
import Chart from 'chart.js/dist/Chart.js';
import { HttpClient } from '@angular/common/http';

import {
  MomentDateAdapter,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import {
  DateAdapter,
  MAT_DATE_FORMATS,
  MAT_DATE_LOCALE,
} from '@angular/material/core';
import { Router } from '@angular/router';
import { APIService } from '../../services/api.service';
import { environment } from '../../../environments/environment';

import * as _moment from 'moment';
import { default as _rollupMoment, Moment } from 'moment';
import { FormControl } from '@angular/forms';
import { MatDatepicker } from '@angular/material/datepicker';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';

const moment = _rollupMoment || _moment;

export const MY_FORMATS = {
  parse: {
    dateInput: 'YYYY/MM',
  },
  display: {
    dateInput: 'YYYY/MM',
    monthYearLabel: 'YYYY MMM ',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'YYYY MMMM ',
  },
};
@Component({
  selector: 'app-personnel-detail',
  templateUrl: './personnel-detail.component.html',
  styleUrls: ['./personnel-detail.component.scss'],
  providers: [
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS],
    },

    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
    { provide: MAT_DATE_FORMATS, useValue: MY_FORMATS },
  ],
})
export class PersonnelDetailComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  subscribing: boolean = true;
  birthday: any;
  data: any;
  personnel_current_data: any = [];
  user_id: any = '';
  waiting = false;
  hr_loading: boolean = true;
  frequency_loading: boolean = true;
  rmssd_loading: boolean = true;
  sdnn_loading: boolean = true;
  hrr_loading: boolean = true;
  day_hrr_loading: boolean = true;
  ctx: any;
  end_date: Date = new Date();
  max_month_date = new Date(); //目前時間
  max_day_date = new Date(); //目前時間

  // frequency
  frequency_day_data: any;
  frequency_week_data: any;
  frequency_month_data: any;

  // hrv
  hrv_day_data: any;
  hrv_week_data: any;
  hrv_month_data: any;

  // hr
  chart_hr: Chart;
  hr_start_time: Date;
  hr_end_time: Date;
  hr_start_max_date: Date = new Date();
  hr_start_min_date: Date;
  hr_end_max_date: Date = new Date();
  hr_end_min_date: Date;
  last_day_hr_mean: any;
  last_month_hr_max: any;
  last_month_hr_min: any;

  //frequency
  frequency_chart: Chart;
  frequency_array: any = [];
  frequency_start_time: Date;
  frequency_end_time: Date;
  frequency_start_max_date: Date = new Date();
  frequency_start_min_date: Date;
  frequency_end_max_date: Date = new Date();
  frequency_end_min_date: Date;
  frequency_month_date = new FormControl(moment());
  frequency_day_date = new FormControl(moment());

  //rmssd
  rmssd_chart: Chart;
  rmssd_array: any = [];
  rmssd_start_time: Date;
  rmssd_end_time: Date;
  rmssd_start_max_date: Date = new Date();
  rmssd_start_min_date: Date;
  rmssd_end_max_date: Date = new Date();
  rmssd_end_min_date: Date;
  rmssd_month_date = new FormControl(moment());
  rmssd_day_date = new FormControl(moment());

  //SDNN
  sdnn_chart: Chart;
  sdnn_array: any = [];
  sdnn_start_time: Date;
  sdnn_end_time: Date;
  sdnn_start_max_date: Date = new Date();
  sdnn_start_min_date: Date;
  sdnn_end_max_date: Date = new Date();
  sdnn_end_min_date: Date;
  sdnn_month_date = new FormControl(moment());
  sdnn_day_date = new FormControl(moment());

  //hrr
  hrr_chart: Chart;
  hrr_array: any = [];
  hrr_start_time: Date;
  hrr_end_time: Date;
  hrr_start_max_date: Date = new Date();
  hrr_start_min_date: Date;
  hrr_end_max_date: Date = new Date();
  hrr_end_min_date: Date;
  hrr_month_date = new FormControl(moment());
  hrr_day_date = new FormControl(moment());

  //day_hrr
  chart_day_hrr: Chart;
  percent_hrr_per_hour_label: any = [];
  percent_hrr_per_hour: any = [];
  percent_hrr_per_hour_sum: any = [];

  //擴展
  expanded = true;
  expanded_hr = false;
  expanded_hr_1 = true;
  expanded_frequency = false;
  expanded_frequency_1 = true;
  expanded_rmssd = false;
  expanded_rmssd_1 = true;
  expanded_sdnn = false;
  expanded_sdnn_1 = true;
  expanded_hrr = false;
  expanded_hrr_1 = true;
  expanded_day_hrr = true;

  constructor(
    private apiService: APIService,
    private http: HttpClient,
    private router: Router
  ) {
    const temp_auth = localStorage.getItem('enter');
    if (temp_auth == 'yes') {
    } else {
      this.router.navigate(['/login']);
    }

    let locationURL = window.location.href;
    this.user_id = locationURL.split('/')[5];
  }

  async ngOnInit() {
    this.personnel_current_data = await this.apiService.getAPI(
      environment.getCurrentData,
      this.user_id
    );

    this.birthday = this.personnel_current_data.birthday
      ? new Date().getFullYear() -
        new Date(parseInt(this.personnel_current_data.birthday)).getFullYear()
      : 40;

    await Promise.all([
      this.query_hrv_data(),
      this.query_percent_hrr_day_data(),
      this.get_hr_data(),
      this.get_hrv_data(),
    ]);

    setTimeout(() => {
      window.location.reload();
    }, 60000);
  }

  ngAfterViewInit() {
    Chart.pluginService.register({
      beforeDraw: function (chart) {
        if (chart.config.options.plugins.annotations) {
          let ctx = chart.ctx;
          let txt = chart.config.options.plugins.annotations.hr;

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = 'Silver';
          ctx.font = '4rem "Noto Sans TC"';
          ctx.fillText(txt, 100, txt < 140 ? 40 : 140);
        }
      },
    });
    this.init_hr_chart();
    this.init_frequency_chart();
    this.init_rmssd_chart();
    this.init_sdnn_chart();
    this.init_hrr_chart();
  }

  ngOnDestroy() {
    this.subscribing = false;
  }

  async init_hr_chart() {
    let data = [],
      labels = [];
    let config = {
      type: 'line',
      scaleID: 'y-axis-0',
      data: {
        labels: labels,
        datasets: [
          {
            pointRadius: 1,
            borderColor: 'Silver',
            data: data,
            fill: false,
            pointDotRadius: 1,
            pointDotStrokeWidth: 8,
            pointHitDetectionRadius: 20,
          },
        ],
      },
      tooltips: {
        mode: 'label', // or 'x-axis'
      },
      options: {
        responsive: true,
        intersect: false,
        maintainAspectRatio: false,
        legend: {
          display: false,
        },
        plugins: {
          annotations: {
            hr: '',
          },
        },
        scales: {
          xAxes: [
            {
              id: 'x-axis',

              display: true,
              gridLines: {
                display: false,
                color: 'Silver',
              },
              ticks: {
                fontColor: 'Silver',
                fontSize: 16,
              },
            },
          ],
          hover: {
            mode: 'nearest',
            intersect: true,
          },
          yAxes: [
            {
              display: true,
              ticks: {
                suggestedMin: 50,
                suggestedMax: 180,
                fontColor: 'Silver',
                fontSize: 16,
              },
              gridLines: {
                display: false,
                color: 'Silver',
              },
            },
          ],
          annotation: {
            annotations: [
              {
                type: 'line',
                mode: 'vertical',
                scaleID: 'x-axis-0',
                value: 120,
                borderColor: 'red',
                label: {
                  content: 'TODAY',
                  enabled: true,
                  position: 'top',
                },
              },
            ],
          },
        },
      },
    };
    let results: any = await this.apiService.getAPI(
      environment.getData,
      this.user_id,
      new Date().setSeconds(-60),
      Date.now()
    );

    if (results) {
      results.forEach((element) => {
        data.push(element.hr);
        let time = format(parseInt(element.timestamp, 10), 'HH:mm:ss');
        labels.push(time);
      });
      this.update_hr_chart();
    }
    this.chart_hr = new Chart('canvas_hr', config);
    this.hr_loading = false;
  }

  init_frequency_chart() {
    /* 
      修訂日期: 20220225
      第一階段: 1 個標準差
      第二階段: 1.25 個標準差 
    */
    const limit = {
      highest: 3.08,
      higher: 2.79,
      lower: 0.47,
      lowest: 0.18,
    };
    let config = {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            yAxisID: 'frequency_left',
            fill: false,
            label: '每 5 分鐘紀錄',
            data: [],
            borderColor: 'orange',
            borderWidth: 1.5,
            hoverBackgroundColor: 'rgba(232,105,90,0.8)',
            hoverBorderColor: 'orange',
            xAxisID: 'time',
            pointRadius: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value <= limit.lower || value >= limit.higher) {
                return 7.5;
              }
            },
            pointBackgroundColor: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value <= limit.lower || value >= limit.higher) {
                return 'transparent';
              } else {
                return '#00FFEF';
              }
            },
            pointBorderColor: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value < limit.lowest || value > limit.highest) {
                return 'red';
              } else if (value <= limit.lower || value >= limit.higher) {
                return 'orange';
              }
            },
            pointBorderWidth: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value <= limit.lower || value >= limit.higher) {
                return 2.5;
              }
            },
          },
          {
            yAxisID: 'frequency_right',
            data: [],
          },
          {
            fill: false,
            pointStyle: 'line',
            label: '前日平均',
            data: [],
            borderColor: '#CCCC4D',
            borderWidth: 2,
            xAxisID: 'date',
          },
          {
            fill: false,
            pointStyle: 'line',
            label: '前週平均',
            data: [],
            borderColor: '#9ACD32',
            borderWidth: 2,
            xAxisID: 'date',
          },
          {
            fill: false,
            pointStyle: 'line',
            label: '前月平均',
            data: [],
            borderColor: '#66CDAA',
            borderWidth: 2,
            xAxisID: 'date',
          },
        ],
      },
      options: {
        animation: { duration: 0 },
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          labels: {
            fontColor: 'Silver',
            fontSize: 18,
            filter: function (legendItem, chartData) {
              if (legendItem.datasetIndex === 1) {
                return false;
              } else {
                return true;
              }
            },
          },
        },
        scales: {
          yAxes: [
            {
              id: 'frequency_left',
              ticks: {
                fontColor: 'Silver',
                fontSize: 18,
                beginAtZero: true,
                max: 4,
                min: 0,
                stepSize: 0.5,
                autoSkip: false,
              },
              scaleLabel: {
                fontColor: 'Silver',
                fontSize: 18,
                display: true,
                labelString: 'LF / HF ( % )',
              },
              position: 'left',
            },
            {
              id: 'frequency_right',
              ticks: {
                fontColor: 'Silver',
                fontSize: 16,
                beginAtZero: true,
                max: 4,
                min: 0,
                stepSize: 0.01,
                autoSkip: false,
                callback: function (label, index, labels) {
                  if (label === limit.highest) {
                    return '▲緊張';
                  } else if (label === limit.higher) {
                    return '▲亢奮';
                  } else if (label === limit.lower) {
                    return '▼疲勞';
                  } else if (label === limit.lowest) {
                    return '▼過勞';
                  }
                },
              },
              gridLines: {
                display: false,
              },
              position: 'right',
            },
          ],
          xAxes: [
            {
              id: 'time',
              type: 'time',
              ticks: {
                fontColor: 'Silver',
                fontSize: 14,
              },
              scaleLabel: {
                fontColor: 'Silver',
                fontSize: 18,
                display: true,
                labelString: '時間',
              },
              time: {
                parser: false,
                tooltipFormat: 'HH:mm',
                unit: 'minute',
                stepSize: 5,
                displayFormats: {
                  minute: 'HH:mm',
                  hour: 'HH:mm',
                },
                round: 'minute',
              },
            },
            {
              id: 'date',
              position: 'top',
              ticks: {
                fontColor: 'Silver',
                fontSize: 14,
                beginAtZero: true,
              },
              labels: [],
            },
          ],
        },
      },
      plugins: [
        {
          beforeDraw: function (chart) {
            const ctx = chart.chart.ctx;
            const yaxis = chart.chart.scales['frequency_right'];
            const xaxis = chart.chart.scales['time'];
            const max = yaxis.end;
            const one_unit = (1 / yaxis.end) * yaxis.height;
            const lowest_limit = {
              height: one_unit * limit.lowest,
              color: '#003153',
            };
            const lower_limit = {
              height: one_unit * (limit.lower - limit.lowest),
              color: '#00477D',
            };
            const normal_range = {
              height: one_unit * (limit.higher - limit.lower),
              color: '#006374',
            };
            const higher_limit = {
              height: one_unit * (limit.highest - limit.higher),
              color: '#00477D',
            };
            const highest_limit = {
              height:
                yaxis.height -
                higher_limit.height -
                lowest_limit.height -
                lower_limit.height -
                normal_range.height,
              color: '#003153',
            };
            const levels = [
              highest_limit,
              higher_limit,
              normal_range,
              lower_limit,
              lowest_limit,
            ];
            let accumulator = yaxis.top;
            for (let level of levels) {
              ctx.fillStyle = level.color;
              ctx.fillRect(xaxis.left, accumulator, xaxis.width, level.height);
              accumulator += level.height;
            }
          },
        },
      ],
    };

    this.frequency_chart = new Chart('canvas_frequency', config);
    this.ctx = this.frequency_chart.ctx;
  }

  init_rmssd_chart() {
    /* 
      修訂日期: 20220225
      第一階段: 1.25 個標準差
      第二階段: 1.5 個標準差 
    */
    const limit = {
      mid: 8.21,
      low: 2.67,
    };
    let config = {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            yAxisID: 'rmssd_left',
            fill: false,
            label: '每 5 分鐘平均',
            data: [],
            borderColor: 'orange',
            borderWidth: 1.5,
            hoverBackgroundColor: 'rgba(232,105,90,0.8)',
            hoverBorderColor: 'orange',
            xAxisID: 'time',
            pointRadius: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value <= limit.mid) {
                return 7.5;
              }
            },
            pointBackgroundColor: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value <= limit.mid) {
                return 'transparent';
              } else {
                return '#00FFEF';
              }
            },
            pointBorderColor: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value < limit.low) {
                return 'red';
              } else if (value <= limit.mid) {
                return 'orange';
              }
            },
            pointBorderWidth: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value <= limit.mid) {
                return 2.5;
              }
            },
          },
          {
            yAxisID: 'rmssd_right',
            data: [],
          },
          {
            fill: false,
            pointStyle: 'line',
            label: '前日平均',
            data: [],

            borderColor: '#CCCC4D',
            borderWidth: 2,
            xAxisID: 'date',
          },
          {
            fill: false,
            pointStyle: 'line',
            label: '前週平均',
            data: [],
            borderColor: '#9ACD32',
            borderWidth: 2,
            xAxisID: 'date',
          },
          {
            fill: false,
            pointStyle: 'line',
            label: '前月平均',
            data: [],
            borderColor: '#66CDAA',
            borderWidth: 2,
            xAxisID: 'date',
          },
        ],
      },
      options: {
        animation: { duration: 0 },
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          labels: {
            fontColor: 'Silver',
            fontSize: 18,
            filter: function (legendItem, chartData) {
              if (legendItem.datasetIndex === 1) {
                return false;
              } else {
                return true;
              }
            },
          },
        },
        scales: {
          yAxes: [
            {
              id: 'rmssd_left',
              ticks: {
                fontColor: 'Silver',
                fontSize: 18,
                beginAtZero: true,
                max: 100,
                min: 0,
                stepSize: 10,
              },
              scaleLabel: {
                fontColor: 'Silver',
                fontSize: 18,
                display: true,
                labelString: 'RMSSD',
              },
              position: 'left',
            },
            {
              id: 'rmssd_right',
              ticks: {
                fontColor: 'Silver',
                fontSize: 16,
                beginAtZero: true,
                max: 100,
                min: 0,
                stepSize: 0.01,
                autoSkip: false,
                callback: function (label, index, labels) {
                  if (label === limit.low) {
                    return '▼過勞';
                  } else if (label === limit.mid) {
                    return '▼疲勞';
                  }
                },
              },
              gridLines: {
                display: false,
              },
              position: 'right',
            },
          ],
          xAxes: [
            {
              id: 'time',
              type: 'time',
              ticks: {
                fontColor: 'Silver',
                fontSize: 14,
              },
              scaleLabel: {
                fontColor: 'Silver',
                fontSize: 18,
                display: true,
                labelString: '時間',
              },
              time: {
                parser: false,
                tooltipFormat: 'HH:mm',
                unit: 'minute',
                stepSize: 5,
                displayFormats: {
                  minute: 'HH:mm',
                  hour: 'HH:mm',
                },
                round: 'minute',
              },
            },
            {
              id: 'date',
              position: 'top',
              ticks: {
                fontColor: 'Silver',
                fontSize: 14,
                beginAtZero: true,
              },
              labels: [],
            },
          ],
        },
      },
      plugins: [
        {
          beforeDraw: function (chart) {
            const ctx = chart.chart.ctx;
            const yaxis = chart.chart.scales['rmssd_left'];
            const xaxis = chart.chart.scales['time'];
            const max = yaxis.end;
            const one_unit = (1 / yaxis.end) * yaxis.height;
            const mid_limit = {
              height: one_unit * (limit.mid - limit.low),
              color: '#00477D',
            };
            const low_limit = {
              height: one_unit * limit.low,
              color: '#003153',
            };
            const margin = {
              height: yaxis.height - mid_limit.height - low_limit.height,
              color: '#006374',
            };
            const levels = [margin, mid_limit, low_limit];
            let accumulator = yaxis.top;
            for (let level of levels) {
              ctx.fillStyle = level.color;
              ctx.fillRect(xaxis.left, accumulator, xaxis.width, level.height);
              accumulator += level.height;
            }
          },
        },
      ],
    };

    this.rmssd_chart = new Chart('canvas_rmssd', config);
    this.ctx = this.rmssd_chart.ctx;
  }

  init_sdnn_chart() {
    /* 
      修訂日期: 20220301
      第一階段: 2 個標準差
      第二階段: 2.25 個標準差 
    */
    const limit = {
      mid: 8.67,
      low: 4.25,
    };
    let config = {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            yAxisID: 'sdnn_left',
            fill: false,
            label: '每 5 分鐘平均',
            data: [],
            borderColor: 'orange',
            borderWidth: 1.5,
            hoverBackgroundColor: 'rgba(232,105,90,0.8)',
            hoverBorderColor: 'orange',
            xAxisID: 'time',
            pointRadius: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value <= limit.mid) {
                return 7.5;
              }
            },
            pointBackgroundColor: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value <= limit.mid) {
                return 'transparent';
              } else {
                return '#00FFEF';
              }
            },
            pointBorderColor: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value <= limit.low) {
                return 'red';
              } else if (value <= limit.mid) {
                return 'orange';
              }
            },
            pointBorderWidth: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value <= limit.mid) {
                return 2.5;
              }
            },
          },
          {
            yAxisID: 'sdnn_right',
            data: [],
          },
          {
            fill: false,
            pointStyle: 'line',
            label: '前日平均',
            data: [],
            borderColor: '#CCCC4D',
            borderWidth: 2,
            xAxisID: 'date',
          },
          {
            fill: false,
            pointStyle: 'line',
            label: '前週平均',
            data: [],
            borderColor: '#9ACD32',
            borderWidth: 2,
            xAxisID: 'date',
          },
          {
            fill: false,
            pointStyle: 'line',
            label: '前月平均',
            data: [],
            borderColor: '#66CDAA',
            borderWidth: 2,
            xAxisID: 'date',
          },
        ],
      },

      options: {
        animation: { duration: 0 },
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          labels: {
            fontColor: 'Silver',
            fontSize: 18,
            filter: function (legendItem, chartData) {
              if (legendItem.datasetIndex === 1) {
                return false;
              } else {
                return true;
              }
            },
          },
        },
        scales: {
          yAxes: [
            {
              id: 'sdnn_left',
              ticks: {
                fontColor: 'Silver',
                fontSize: 18,
                beginAtZero: true,
                max: 100,
                min: 0,
                stepSize: 10,
              },
              scaleLabel: {
                fontColor: 'Silver',
                fontSize: 18,
                display: true,
                labelString: 'SDNN',
              },
              position: 'left',
            },
            {
              id: 'sdnn_right',
              ticks: {
                fontColor: 'Silver',
                fontSize: 16,
                beginAtZero: true,
                max: 100,
                min: 0,
                stepSize: 0.01,
                autoSkip: false,

                callback: function (label, index, labels) {
                  if (label === limit.low) {
                    return '▼過勞';
                  } else if (label === limit.mid) {
                    return '▼疲勞';
                  }
                },
              },
              gridLines: {
                display: false,
              },
              position: 'right',
            },
          ],
          xAxes: [
            {
              id: 'time',
              type: 'time',
              ticks: {
                fontColor: 'Silver',
                fontSize: 14,
              },
              scaleLabel: {
                fontColor: 'Silver',
                fontSize: 18,
                display: true,
                labelString: '時間',
              },
              time: {
                parser: false,
                tooltipFormat: 'HH:mm',
                unit: 'minute',
                stepSize: 5,
                displayFormats: {
                  minute: 'HH:mm',
                  hour: 'HH:mm',
                },
                round: 'minute',
              },
            },
            {
              id: 'date',
              position: 'top',
              ticks: {
                fontColor: 'Silver',
                fontSize: 14,
                beginAtZero: true,
              },
              labels: [],
            },
          ],
        },
      },
      plugins: [
        {
          beforeDraw: function (chart) {
            const ctx = chart.chart.ctx;
            const yaxis = chart.chart.scales['sdnn_left'];
            const xaxis = chart.chart.scales['time'];
            const max = yaxis.end;
            const one_unit = (1 / yaxis.end) * yaxis.height;
            const mid_limit = {
              height: one_unit * (limit.mid - limit.low),
              color: '#00477D',
            };
            const low_limit = {
              height: one_unit * limit.low,
              color: '#003153',
            };
            const margin = {
              height: yaxis.height - mid_limit.height - low_limit.height,
              color: '#006374',
            };
            const levels = [margin, mid_limit, low_limit];
            let accumulator = yaxis.top;
            for (let level of levels) {
              ctx.fillStyle = level.color;
              ctx.fillRect(xaxis.left, accumulator, xaxis.width, level.height);
              accumulator += level.height;
            }
          },
        },
      ],
    };

    this.sdnn_chart = new Chart('canvas_sdnn', config);
    this.ctx = this.sdnn_chart.ctx;
  }

  init_hrr_chart() {
    const limit = {
      moderate: 40,
      hard: 60,
    };
    let config = {
      type: 'line',
      data: {
        labels: [],
        datasets: [
          {
            yAxisID: 'hrr_left',
            fill: false,
            label: '每 5 分鐘平均',
            data: [],
            borderColor: 'orange',
            borderWidth: 1.5,
            hoverBackgroundColor: 'rgba(232,105,90,0.8)',
            hoverBorderColor: 'orange',
            xAxisID: 'time',
            pointRadius: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value >= limit.moderate) {
                return 7.5;
              }
            },
            pointBackgroundColor: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value >= limit.moderate) {
                return 'transparent';
              } else {
                return '#00FFEF';
              }
            },
            pointBorderColor: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value >= limit.hard) {
                return 'red';
              } else if (value >= limit.moderate) {
                return 'orange';
              }
            },
            pointBorderWidth: (context) => {
              let index = context.dataIndex;
              let value = context.dataset.data[index];
              if (value >= limit.moderate) {
                return 2.5;
              }
            },
          },
          {
            yAxisID: 'hrr_right',
            data: [],
          },
          {
            fill: false,
            pointStyle: 'line',
            label: '前日平均',
            data: [],
            borderColor: '#CCCC4D',
            borderWidth: 2,
            xAxisID: 'date',
          },
          {
            fill: false,
            pointStyle: 'line',
            label: '前週平均',
            data: [],
            borderColor: '#9ACD32',
            borderWidth: 2,
            xAxisID: 'date',
          },
          {
            fill: false,
            pointStyle: 'line',
            label: '前月平均',
            data: [],
            borderColor: '#66CDAA',
            borderWidth: 2,
            xAxisID: 'date',
          },
        ],
      },

      options: {
        animation: { duration: 0 },
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          labels: {
            fontColor: 'Silver',
            fontSize: 18,
            filter: function (legendItem, chartData) {
              if (legendItem.datasetIndex === 1) {
                return false;
              } else {
                return true;
              }
            },
          },
        },
        scales: {
          yAxes: [
            {
              id: 'hrr_left',
              ticks: {
                fontColor: 'Silver',
                fontSize: 18,
                beginAtZero: true,
                max: 100,
                min: 0,
                stepSize: 10,
              },
              scaleLabel: {
                fontColor: 'Silver',
                fontSize: 18,
                display: true,
                labelString: '%HRR',
              },
              position: 'left',
            },
            {
              id: 'hrr_right',
              ticks: {
                fontColor: 'Silver',
                fontSize: 16,
                beginAtZero: true,
                max: 100,
                min: 0,
                stepSize: 10,
                callback: function (label, index, labels) {
                  if (label === limit.hard) {
                    return '▲過勞';
                  } else if (label === limit.moderate) {
                    return '▲疲勞';
                  }
                },
              },
              position: 'right',
            },
          ],
          xAxes: [
            {
              id: 'time',
              type: 'time',
              ticks: {
                fontColor: 'Silver',
                fontSize: 14,
              },
              scaleLabel: {
                fontColor: 'Silver',
                fontSize: 18,
                display: true,
                labelString: '時間',
              },
              time: {
                parser: false,
                tooltipFormat: 'HH:mm',
                unit: 'minute',
                stepSize: 5,
                displayFormats: {
                  minute: 'HH:mm',
                  hour: 'HH:mm',
                },
                round: 'minute',
              },
            },
            {
              id: 'date',
              position: 'top',
              ticks: {
                fontColor: 'Silver',
                fontSize: 14,
                beginAtZero: true,
              },
              labels: [],
            },
          ],
        },
      },
      plugins: [
        {
          beforeDraw: function (chart) {
            const ctx = chart.chart.ctx;
            const yaxis = chart.chart.scales['hrr_left'];
            const xaxis = chart.chart.scales['time'];
            const max = yaxis.end;
            const one_unit = (10 / yaxis.end) * yaxis.height;
            const hard_limit = { height: one_unit * 4, color: '#003153' };
            const moderate_limit = { height: one_unit * 2, color: '#00477D' };
            const normal_range = {
              height: yaxis.height - hard_limit.height - moderate_limit.height,
              color: '#006374',
            };
            const levels = [hard_limit, moderate_limit, normal_range];
            let accumulator = yaxis.top;
            for (let level of levels) {
              ctx.fillStyle = level.color;
              ctx.fillRect(xaxis.left, accumulator, xaxis.width, level.height);
              accumulator += level.height;
            }
          },
        },
      ],
    };
    this.hrr_chart = new Chart('canvas_hrr', config);
    this.ctx = this.hrr_chart.ctx;
  }

  init_hrr_day_chart() {
    let config = {
      type: 'bar',
      data: {
        labels: this.percent_hrr_per_hour_label,

        datasets: [
          {
            yAxisID: 'A',
            fill: false,
            label: '負荷累計',
            data: this.percent_hrr_per_hour_sum,
            borderWidth: 3,
            borderColor: 'orange',
            backgroundColor: 'orange',
            fontColor: 'Silver',
            pointRadius: 5,
            type: 'line',
          },
          {
            yAxisID: 'B',
            fill: false,
            label: '每小時平均',
            data: this.percent_hrr_per_hour,
            borderColor: 'Silver',
            backgroundColor: '#00FFEF',
            fontColor: 'Silver',
            pointRadius: 5,
            barPercentage: 0.5,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        legend: {
          labels: {
            fontColor: 'Silver',
            fontSize: 18,
          },
        },
        scales: {
          yAxes: [
            {
              id: 'A',
              ticks: {
                display: true,
                fontColor: 'Silver',
                fontSize: 16,
                suggestedMin: 0,
                suggestedMax: 100,
                // mirror: true,
              },
              gridLines: {
                display: false,
                color: 'Silver',
              },
              scaleLabel: {
                fontColor: 'Silver',
                fontSize: 18,
                display: false,
                labelString: '%HRR',
              },
              position: 'right',
            },
            {
              id: 'B',
              ticks: {
                display: true,
                fontColor: 'Silver',
                fontSize: 16,
                suggestedMin: 0,
                suggestedMax: 100,
                // mirror: true,
              },
              gridLines: {
                display: false,
                color: 'Silver',
              },
              scaleLabel: {
                fontColor: 'Silver',
                fontSize: 18,
                display: true,
                labelString: '累計 %HRR',
              },
              position: 'left',
            },
          ],
          xAxes: [
            {
              ticks: {
                fontColor: 'Silver',
                fontSize: 14,
                beginAtZero: true,
              },
              scaleLabel: {
                fontColor: 'Silver',
                fontSize: 18,
                display: true,
                labelString: '時間 ( 整點 )',
              },
              gridLines: {
                display: false,
                color: 'Silver',
              },
            },
          ],
        },
      },
    };
    this.chart_day_hrr = new Chart('canvas_day_hrr', config);
    this.ctx = this.chart_day_hrr.ctx;
  }

  async get_hr_data() {
    const hr_day_data: any = await this.apiService.getAPI(
      environment.getLatest1DayHr,
      this.user_id,
      new Date().setHours(0, 0, 0, 0),
      Date.now()
    );
    this.last_day_hr_mean = hr_day_data ? hr_day_data.mean_hr : null;

    const hr_month_data: any = await this.apiService.getAPI(
      environment.getLatest1MonthHr,
      this.user_id,
      new Date(new Date().setDate(1)).setHours(0, 0, 0, 0),
      Date.now()
    );
    this.last_month_hr_max = hr_month_data ? hr_month_data.max_hr : null;
    this.last_month_hr_min = hr_month_data ? hr_month_data.min_hr : null;
  }

  async get_hrv_data() {
    const hrv_interval_array = [
      {
        interval: 'day',
        data: this.hrv_day_data,
        resource: environment.getLatest1DayHrv,
        start_time: new Date().setHours(0, 0, 0, 0),
      },
      {
        interval: 'week',
        data: this.hrv_week_data,
        resource: environment.getLatest1WeekHrv,
        start_time: new Date(
          new Date().setDate(
            new Date().getDate() - ((new Date().getDay() + 6) % 7)
          )
        ).setHours(0, 0, 0, 0),
      },
      {
        interval: 'month',
        data: this.hrv_month_data,
        resource: environment.getLatest1MonthHrv,
        start_time: new Date(new Date().setDate(1)).setHours(0, 0, 0, 0),
      },
    ];

    for await (let hrv_interval of hrv_interval_array) {
      hrv_interval.data = await this.apiService.getAPI(
        hrv_interval.resource,
        this.user_id,
        hrv_interval.start_time,
        Date.now()
      );

      if (hrv_interval.data) {
        this.update_hrv_chart(hrv_interval.interval, hrv_interval.data);
      } else {
        hrv_interval.data = null;
      }
    }
  }

  query_hrv_data() {
    timer(0, 300000).subscribe(async () => {
      this.data = await this.apiService.getAPI(
        environment.get5MinuteHrv,
        this.user_id,
        new Date().setHours(
          new Date().getHours() - 1,
          new Date().getMinutes(),
          0,
          0
        ),
        Date.now()
      );

      if (this.data.length > 0) {
        const hrr_array = [];
        const rmssd_array = [];
        const sdnn_array = [];
        const frequency_array = [];
        const five_minute_label_array = [];

        for (let data of this.data) {
          hrr_array.push(data.hrr);
          rmssd_array.push(data.rmssd);
          sdnn_array.push(data.sdnn);
          frequency_array.push(data.frequency);
          five_minute_label_array.push(parseInt(data.timestamp, 10));
        }

        const one_min = 60000;
        const five_min = one_min * 5;
        const current_timestamp =
          Math.floor(five_minute_label_array[0] / 10000) * 10000;
        const time_gap = current_timestamp % five_min;

        if (time_gap > 0) {
          const compensation = (five_min - time_gap) / one_min;

          for (let i = 1; i <= compensation; i++) {
            hrr_array.shift();
            rmssd_array.shift();
            sdnn_array.shift();
            frequency_array.shift();
            five_minute_label_array.shift();
          }
        }

        const chart_array = [
          { chart: this.hrr_chart, data: hrr_array, name: 'hrr' },
          { chart: this.rmssd_chart, data: rmssd_array, name: 'rmssd' },
          { chart: this.sdnn_chart, data: sdnn_array, name: 'sdnn' },
          {
            chart: this.frequency_chart,
            data: frequency_array,
            name: 'frequency',
          },
        ];

        if (five_minute_label_array.length > 0) {
          chart_array.forEach((chart) => {
            this.update_five_min_hrv_chart(
              chart.chart,
              chart.data,
              five_minute_label_array
            );
          });
        }
      }

      ['frequency', 'rmssd', 'sdnn', 'hrr'].forEach((chart) => {
        this[`${chart}_loading`] = false;
      });
    });
  }

  async query_percent_hrr_day_data() {
    // 取得日間(7:00 - 19:00) Hrr 每小時數據
    let all_data: any = await this.apiService.getAPI(
      environment.get1HourHrv,
      this.user_id,
      new Date().setHours(7, 0, 0, 0),
      new Date().setHours(19, 0, 0, 0)
    );

    this.percent_hrr_per_hour_label = [];
    this.percent_hrr_per_hour_sum = [];
    this.percent_hrr_per_hour = [];
    let sum: number = 0;

    all_data.forEach((data) => {
      this.percent_hrr_per_hour_label.push(
        new Date(parseInt(data['timestamp'])).getHours()
      );
      this.percent_hrr_per_hour.push(data['hrr']);
      sum += data['hrr'];
      this.percent_hrr_per_hour_sum.push(sum.toFixed(0));
    });

    this.init_hrr_day_chart();
    this.day_hrr_loading = false;
  }

  update_hr_chart() {
    //let hp_count;
    timer(1000, 2000)
      .pipe(takeWhile(() => this.subscribing))
      .subscribe(async () => {
        let current_data: any = await this.apiService.getAPI(
          environment.getCurrentData,
          this.user_id
        );

        if (this.chart_hr.data.labels.length >= 60) {
          this.chart_hr.data.labels.shift();
          this.chart_hr.data.datasets[0].data.shift();
        }

        const hr = current_data['hr'];
        const time = format(parseInt(current_data['timestamp']), 'HH:mm:ss');

        if (hr > 0 && this.chart_hr.data.labels.indexOf(time) === -1) {
          this.chart_hr.data.labels.push(time);
          this.chart_hr.data.datasets[0].data.push(hr);
          this.chart_hr.config.options.plugins.annotations.hr = hr;
          this.chart_hr.update();
        }
      });
  }

  update_five_min_hrv_chart(
    chart,
    five_minute_data_array,
    five_minute_label_array,
    label_type = 'minute'
  ) {
    this.ctx = chart.ctx;
    const gradient = this.ctx.createLinearGradient(0, 0, 0, 400);
    // gradient.addColorStop(0, '#003153');
    // gradient.addColorStop(0.2, '#00477D');
    // gradient.addColorStop(0.4, '#006374');
    // gradient.addColorStop(0.6, '#00808C	');
    // gradient.addColorStop(0.8, '#00CED1');
    // gradient.addColorStop(1, '#00FFEF	');

    chart.config.data.datasets[0].backgroundColor = gradient;
    chart.config.data.datasets[0].data = five_minute_data_array;
    chart.config.data.datasets[1].data = five_minute_data_array;
    chart.config.data.labels = five_minute_label_array;
    switch (label_type) {
      case 'day':
        chart.config.options.scales.xAxes[0].time =
          chart.config.options.scales.xAxes[0].time = {
            parser: false,
            tooltipFormat: 'MMDD',
            unit: 'day',
            stepSize: 1,
            displayFormats: {
              day: 'MMDD',
            },
            round: 'day',
          };
        break;
      case 'hour':
        chart.config.options.scales.xAxes[0].time =
          chart.config.options.scales.xAxes[0].time = {
            parser: false,
            tooltipFormat: 'HH:mm',
            unit: 'hour',
            stepSize: 1,
            displayFormats: {
              minute: 'HH:mm',
              hour: 'HH:mm',
            },
            round: 'hour',
          };
        break;
      default:
        chart.config.options.scales.xAxes[0].time = {
          parser: false,
          tooltipFormat: 'HH:mm',
          unit: 'minute',
          stepSize: 5,
          displayFormats: {
            minute: 'HH:mm',
            hour: 'HH:mm',
          },
          round: 'minute',
        };
    }

    chart.update();
  }

  update_hrv_chart(interval: string, data_obj: any) {
    let interval_obj = { day: 2, week: 3, month: 4 };
    let chart_obj = {
      hrr: this.hrr_chart,
      rmssd: this.rmssd_chart,
      sdnn: this.sdnn_chart,
      frequency: this.frequency_chart,
    };
    Object.keys(chart_obj).forEach((chart_name) => {
      let chart = chart_obj[chart_name];

      Object.assign(chart.config.options.scales.xAxes[1].labels, ['', '']);
      Object.assign(chart.config.data.datasets[interval_obj[interval]].data, [
        data_obj[chart_name],
        data_obj[chart_name],
      ]);
      chart.update();
    });
  }

  change_status(data_name: string) {
    if (data_name === 'hr') {
      this.subscribing = !this.subscribing;
      this.init_hr_chart();
    }
    this[`${data_name}_subscribing`] = !this[`${data_name}_subscribing`];
    this.query_hrv_data();
    this[`init_${data_name}_chart`]();
  }

  async search_hr() {
    this.subscribing = false;
    this.hr_loading = true;
    let all_data: any = await this.apiService.getAPI(
      environment.get5MinuteHr,
      this.user_id,
      Date.parse(String(this.hr_start_time)),
      Date.parse(String(this.hr_end_time))
    );
    if (all_data) {
      let all_data_keys = [];
      let all_data_values = [];

      all_data.forEach((data) => {
        let hour: string = String(
          new Date(parseInt(data['timestamp'])).getHours()
        );
        hour = parseInt(hour) < 10 ? `0${hour}` : hour;
        let minute: string = String(
          new Date(parseInt(data['timestamp'])).getMinutes()
        );
        minute = parseInt(minute) < 10 ? `0${minute}` : minute;
        let time = `${hour}:${minute}`;

        all_data_keys.push(time);
        all_data_values.push(data['mean_hr']);
      });

      let max = Math.max.apply(
        null,
        all_data_values.map(function (o) {
          return o;
        })
      );

      let min = Math.min.apply(
        null,
        all_data_values.map(function (o) {
          return o;
        })
      );

      this.chart_hr.data.labels = all_data_keys;
      this.chart_hr.data.datasets[0].data = all_data_values;
      this.chart_hr.config.options.plugins.annotations.hr = '';
      this.chart_hr.config.options.scales.yAxes[0].ticks.suggestedMax = max;
      this.chart_hr.config.options.scales.yAxes[0].ticks.suggestedMin = min;
      this.chart_hr.update();
    }
    this.hr_loading = false;
  }

  async export_hr() {
    this.waiting = true;

    let all_data: any = await this.apiService.getAPI(
      environment.getData,
      this.user_id,
      Date.parse(String(this.hr_start_time)),
      Date.parse(String(this.hr_end_time))
    );

    let all_data_keys = [];
    let all_data_values = [];

    all_data.forEach((data) => {
      let hour: string = String(
        new Date(parseInt(data['timestamp'])).getHours()
      );
      hour = parseInt(hour) < 10 ? `0${hour}` : hour;
      let minute: string = String(
        new Date(parseInt(data['timestamp'])).getMinutes()
      );
      minute = parseInt(minute) < 10 ? `0${minute}` : minute;
      let second: string = String(
        new Date(parseInt(data['timestamp'])).getSeconds()
      );
      second = parseInt(second) < 10 ? `0${second}` : second;
      let time = `${hour}:${minute}:${second}`;

      all_data_keys.push(time);
      all_data_values.push(data['hr']);
    });

    let results = [];
    for (let i = 0; i < all_data_keys.length; i++) {
      if (all_data_values[i] != 0) {
        results.push({
          time: all_data_keys[i],
          hr: Math.floor(all_data_values[i]),
          RRi: Math.floor(60000 / all_data_values[i]),
        });
      }
    }
    const res = new Map();
    results = results
      .reverse()
      .filter((result) => !res.has(result.time) && res.set(result.time, 1))
      .reverse();
    let csv = unparse({
      fields: ['time', 'hr', 'RRi'],
      data: results,
    });
    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    let file_name = `${this.personnel_current_data.name}_${format(
      new Date(this.hr_start_time),
      'MMDD-HHmm'
    )}_${format(this.hr_end_time, 'MMDD-HHmm')}.csv`;
    saveAs(blob, file_name);
    this.waiting = false;
  }

  async search_month(data_name: string) {
    let index = 1;
    do {
      this[`${data_name}_chart`].data.datasets[index].showLine = false;
      this[`${data_name}_chart`].data.datasets[index].radius = 0;
      index++;
    } while (index <= 3);

    this[`${data_name}_loading`] = true;
    this[`${data_name}_array`] = [];
    this[`${data_name}_array_label`] = [];
    let get_timestamp;

    let temp_month = new Date(
      this[`${data_name}_month_date`]['value']['_d']
    ).getMonth();
    let month_start_time = new Date(
      new Date().setMonth(temp_month, 1)
    ).setHours(0, 0, 0, 0);
    let month_end_time = new Date(
      new Date().setMonth(temp_month + 1, 1)
    ).setHours(0, 0, 0, 0);

    let all_data: any = await this.apiService.getAPI(
      environment.get1DayHrv,
      this.user_id,
      month_start_time,
      month_end_time
    );

    if (all_data.length > 0) {
      all_data.forEach((data) => {
        this[`${data_name}_array`].push(data[`${data_name}`]);
        this[`${data_name}_array_label`].push(parseInt(data['timestamp']));
      });

      this.update_five_min_hrv_chart(
        this[`${data_name}_chart`],
        this[`${data_name}_array`],
        this[`${data_name}_array_label`],
        'day'
      );
    }

    this[`${data_name}_loading`] = false;
  }

  async export_month(data_name: string) {
    this.waiting = true;

    let temp_month = new Date(
      this[`${data_name}_month_date`]['value']['_d']
    ).getMonth();
    let month_start_time = new Date(
      new Date().setMonth(temp_month, 1)
    ).setHours(0, 0, 0, 0);
    let month_end_time = new Date(
      new Date().setMonth(temp_month + 1, 1)
    ).setHours(0, 0, 0, 0);

    let results = [];
    let all_data: any = await this.apiService.getAPI(
      environment.get1DayHrv,
      this.user_id,
      month_start_time,
      month_end_time
    );

    if (all_data.length > 0) {
      all_data.forEach((data) => {
        let get_timestamp = new Date(parseInt(data['timestamp']));
        let get_month = get_timestamp.getMonth() + 1;
        let get_date = get_timestamp.getDate();

        let time = `${get_month} / ${get_date}`;
        results.push({
          time: time,
          RMSSD: data['rmssd'],
          SDNN: data['sdnn'],
          HRR: data['hrr'],
          'LF/HF': data['frequency'],
        });
      });
    }

    let csv = unparse({
      fields: ['time', 'RMSSD', 'SDNN', 'HRR', 'LF/HF'],
      data: results,
    });
    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    let file_name = `${this.personnel_current_data.name}_${format(
      month_start_time,
      'YYYYMM'
    )}_RMSSD_SDNN_HRR_LFHF.csv`;
    saveAs(blob, file_name);

    this.waiting = false;
  }

  async search_day(data_name: string) {
    let index = 1;
    do {
      this[`${data_name}_chart`].data.datasets[index].showLine = false;
      this[`${data_name}_chart`].data.datasets[index].radius = 0;
      index++;
    } while (index <= 3);

    this[`${data_name}_loading`] = true;
    this[`${data_name}_array`] = [];
    this[`${data_name}_array_label`] = [];

    let day_start_time = new Date(
      this[`${data_name}_day_date`]['value']
    ).setHours(0, 0, 0, 0);
    let day_end_time = new Date(
      this[`${data_name}_day_date`]['value']
    ).getTime();

    let all_data: any = await this.apiService.getAPI(
      environment.get1HourHrv,
      this.user_id,
      day_start_time,
      day_end_time
    );

    if (all_data.length > 0) {
      all_data.forEach((data) => {
        this[`${data_name}_array`].push(data[`${data_name}`]);
        this[`${data_name}_array_label`].push(parseInt(data['timestamp']));
      });
      this.update_five_min_hrv_chart(
        this[`${data_name}_chart`],
        this[`${data_name}_array`],
        this[`${data_name}_array_label`],
        'hour'
      );
    }

    this[`${data_name}_loading`] = false;
  }

  async export_day(data_name: string) {
    this.waiting = true;

    let day_start_time = new Date(
      this[`${data_name}_day_date`]['value']
    ).setHours(0, 0, 0, 0);
    let day_end_time = new Date(
      this[`${data_name}_day_date`]['value']
    ).getTime();

    let results = [];
    let all_data: any = await this.apiService.getAPI(
      environment.get1HourHrv,
      this.user_id,
      day_start_time,
      day_end_time
    );

    if (all_data.length > 0) {
      all_data.forEach((data) => {
        let current_time = new Date(parseInt(data['timestamp']));
        let current_hour =
          current_time.getHours() < 10
            ? `0${current_time.getHours().toString()}`
            : current_time.getHours().toString();

        let time = `${current_hour}:00`;
        results.push({
          time: time,
          RMSSD: data['rmssd'],
          SDNN: data['sdnn'],
          HRR: data['hrr'],
          'LF/HF': data['frequency'],
        });
      });
    }

    let csv = unparse({
      fields: ['time', 'RMSSD', 'SDNN', 'HRR', 'LF/HF'],
      data: results,
    });
    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    let file_name = `${this.personnel_current_data.name}_${format(
      day_start_time,
      'YYYYMMDD'
    )}-Day_RMSSD_SDNN_HRR_LFHF.csv`;
    saveAs(blob, file_name);
    this.waiting = false;
  }

  async search_time(data_name: string) {
    let index = 1;
    do {
      this[`${data_name}_chart`].data.datasets[index].showLine = false;
      this[`${data_name}_chart`].data.datasets[index].radius = 0;
      index++;
    } while (index <= 3);

    this[`${data_name}_loading`] = true;
    this[`${data_name}_array`] = [];
    this[`${data_name}_array_label`] = [];

    let all_data: any = await this.apiService.getAPI(
      environment.get5MinuteHrv,
      this.user_id,
      Date.parse(this[`${data_name}_start_time`]),
      Date.parse(this[`${data_name}_end_time`])
    );

    if (all_data.length > 0) {
      all_data.forEach((data) => {
        this[`${data_name}_array`].push(data[`${data_name}`]);
        this[`${data_name}_array_label`].push(parseInt(data['timestamp']));
      });
      const one_min = 60000;
      const five_min = one_min * 5;
      const current_timestamp =
        Math.floor(this[`${data_name}_array_label`][0] / 10000) * 10000;
      const time_gap = current_timestamp % five_min;

      if (time_gap > 0) {
        const compensation = (five_min - time_gap) / one_min;

        for (let i = 1; i <= compensation; i++) {
          this[`${data_name}_array`].shift();
          this[`${data_name}_array_label`].shift();
        }
      }

      this.update_five_min_hrv_chart(
        this[`${data_name}_chart`],
        this[`${data_name}_array`],
        this[`${data_name}_array_label`]
      );
    }

    this[`${data_name}_loading`] = false;
  }

  async export_time(data_name: string) {
    this.waiting = true;

    let results = [];
    let all_data: any = await this.apiService.getAPI(
      environment.get5MinuteHrv,
      this.user_id,
      Date.parse(this[`${data_name}_start_time`]),
      Date.parse(this[`${data_name}_end_time`])
    );
    if (all_data.length > 0) {
      all_data.forEach((data) => {
        let current_time = new Date(parseInt(data['timestamp']));
        let current_hour =
          current_time.getHours() < 10
            ? `0${current_time.getHours().toString()}`
            : current_time.getHours().toString();
        let current_minute =
          current_time.getMinutes() < 10
            ? `0${current_time.getMinutes().toString()}`
            : current_time.getMinutes().toString();

        let time = `${current_hour} : ${current_minute}`;
        results.push({
          time: time,
          RMSSD: data['rmssd'],
          SDNN: data['sdnn'],
          HRR: data['hrr'],
          'LF/HF': data['frequency'],
        });
      });
    }
    let csv = unparse({
      fields: ['time', 'RMSSD', 'SDNN', 'HRR', 'LF/HF'],
      data: results,
    });
    let blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    let file_name = `${this.personnel_current_data.name}_${format(
      this[`${data_name}_start_time`],
      'YYYYMMDD(HHmm)'
    )}-${format(
      this[`${data_name}_end_time`],
      'YYYYMMDD(HHmm)'
    )}_RMSSD_SDNN_HRR_LFHF.csv`;
    saveAs(blob, file_name);

    this.waiting = false;
  }

  chosen_year_handler(normalizedYear: Moment, data_name: string) {
    const ctrl_value = this[`${data_name}_month_date`]['value'];
    ctrl_value.year(normalizedYear.year());
    this[`${data_name}_month_date`].setValue(ctrl_value);
  }

  chosen_month_handler(
    normalizedMonth: Moment,
    datepicker: MatDatepicker<Moment>,
    data_name: string
  ) {
    const ctrl_value = this[`${data_name}_month_date`]['value'];
    ctrl_value.month(normalizedMonth.month());
    this[`${data_name}_month_date`].setValue(ctrl_value);
    datepicker.close();
  }

  clear_time() {
    [
      this.rmssd_chart,
      this.sdnn_chart,
      this.hrr_chart,
      this.frequency_chart,
    ].forEach((chart) => {
      let index = 1;
      do {
        chart.data.datasets[index].showLine = true;
        chart.data.datasets[index].radius = 3;
        index++;
      } while (index <= 3);
    });

    let hrv_interval_array = [
      {
        interval: 'day',
        data: this.hrv_day_data,
        frequency_data: this.frequency_day_data,
      },
      {
        interval: 'week',
        data: this.hrv_week_data,
        frequency_data: this.frequency_week_data,
      },
      {
        interval: 'month',
        data: this.hrv_month_data,
        frequency_data: this.frequency_month_data,
      },
    ];
    hrv_interval_array.forEach((hrv_interval) => {
      if (hrv_interval.data) {
        this.update_hrv_chart(hrv_interval.interval, hrv_interval.data);
      } else {
        this.get_hrv_data();
      }
    });

    this.hr_start_time = null;
    this.hr_end_time = null;
    this.hr_start_max_date = new Date();
    this.hr_start_min_date = null;
    this.hr_end_max_date = new Date();
    this.hr_end_min_date = null;

    this.frequency_start_time = null;
    this.frequency_end_time = null;
    this.frequency_start_max_date = new Date();
    this.frequency_start_min_date = null;
    this.frequency_end_max_date = new Date();
    this.frequency_end_min_date = null;

    this.rmssd_start_time = null;
    this.rmssd_end_time = null;
    this.rmssd_start_max_date = new Date();
    this.rmssd_start_min_date = null;
    this.rmssd_end_max_date = new Date();
    this.rmssd_end_min_date = null;

    this.sdnn_start_time = null;
    this.sdnn_end_time = null;
    this.sdnn_start_max_date = new Date();
    this.sdnn_start_min_date = null;
    this.sdnn_end_max_date = new Date();
    this.sdnn_end_min_date = null;

    this.hrr_start_time = null;
    this.hrr_end_time = null;
    this.hrr_start_max_date = new Date();
    this.hrr_start_min_date = null;
    this.hrr_end_max_date = new Date();
    this.hrr_end_min_date = null;

    this.max_day_date = new Date();
    this.frequency_day_date = new FormControl(moment());
    this.rmssd_day_date = new FormControl(moment());
    this.hrr_day_date = new FormControl(moment());
    this.sdnn_day_date = new FormControl(moment());

    this.max_month_date = new Date();
    this.frequency_month_date = new FormControl(moment());
    this.rmssd_month_date = new FormControl(moment());
    this.sdnn_month_date = new FormControl(moment());
    this.hrr_month_date = new FormControl(moment());
  }

  change_start_time(val, data_name: string, number: number = 0) {
    this[`${data_name}_start_time`] = val;
    this[`${data_name}_end_min_date`] = this[`${data_name}_start_time`];
    this[`${data_name}_end_max_date`] = min(
      endOfDay(addDays(this[`${data_name}_start_time`], number)),
      new Date()
    );

    if (this[`${data_name}_end_time`]) {
      this[`${data_name}_end_time`] = min(
        this[`${data_name}_end_max_date`],
        this[`${data_name}_end_time`]
      );
      this[`${data_name}_end_time`] = max(
        this[`${data_name}_end_min_date`],
        this[`${data_name}_end_time`]
      );
    }
  }

  change_end_time(val, data_name: string, number: number = 0) {
    this[`${data_name}_end_time`] = val;
    this[`${data_name}_start_min_date`] = startOfDay(
      subDays(this[`${data_name}_end_time`], number)
    );
    this[`${data_name}_start_max_date`] = this[`${data_name}_end_time`];
    if (this[`${data_name}_start_time`]) {
      this[`${data_name}_start_time`] = min(
        this[`${data_name}_start_max_date`],
        this[`${data_name}_start_time`]
      );
      this[`${data_name}_start_time`] = max(
        this[`${data_name}_start_min_date`],
        this[`${data_name}_start_time`]
      );
    }
  }
}
