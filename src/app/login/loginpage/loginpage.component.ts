import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { APIService } from '../../services/api.service';
import { environment } from '../../../environments/environment';
@Component({
  selector: 'app-loginpage',
  templateUrl: './loginpage.component.html',
  styleUrls: ['./loginpage.component.scss'],
})
export class LoginpageComponent implements OnInit {
  constructor(
    private cdRef: ChangeDetectorRef,
    // private route: ActivatedRoute,
    private router: Router,
    //
    private http: HttpClient,
    private apiService: APIService
  ) {}

  usernameEmpty: boolean = false;
  passwordEmpty: boolean = false;
  username: string;
  password: string;
  user: any = [];

  async ngOnInit() {
    this.cdRef.detectChanges();
  }

  async onLogin() {
    window.blur();
    this.cdRef.detectChanges();

    this.usernameEmpty = false;
    this.passwordEmpty = false;
    if (
      this.username == null ||
      this.username.trim() == '' ||
      this.password == null ||
      this.password.trim() == ''
    ) {
      if (this.username == null || this.username.trim() == '') {
        this.usernameEmpty = true;
      }
      if (this.password == null || this.password.trim() == '') {
        this.passwordEmpty = true;
      }
      return;
    }

    const login_data = {
      username: this.username,
      password: this.password,
    };

    try {
      this.user = await this.apiService.postAPI(environment.login, login_data);
      if (this.user) {
        localStorage.setItem('enter', 'yes');
        this.router.navigate(['/']);
      } else {
        localStorage.setItem('enter', 'no');
        this.router.navigate(['/login']);
      }
    } catch (error) {
      console.log(error);
    }
  }
}
