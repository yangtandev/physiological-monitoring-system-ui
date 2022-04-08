import { Component, OnInit, ViewChild } from '@angular/core';
import sortBy from 'lodash/sortBy';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';

import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Router } from '@angular/router';
import { APIService } from '../../services/api.service';
import { environment } from 'src/environments/environment';
import { NgForm } from '@angular/forms';
import { timer } from 'rxjs';
import { takeWhile } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-personnel',
  templateUrl: './personnel.component.html',
  styleUrls: ['./personnel.component.scss'],
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
export class PersonnelComponent implements OnInit {
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  loading = true;
  pair_data: any;
  personnel: object[] = [];
  currentData: object[] = [];
  expandedElement = true;

  displayedColumns: string[] = [
    'name',
    'mac',
    'birthday',
    'user_id',
    'sex',
    'create_date',
    'update_date',
    'action',
  ];

  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  mac: any;
  name: any;
  sex: any;
  birthday: any;
  user_id: any;
  create_date: any;
  update_date: any;
  pairing: any = {};
  oldPair: any = null;
  wait: any = false;
  constructor(
    private apiService: APIService,
    private http: HttpClient,
    private router: Router
  ) {
    const temp_auth = sessionStorage.getItem('enter');
    if (temp_auth == 'yes') {
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    this.getPersonnel();
    this.getPairData();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async getPersonnel() {
    let personnelsData: any = await this.apiService.getAPI(
      environment.getPersonnels
    );
    this.dataSource.data = personnelsData;

    this.personnel = this.dataSource.data;
    this.loading = false;
  }
  async getPairData() {
    let data = await this.apiService.getAPI(environment.getWristbands);
    this.pair_data = data;
  }

  async pair() {
    this.wait = true;
    timer(5000, 0)
      .pipe(takeWhile(() => this.wait))
      .subscribe((val) => {
        this.wait = false;
      });
    let updateData = {
      user_id: this.pairing['user_id'],
      mac: this.pairing['mac'],
    };
    await this.apiService.putAPI(environment.putPersonnelPairMac, updateData);
    await this.getPersonnel();
  }

  async create() {
    const data = {
      user_id: this.user_id,
      name: this.name,
      sex: this.sex,
      birthday: this.birthday,
    };
    const repeatedly_create = this.personnel.some(
      (personnel: any) => personnel.user_id === data.user_id
    );

    if (repeatedly_create) {
      this.wait = 'repeatedly_create';
      timer(5000, 0)
        .pipe(takeWhile(() => this.wait))
        .subscribe((val) => {
          this.wait = false;
        });
    } else {
      await this.apiService.postAPI(environment.postPersonnel, data);
      await this.getPersonnel();
    }
  }

  async update(updateForm: NgForm, fileInput) {
    let element = { ...updateForm.value };

    if (fileInput.files.length > 0) {
      element.picture = fileInput.files[0];
    }
    this.expandedElement = true;

    await this.apiService.putAPI(environment.putPersonnel, element);
    await this.getPersonnel();
  }

  async delete(element) {
    await this.apiService.deleteAPI(
      environment.deletePersonnel,
      element.user_id
    );
    await this.getPersonnel();
  }
}
