import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";

import { AppRoutingModule } from "./app-routing.module";
import { AgmCoreModule } from "@agm/core";
import { FormsModule } from "@angular/forms";
import { AppComponent } from "./app.component";


@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    // AgmCoreModule.forRoot({
    //   apiKey:"AIzaSyDSLDVsHbuo6EfXHHDILYs9OA_d8Q046vE"
    // }),
    FormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule {}
