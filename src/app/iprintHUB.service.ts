import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Response} from '@angular/http';
import {environment} from "../environments/environment";
import { Observable } from 'rxjs';
import { map, debounceTime } from 'rxjs/operators';

@Injectable()

export class iprintHUBService {
  constructor(private http: HttpClient) {}
  saveDelivery(delivery, printloc) {
    return this.http.post(environment.iprintHUBUrl + "/baldar/newDelivery?printloc=" + printloc,
      delivery,
      {
        headers: new HttpHeaders().set('Content-Type','application/json')
      })
  }

  contactsByPrefix(prefix):Observable<string[]> {
    return this.http.get<any>(`${environment.contactsQueryUrl}?firstPart=${prefix}`)
    .pipe(map((response: any) => {
      let res = response.recordset.map(function(item){return item.CUSTDES}).slice(0,19);
      if(releaseEvents.length == 0){
        res.push(prefix);
      }
      return res;
    }));

  }

}
