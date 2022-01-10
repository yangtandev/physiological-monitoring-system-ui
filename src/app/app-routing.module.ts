import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginpageComponent } from './login/loginpage/loginpage.component';
import { DashboardComponent } from './dashboard/dashboard/dashboard.component';
import { PersonnelDetailComponent } from './dashboard/personnel-detail/personnel-detail.component';
import { PersonnelComponent } from './dashboard/personnel/personnel.component';
import { DevicePairComponent } from './dashboard/devices/device-pair/device-pair.component';
import { DevicesPiComponent } from './dashboard/devices/devices-pi/devices-pi.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [],
    canActivateChild: [],
    children: [
      { path: '', component: DashboardComponent },
      { path: 'personnel/:user_id', component: PersonnelDetailComponent },
      { path: 'personnel', component: PersonnelComponent },
      { path: 'devices/pair', component: DevicePairComponent },
      { path: 'devices/pi', component: DevicesPiComponent },
    ],
  },

  { path: 'login', component: LoginpageComponent },
];

@NgModule({
  // imports: [RouterModule.forRoot(routes)],
  imports: [RouterModule.forRoot(routes, { useHash: true })],

  exports: [RouterModule],
})
export class AppRoutingModule {}
