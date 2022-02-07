import {
  Directive,
  Component,
  OnInit,
  AfterViewInit,
  OnDestroy,
  Input,
  HostBinding,
} from '@angular/core';
import { Observable, timer } from 'rxjs';
import uniq from 'lodash/uniq';
import sortBy from 'lodash/sortBy';
import { filter, map, startWith, takeWhile } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { environment } from '../../../environments/environment';
import { ValueConverter } from '@angular/compiler/src/render3/view/template';
import { FormControl } from '@angular/forms';
import { ProgressSpinnerMode } from '@angular/material/progress-spinner';
import { APIService } from '../../services/api.service';

@Component({
  selector: '[app-dashboard]',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  loading = true;
  myControl = new FormControl();
  filteredOptions: Observable<any>;
  s_name = '';
  mode: ProgressSpinnerMode = 'determinate';
  value = 50;
  cardColor: string;
  constructor(private apiService: APIService, private router: Router) {
    const temp_auth = localStorage.getItem('enter');
    if (temp_auth == 'yes') {
    } else {
      //this.router.navigate(['/login']);
      this.router.navigate(['/login']);
    }
  }

  ngOnDestroy(): void {
    this.subscribing = false;
  }
  gatewaysData: any = [];
  results: object[] = [];
  subscribing = true;
  allCurrentData: any = [];
  personnelsData: any = [];
  temp: object[] = [];
  selected = '';
  showUnpaired = true;
  async ngOnInit() {
    // setTimeout(() => {
    //   window.location.reload();
    // }, 60000);

    this.filteredOptions = this.myControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value))
    );
  }

  private _filter(value) {
    let search_name;
    this.s_name = value;
    this.update();
    let regexp = new RegExp('[A-Za-z]+');
    if (regexp.test(value)) {
      search_name = this.allCurrentData.filter((currentData) =>
        currentData.name.toLowerCase().includes(value)
      );
    } else {
      search_name = this.allCurrentData.filter((option) =>
        option.name.includes(value)
      );
    }
    return search_name;
  }

  //計算HR圓圈
  spinnerValue(hr) {
    return (hr / 200) * 0.75 * 100;
  }

  //計算體溫bar
  progressValue(temp) {
    let result = ((temp - 32) / 8) * 100;
    return result + '%';
  }

  async update() {
    timer(0, 1000)
      .pipe(takeWhile(() => this.subscribing))
      .subscribe(async () => {
        const res = new Map();
        this.allCurrentData = await this.apiService.getAPI(
          environment.getAllCurrentData
        );

        if (this.allCurrentData.length > 0) {
          for (let currentData of this.allCurrentData) {
            if (!currentData['location'] || currentData['location'] == '')
              currentData['location'] = '未設定';
            if (Date.now() - currentData.timestamp > 10000) currentData.hr = 0;
          }

          let regexp = new RegExp('[A-Za-z]+');

          if (this.s_name != '' && regexp.test(this.s_name)) {
            this.s_name = this.s_name.toLowerCase();
            this.allCurrentData = this.allCurrentData.filter((currentData) =>
              currentData['name'].toLowerCase().includes(this.s_name)
            );
          } else {
            this.allCurrentData = this.allCurrentData.filter((currentData) =>
              currentData['name'].includes(this.s_name)
            );
          }

          if (!this.showUnpaired) {
            this.allCurrentData = this.allCurrentData.filter(
              (currentData) => currentData['hr'] > 0
            );
          }

          this.allCurrentData.sort((a, b) => b['hr'] - a['hr']);
          this.cardColor = '';
        }
        this.loading = false;
      });
  }

  //變更無信號顯示
  slideChangeResult(event) {
    this.showUnpaired = event.checked;
    this.update();
  }

  //變更更新狀態
  async slideChangeState(event) {
    this.subscribing = event.checked;
    if (this.subscribing) {
      await this.update();
    } else {
      this.allCurrentData.forEach((currentData) => {
        this.cardColor = 'noSignal';
        currentData['hr'] = 0;
        currentData['temperature'] = 'false';
        currentData['location'] = '無信號';
        currentData['hrr'] = 0;
        currentData['rmssd'] = 0;
        currentData['sdnn'] = 0;
        currentData['ratio'] = 0;
      });
    }
  }
}
