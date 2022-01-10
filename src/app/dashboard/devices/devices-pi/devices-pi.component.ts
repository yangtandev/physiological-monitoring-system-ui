import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';

import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { NgForm } from '@angular/forms';
import sortBy from 'lodash/sortBy';
import { Router } from '@angular/router';
import { environment } from '../../../../environments/environment';
import { APIService } from '../../../services/api.service';

@Component({
  selector: 'app-devices-pi',
  templateUrl: './devices-pi.component.html',
  styleUrls: ['./devices-pi.component.scss'],
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
export class DevicesPiComponent implements OnInit {
  expandedElement: object = {};
  displayedColumns: string[] = ['gateway', 'location', 'action'];
  dataSource: MatTableDataSource<any> = new MatTableDataSource();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;

  gateway: any;
  location: any;
  loading: boolean = true;

  constructor(private apiService: APIService, private router: Router) {
    const temp_auth = localStorage.getItem('enter');
    if (temp_auth == 'yes') {
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngOnInit(): void {
    this.getGatewayData();
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  async getGatewayData() {
    const getGateways = environment.getGateways;
    let data = await this.apiService.getAPI(getGateways);
    this.dataSource.data = sortBy(data, 'gateway');
    this.loading = false;
  }

  async create() {
    const postGateway = environment.postGateway;
    let item = {
      gateway: this.gateway.toLowerCase(),
    };
    await this.apiService.postAPI(postGateway, item);
    this.getGatewayData();
  }

  async update(updateForm: NgForm) {
    let element = { ...updateForm.value };
    const putGateway = environment.putGateway;
    const data = {
      gateway: element.gateway,
      location: element.location,
    };
    let s = await this.apiService.putAPI(putGateway, data);
    this.expandedElement = {};
    this.getGatewayData();
  }

  async delete(element) {
    const deleteGateway = environment.deleteGateway;
    const data = element.gateway;
    // await this.apiService.deleteAPI(deleteGateway, data);
    await this.apiService.deleteAPI(deleteGateway, data);
    this.getGatewayData();
  }
}
