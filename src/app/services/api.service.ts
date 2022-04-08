import {
  HttpClient,
  HttpHeaders,
  HttpParams,
  HttpRequest,
} from '@angular/common/http';
import { Injectable, Input } from '@angular/core';
import { catchError, retry } from 'rxjs/operators';
@Injectable({
  providedIn: 'root',
})
export class APIService {
  constructor(private http: HttpClient) {}

  async getAPI(
    url: string,
    data: string = undefined,
    start_time: number = undefined,
    end_time: number = undefined
  ) {
    let new_url = '';
    if (
      data !== undefined &&
      start_time !== undefined &&
      end_time !== undefined
    ) {
      new_url = `${url}/${data}&${start_time}&${end_time}`;
    } else if (data !== undefined) {
      new_url = `${url}/${data}`;
    } else {
      new_url = url;
    }

    const token = sessionStorage.getItem('token');
    const options = {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Bearer ' + token,
      },
      responseType: 'json' as 'json',
    };
    return this.http.get(new_url, options).toPromise();
  }

  async postAPI(url: string, data: Object = [], update: boolean = false) {
    const token = sessionStorage.getItem('token');
    if (update === false) {
      const options = {
        headers: {
          Authorization: 'Bearer ' + token,
        },
        responseType: 'json' as 'json',
      };
      return this.http.post(url, data, options).toPromise();
    }
    if (update === true) {
      const options = {
        headers: {
          Authorization: 'Bearer ' + token,
        },
        responseType: 'text' as 'text',
      };
      return this.http.post(url, data, options).toPromise();
    }
  }

  async putAPI(url: string, data: Object) {
    const token = sessionStorage.getItem('token');
    const options = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
      responseType: 'text' as 'text',
    };
    return this.http.put(url, data, options).toPromise();
  }

  async deleteAPI(url: string, data: string) {
    const new_url = data !== undefined ? `${url}/${data}` : url;
    const token = sessionStorage.getItem('token');
    const options = {
      headers: {
        Authorization: 'Bearer ' + token,
      },
      responseType: 'text' as 'text',
    };
    return this.http.delete(new_url, options).toPromise();
  }
}
