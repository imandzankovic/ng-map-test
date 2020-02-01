import { Injectable } from "@angular/core";
import { Init } from "../init-markers";

@Injectable({
  providedIn: "root"
})
export class MarkerService extends Init {
  constructor() {
    super();
    console.log("MarkerService Initialized...");
    this.load();
  }

  getMarkers() {
    var markers = JSON.parse(localStorage.getItem("markers"));
    return markers;
  }


  addMarker(newMarker){

  // Fetch markers
  var markers = JSON.parse(localStorage.getItem("markers"));
  // Push to array
  markers.push(newMarker);

  //Set ls again
  localStorage.setItem('markers', JSON.stringify(markers));
  }
}
