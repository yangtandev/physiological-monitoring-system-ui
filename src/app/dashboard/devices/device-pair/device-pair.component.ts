import { Component, OnInit, ViewChild } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

import sortBy from 'lodash/sortBy';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { NgForm } from '@angular/forms';
import { timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { APIService } from '../../../services/api.service';
import { Console } from 'console';

@Component({
  selector: 'app-device-pair',
  templateUrl: './device-pair.component.html',
  styleUrls: ['./device-pair.component.scss'],
  animations: [
    trigger('detailExpand', [
      state(
        'collapsed',
        style({ height: '0px', minHeight: '0', display: 'none' })
      ),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class DevicePairComponent implements OnInit {
  expandedElement: object;
  displayedColumns: string[] = ['mac', 'user_id', 'pair_type', 'action'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  allPersonnelData: any;
  mac: any;
  pair_type: any;
  user_id: any;
  wait: any = false;
  loading: boolean = true;

  constructor(private apiService: APIService, private router: Router) {
    const temp_auth = sessionStorage.getItem('enter');
    if (temp_auth == 'yes') {
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    this.getPairData();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async getPairData() {
    let data = await this.apiService.getAPI(environment.getWristbands);
    this.dataSource.data = sortBy(data, 'mac');
    this.loading = false;
  }

  async create() {
    let data = {
      mac: this.mac.toLowerCase(),
      pair_type: this.pair_type.toUpperCase(),
    };
    const repeatedly_create = this.dataSource.data.some(
      (wristband: any) => wristband.mac === data.mac
    );

    if (repeatedly_create) {
      this.wait = 'repeatedly_create';
      timer(5000, 0)
        .pipe(takeWhile(() => this.wait))
        .subscribe((val) => {
          this.wait = false;
        });
    } else {
      await this.apiService.postAPI(environment.postWristband, data);
      await this.getPairData();
    }
  }
  //於手環設定頁面修改 聯動wristband & personnel
  async update(updateForm: NgForm) {
    let element = { ...updateForm.value };
    let personnelIsExisted = await this.apiService.getAPI(
      environment.getPersonnel,
      element.user_id
    );

    let updateDataIsEmpty = JSON.stringify(this.expandedElement) === '{}';
    let updateDataUnchanged =
      JSON.stringify(Object.values(this.expandedElement).sort()) ===
      JSON.stringify(Object.values(element).sort());

    if (updateDataIsEmpty || updateDataUnchanged) {
      await this.getPairData();
    } else if (!personnelIsExisted) {
      this.wait = 'not existed';
      timer(5000, 0)
        .pipe(takeWhile(() => this.wait))
        .subscribe((val) => {
          this.wait = false;
        });
    } else {
      const updateData = element;
      await this.apiService.putAPI(environment.putWristband, updateData);
      this.wait = true;
      timer(5000, 0)
        .pipe(takeWhile(() => this.wait))
        .subscribe((val) => {
          this.wait = false;
        });
      this.expandedElement = {};
      await this.getPairData();
    }
  }

  async delete(element) {
    const deleteWristband = environment.deleteWristband;
    const data = element.mac;
    // await this.apiService.deleteAPI(deleteWristband, data);
    await this.apiService.deleteAPI(deleteWristband, data);
    this.getPairData();
  }
}
