import { Component, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Validators } from '@angular/forms';
import {iprintHUBService} from "./iprintHUB.service";
import { NgSelectComponent } from '@ng-select/ng-select';
import * as deliveryCodes from "../data/deliveryCodes.json"
import * as deliverySource from "../data/deliverySource.json"
import * as streets from "../data/streets.json"
import * as cities from "../data/cities.json"

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  profileForm = this.fb.group({
    contactManName: ['', Validators.required],
    CustomerID: [''],
    customerDeliveryNum: [''],
    companyNameLet: [''],
      streetOut: ['', Validators.required],
      streetNumOut: ['', Validators.required],
      KnisaOut: [''],
      DiraOut: [''],
      KomaOut: [''],
      cityOut: ['', Validators.required],
    companyNameGet: [''],
      streetDes: [],
      streetNumDes: [''],
      KnisaDes: [''],
      DiraDes: [''],
      KomaDes: [''],
      cityDes: [],
   vehicleTypeId: [''],
    comments:['']

  });

  vehicleTypes = [
    {'id': 1, 'name': 'משלוח ללקוח'},
    {'id': 1, 'name': 'איסוף על ידי הלקוח'},
    {'id': 1, 'name': 'דואר שליחים'},
    {'id': 1, 'name': 'דואר רשום'},
    {'id': 1, 'name': 'איסוף מהלקוח\\ספק'}
  ];

  deliveryCodes:any = null;
  deliverySource:any = null;
  streets:any = null;
  cities:any = null;
  streetsInCity:any = [];
  sourceAddress:string = null;

  @ViewChild('selectCity') selectCity: NgSelectComponent;
  @ViewChild('selectStreet') selectStreet: NgSelectComponent;

  constructor(private fb: FormBuilder, private iprintHUB: iprintHUBService) {
    this.profileForm.patchValue({deliveryCode: 6469});

  }

  onSubmit() {
    // TODO: Use EventEmitter with form value

    console.log("Saving Delivery ...");
    this.iprintHUB.saveDelivery(this.profileForm.value)
      .subscribe(
        (response) => {
          console.log("New Delivery with  deliveryNumber " +  response["DeliveryNum"] + " inserted");
          this.sourceAddress = "";
          this.profileForm.reset({
            contactManName: '',
            CustomerID: '',
            customerDeliveryNum: '',
            companyNameLet: '',
            streetOut: '',
            streetNumOut: '',
            DiraOut: '',
            KomaOut:'',
            cityOut: '',
            companyNameGet: '',
            streetDes: '',
            streetNumDes: '',
            KnisaDes: '',
            DiraDes: '',
            KomaDes: '',
            cityDes: '',
            vehicleTypeId: '',
            comments: ''

          });
        },
        (error) => console.log(error)
      );
  }
  onDeliverySourceChange (event: Event) {
    console.log(event);
    const selectedID = (<HTMLInputElement>event.target).value;
    if (selectedID in this.deliverySource) {

      let source = this.deliverySource[selectedID];
      this.profileForm.get('companyNameLet').setValue(source.branch);
      this.profileForm.get('streetOut').setValue(source.street);
      this.profileForm.get('streetNumOut').setValue(source.houseNo);
      this.profileForm.get('cityOut').setValue(source.city);
      this.profileForm.get('vehicleTypeId').setValue(source.vehicleTypeId);
      this.sourceAddress = `${source.branch}, ${source.street} ${source.houseNo}, ${source.city}`;
          
    } else {
      this.profileForm.get('streetDes').setValue("");
      this.sourceAddress = null;
    }
  }

  onSelectCity() {
    let city = this.profileForm.get('cityDes').value;
    this.streetsInCity = this.streets[city];
  }
  onSelectStreet() {
    let street = this.profileForm.get('streetDes').value;
  }

  onCityFocus() {
    this.selectCity.open();
  }
  onStreetFocus(){
    this.selectStreet.open();
  }
  ngOnInit () {
    this.deliveryCodes = deliveryCodes.default;
    this.deliverySource = deliverySource.default;
    this.streets = streets.default;
    this.cities = cities.default;
  }
}
