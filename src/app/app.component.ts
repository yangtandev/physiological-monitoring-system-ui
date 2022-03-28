import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { MediaMatcher } from '@angular/cdk/layout';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer, Title } from '@angular/platform-browser';
import { Location } from '@angular/common';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

import { environment } from '../environments/environment';
import { PermissionService } from './services/permission.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  loggedIn: Observable<boolean>;
  mobileQuery: MediaQueryList;
  title: string = environment.appName;
  sidebarLinks: object[];
  private _mobileQueryListener: () => void;
  sidebarEnabled: boolean = environment.sidebarEnabled;
  sidebarOpened: boolean;
  display: boolean;

  constructor(
    changeDetectorRef: ChangeDetectorRef,
    private iconRegistry: MatIconRegistry,
    private sanitizer: DomSanitizer,
    private _location: Location,
    private router: Router,
    media: MediaMatcher,
    private titleService: Title,
    private permissionService: PermissionService
  ) {
    this.mobileQuery = media.matchMedia('(max-width: 1279px)');
    this._mobileQueryListener = () => changeDetectorRef.detectChanges();
    this.mobileQuery.addListener(this._mobileQueryListener);
    if (environment.sidebarEnabled && !this.mobileQuery.matches) {
      this.sidebarOpened = true;
    } else {
      this.sidebarOpened = false;
    }
  }

  async ngOnInit(): void {
    if (environment.documentTitle) {
      this.titleService.setTitle(environment.documentTitle);
    }

    this.iconRegistry.addSvgIcon(
      'heartbeat',
      this.sanitizer.bypassSecurityTrustResourceUrl('assets/img/heartbeat.svg')
    );

    this.sidebarLinks = this.permissionService.sidebarLinks;

    let beginTime = 0;
    let differTime = 0;
    window.onunload = function () {
      differTime = new Date().getTime() - beginTime;
      if (differTime <= 5) navigator.sendBeacon('/exit');
    };
    window.onbeforeunload = function () {
      beginTime = new Date().getTime();
    };
  }

  logout() {
    localStorage.setItem('enter', 'no');
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }

  is_loggedin(): boolean {
    return (
      localStorage.getItem('enter') === 'yes' && localStorage.getItem('token')
    );
  }

  backClicked() {
    if (window.history.length > 1) {
      this._location.back();
    } else {
      this.router.navigate(['/']);
    }
  }
}
