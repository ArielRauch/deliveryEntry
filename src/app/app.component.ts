import { Component, OnInit, ViewChild, QueryList, ViewChildren, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Validators } from '@angular/forms';
import { iprintHUBService } from "./iprintHUB.service";
import { NgSelectComponent } from '@ng-select/ng-select';
import { NotifierService } from 'angular-notifier';
import { Observable, of } from 'rxjs';
import {catchError, map, debounceTime, switchMap} from 'rxjs/operators';


import * as sourceNames from "../data/sourceNames.json"
import * as sourceAddresses from "../data/sourceAddresses.json"
import * as streets from "../data/streets.json"
import * as cities from "../data/cities.json"


@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  profileForm = this.fb.group({
    contact: ['', Validators.required],
    deliveryNum: '',
    phone: '',
    comments: '',
    sourceId: null,
    sourceAddress: null,
    destinations: this.fb.array([this.createDestination()])
  });

  contactNames:any = [];
  sourceNames: any = null;
  sourceAddresses: any = null;
  streets: any = null;
  cities: any = null;
  sourceAddressStr: string = null;
  ws: string = null;

  streetsInCities = [[]];

  readonly notifier: NotifierService;

  contactTypeahead:EventEmitter<string> = new EventEmitter<string>();

  @ViewChild('selectContact') selectContact;
  @ViewChildren('selectCity') selectCity;
  @ViewChildren('selectStreet') selectStreet;


  constructor(private fb: FormBuilder, private iprintHUB: iprintHUBService, notifierService: NotifierService, private cd: ChangeDetectorRef) {
    this.profileForm.patchValue({ deliveryCode: 6469 });
    this.notifier = notifierService;
    this.contactTypeahead
    .pipe(
        debounceTime(400),
        switchMap(term => this.loadContacts(term))
    )
    .subscribe(contactNames => {
        this.contactNames = contactNames;
        this.cd.markForCheck();
    }, (err) => {
        console.log('error', err);
        this.contactNames = [];
        this.cd.markForCheck();
    });

  }

  loadContacts(term:string):Observable<any[]>{
    if(term.length > 2){
      return this.iprintHUB.contactsByPrefix(term);
    }
    return of([]);
  }

  createDestination(): FormGroup {
    return this.fb.group({
      name: '',
      city: null,
      street: null,
      house: '',
      entry: '',
    });
  }

  addDestination(): void {
    let destinations = this.profileForm.get('destinations') as FormArray;
    destinations.push(this.createDestination());
    this.streetsInCities.push([]);
  }

  deleteDestination(i: number): void {
    let destinations = this.profileForm.get('destinations') as FormArray;
    if (destinations.length > 1) {
      destinations.removeAt(i);
      this.streetsInCities[i] = [];
    }
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value

    console.log("Saving Delivery ...");

    let delivery = this.formToDelivery(this.profileForm.value);
    this.iprintHUB.saveDelivery(delivery)
      .subscribe(
        (response) => {
          let deliveryNum = response["DeliveryNum"];
          this.notifier.notify('success', `המשלוח ${deliveryNum} נשמר בהצלחה`);
          console.log(`New Delivery with  deliveryNumber ${deliveryNum} inserted`);
          this.sourceAddressStr = "";
          this.profileForm.reset({
            contact: '',
            deliveryNum: '',
            phone: '',
            comments: '',
            sourceId: null,
            sourceAddress: null,
            destinations: this.fb.array([this.createDestination()])
          });
        },
        (error) => {
          this.notifier.notify('error', "ארע שגיעה בלתי צפויה! הנתונים לא נשמרו");
          console.log(error);
        }
      );
  }

  formToDelivery(form): any {
    let delivery = {
      contactManName: form.contact,
      customerDeliveryNum: form.deliveryNum,
      PhoneDes: form.phone,
      comment2: form.comments,
      CustomerID: form.sourceId,
      companyNameLet: form.sourceAddress.branch,
      cityOut: form.sourceAddress.city,
      streetNumOut: form.sourceAddress.houseNo,
      streetOut: form.sourceAddress.street,
      vehicleTypeId: form.sourceAddress.vehicleTypeId,
      destinations: form.destinations.map(function (d) {
        return {
          companyNameGet: d.name,
          cityDes: d.city,
          streetDes: d.street,
          streetNumDes: d.house,
          KnisaDes: d.entry || ""
        }
      })
    }
    return delivery;
  }

  onSourceChange(event: Event) {
    console.log(event);
    const sourceId = (<HTMLInputElement>event.target).value;
    if (sourceId in this.sourceAddresses) {

      let address = this.sourceAddresses[sourceId];
      this.profileForm.get('sourceAddress').setValue(address);
      this.sourceAddressStr = `${address.branch}, ${address.street} ${address.houseNo}, ${address.city}`;

    } else {
      this.sourceAddressStr = null;
    }
  }

  onSelectCity(i) {
    let dest = this.profileForm.get('destinations').value[i];
    this.streetsInCities[i] = this.streets[dest.city];
  }

  onCityFocus(i) {
    this.selectCity._results[i].open()
  }
  onStreetFocus(i) {
    this.selectStreet._results[i].open()
  }
  ngOnInit() {
    this.sourceNames = sourceNames.default;
    this.sourceAddresses = sourceAddresses.default;
    this.streets = streets.default;
    this.cities = cities.default;
  }
}
