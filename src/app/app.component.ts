import { Component, OnInit, ViewChild, QueryList, ViewChildren, EventEmitter, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray } from '@angular/forms';
import { Validators } from '@angular/forms';
import { iprintHUBService } from "./iprintHUB.service";
import { NgSelectComponent } from '@ng-select/ng-select';
import { NotifierService } from 'angular-notifier';
import { Observable, of } from 'rxjs';
import { catchError, map, debounceTime, switchMap } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';

import * as sourceNames from "../data/sourceNames.json"
import * as sourceAddresses from "../data/sourceAddresses.json"
import * as streets from "../data/streets.json"
import * as cities from "../data/cities.json"
import { forEach } from '@angular/router/src/utils/collection';


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

  contactNames: any = [];
  sourceNames: any = null;
  sourceAddresses: any = null;
  streets: any = null;
  cities: any = null;
  sourceAddressStr: string = null;
  printloc: string = null;
  packageAmountOptions = Array.from({ length: 20 }, (v, i) => i + 1)
  recentDestinations: any = [];

  streetsInCities = [[]];

  readonly notifier: NotifierService;

  contactTypeahead: EventEmitter<string> = new EventEmitter<string>();


  @ViewChild('selectContact') selectContact;
  @ViewChildren('selectCity') selectCity;
  @ViewChildren('selectStreet') selectStreet;
  @ViewChildren('selectPackageAmount') selectPackageAmount;

  constructor(private fb: FormBuilder, private iprintHUB: iprintHUBService, notifierService: NotifierService, private cd: ChangeDetectorRef, private route: ActivatedRoute) {
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

  loadContacts(term: string): Observable<any[]> {
    if (term.length > 2) {
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
      packageAmount: null
    });
  }

  addDestination(): void {
    let destinations = this.profileForm.get('destinations') as FormArray;
    destinations.push(this.createDestination());
    this.streetsInCities.push([]);
  }

  addDestinationFromRecent(i: number) {
    let destinations = this.profileForm.get('destinations') as FormArray;

    if (destinations.length == 1) {
      let dest = destinations.value[0];
      if (dest.name == '' && !dest.city && !dest.street) {
        destinations.removeAt(0);
        this.streetsInCities = [];
      }
    }
    destinations.push(this.fb.group(this.recentDestinations[i]));
    this.streetsInCities.push([]);
  }

  deleteDestination(i: number): void {
    let destinations = this.profileForm.get('destinations') as FormArray;
    if (destinations.length > 1) {
      destinations.removeAt(i);
      this.streetsInCities.splice(i, 1);
    }
  }

  onSubmit() {
    // TODO: Use EventEmitter with form value

    console.log("Saving Delivery ...");

    let delivery = this.formToDelivery(this.profileForm.value);
    this.saveRecentDestinations();
    debugger;
    return;
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
          KnisaDes: d.entry,
          packageAmount: d.packageAmount || 1
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
  onPackageAmountFocus(i) {
    this.selectPackageAmount._results[i].open()
  }

  clearStreets(i) {
    let dest = this.profileForm.get('destinations').value[i];
    dest.street = null;
    this.streetsInCities[i] = this.streets[dest.city];
  }

  streetTypeaheadFactory(i): EventEmitter<string> {
    let typeahead = new EventEmitter<string>();

    typeahead
      .pipe(
        debounceTime(100),
        switchMap(term => {
          let dest = this.profileForm.get('destinations').value[i];
          let streets = this.streets[dest.city].filter(city => city.startsWith(term));
          if (streets.length == 0)
            streets.push(term);
          return of(streets);
        })
      ).subscribe(streets => {
        this.streetsInCities[i] = streets;
        this.cd.markForCheck();
      }, (err) => {
        console.log('error', err);
        this.cd.markForCheck();
      });

    return typeahead;
  }

  ngOnInit() {
    this.sourceNames = sourceNames.default;
    this.sourceAddresses = sourceAddresses.default;
    this.streets = streets.default;
    this.cities = cities.default;
    this.route.queryParamMap.subscribe((params) => {
      this.printloc = params.get('printloc');
    });
    this.recentDestinations = JSON.parse(localStorage.getItem('recentDestinations') || "[]") || [];
  }

  saveRecentDestinations() {
    let destinations = this.profileForm.value.destinations;
    destinations.forEach(dest => {
      if (!this.recentDestinations.some(d => d.name == dest.name && d.city == dest.city && d.street == dest.street && d.house == dest.house && d.entry == dest.entry)) {
        dest.packageAmount = null;
        this.recentDestinations.slice(0, 6);
        this.recentDestinations.push(dest);
      }
    });
    localStorage.setItem('recentDestinations', JSON.stringify(this.recentDestinations));
  }

clearRecentDestinations(){
    if(confirm("לנקות את רשימת הכובות האחרונות?")){
    this.recentDestinations = [];
    localStorage.setItem('recentDestinations', JSON.stringify(this.recentDestinations));
    }
}


}
