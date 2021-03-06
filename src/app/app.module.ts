import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import {APP_BASE_HREF} from '@angular/common';

import { AppComponent } from './app.component';
import { iprintHUBService } from './iprintHUB.service';
import { NotifierModule } from 'angular-notifier';
import { AngularFontAwesomeModule } from 'angular-font-awesome';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    NgSelectModule,
    // other imports ...
    ReactiveFormsModule,
    HttpClientModule,
    NotifierModule.withConfig({
      position: {
        horizontal: { position: 'middle' },
        vertical: { position: 'top', distance: 80, gap: 10 }
      },
      behaviour:{
        autoHide: 5000
      }
    }),
    RouterModule.forRoot([]),
    AngularFontAwesomeModule
  ],
  providers: [iprintHUBService,{provide: APP_BASE_HREF, useValue : '/' }],
  bootstrap: [AppComponent]
})
export class AppModule { }
