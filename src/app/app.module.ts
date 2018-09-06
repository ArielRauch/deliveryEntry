import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';



import { AppComponent } from './app.component';
import { iprintHUBService } from './iprintHUB.service';

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
    HttpClientModule
  ],
  providers: [iprintHUBService],
  bootstrap: [AppComponent]
})
export class AppModule { }
