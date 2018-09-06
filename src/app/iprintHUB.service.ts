import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from "../environments/environment";

@Injectable()

export class iprintHUBService {
  constructor(private http: HttpClient) {}
  saveDelivery(deliveryObj) {
    return this.http.post(environment.iprintHUBUrl + "/baldar/newDelivery",
      deliveryObj,
      {
        headers: new HttpHeaders().set('Content-Type','application/json')
      })
  }
}
