import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import { LOCALE_ID } from '@angular/core';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
import locales from '@angular/common/locales/zh-Hant';
import Amplify from '@aws-amplify/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { environment } from '../environments/environment';
import { LoginpageComponent } from './login/loginpage/loginpage.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import {
  MatDatetimepickerModule,
  MatNativeDatetimeModule,
} from '@mat-datetimepicker/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTableModule } from '@angular/material/table';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSliderModule } from '@angular/material/slider';
import { MatTooltipModule } from '@angular/material/tooltip';

import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { HighlightDirective } from './highlight.directive';
import { PersonnelComponent } from './dashboard/personnel/personnel.component';
import { BatteryComponent } from './dashboard/device/battery/battery.component';
import { HttpClientModule } from '@angular/common/http';
import { PersonnelDetailComponent } from './dashboard/personnel-detail/personnel-detail.component';
import { RssiComponent } from './dashboard/device/rssi/rssi.component';
import { DevicePairComponent } from './dashboard/devices/device-pair/device-pair.component';
import { DevicesPiComponent } from './dashboard/devices/devices-pi/devices-pi.component';

registerLocaleData(locales);

@NgModule({
  declarations: [
    AppComponent,
    LoginpageComponent,
    DashboardComponent,
    HighlightDirective,
    PersonnelComponent,
    BatteryComponent,
    RssiComponent,
    PersonnelDetailComponent,
    DevicePairComponent,
    DevicesPiComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    FlexLayoutModule,
    FormsModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCardModule,
    MatInputModule,
    MatExpansionModule,
    MatIconModule,
    HttpClientModule,
    MatDatetimepickerModule,
    MatNativeDateModule,
    MatNativeDatetimeModule,
    MatDatepickerModule,
    MatToolbarModule,
    MatButtonToggleModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatTableModule,
    MatSelectModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatSliderModule,
    MatTooltipModule,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'zh-Hant' },
    { provide: MAT_DATE_LOCALE, useValue: 'zh-tw' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
