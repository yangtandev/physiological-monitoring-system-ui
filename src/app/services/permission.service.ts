import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PermissionService {
  sidebarLinks= environment.sidebarLinks;

  constructor() {
    this.sidebarLinks.forEach(section => {
      section['links'].forEach(x => x['enabled'] = true)
    })
  }
}
