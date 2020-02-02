import { Component } from "@angular/core";
import { MouseEvent } from "@agm/core";
import { MarkerService } from "./services/marker.service";
import * as XLSX from "xlsx";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  providers: [MarkerService]
})
export class AppComponent {
  title = "mapit";
  // Zoom level
  zoom: number = 10;
  // Start position
  lat: number = 50.929088;
  lng: number = 4.418145;

  // Values
  markerName: string;
  markerLat: string;
  markerLng: string;
  markerDraggable: string;

  // Markers
  markers: marker[] = [];
  arrayBuffer: any;
  file: File;
  coordinates : coordinate[]=[];


  constructor(private _markerService: MarkerService) {
    this.markers = this._markerService.getMarkers();
  }

  mapClicked($event: MouseEvent) {
    // this.markers.push({
    //   lat: $event.coords.lat,
    //   lng: $event.coords.lng,
    //   draggable: false
    // });
    console.log('clicked')
  }

  markerDragEnd(marker: any, $event: any) {
    console.log("drag end", marker.label, $event);

    var updMarker = {
      name: marker.name,
      lat: parseFloat(marker.lat),
      lng: parseFloat(marker.lng),
      draggable: false
    };

    var newLat = $event.coords.lat;
    var newLng = $event.coords.lng;

    this._markerService.updateMarker(updMarker, newLat, newLng);
  }

  addMarker() {
    console.log("adding marker");
    if (this.markerDraggable == "yes") {
      var isDraggable = true;
    } else {
      var isDraggable = false;
    }

    var newMarker = {
      name: this.markerName,
      lat: parseFloat(this.markerLat),
      lng: parseFloat(this.markerLng),
      draggable: isDraggable
    };

    this.markers.push(newMarker);
    this._markerService.addMarker(newMarker);
  }

  removeMarker(marker) {
    console.log("removing marker...");
    for (var i = 0; i < this.markers.length; i++) {
      if (
        marker.lat == this.markers[i].lat &&
        marker.lng == this.markers[i].lng
      ) {
        this.markers.splice(i, 1);
      }
    }

    this._markerService.removeMarker(marker);
  }

  clickedMarker(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`);
  }

  incomingfile(event) {
    this.file = event.target.files[0];
  }

  Upload() {
    let fileReader = new FileReader();
    fileReader.onload = e => {
      this.arrayBuffer = fileReader.result;
      var data = new Uint8Array(this.arrayBuffer);
      var arr = new Array();
      for (var i = 0; i != data.length; ++i)
        arr[i] = String.fromCharCode(data[i]);
      var bstr = arr.join("");
      var workbook = XLSX.read(bstr, { type: "binary" });
      var first_sheet_name = workbook.SheetNames[0];
      var worksheet = workbook.Sheets[first_sheet_name];
      console.log(XLSX.utils.sheet_to_json(worksheet, { raw: true }));
      this.loopThrough(XLSX.utils.sheet_to_json(worksheet, { raw: true }));
    };

    fileReader.readAsArrayBuffer(this.file);
  }

  loopThrough(elements) {
    for (let index = 1; index < elements.length; index++) {
      const element = elements[index];
      console.log(element);
      console.log(element.__EMPTY_9)
      console.log(element.__EMPTY_10)
      
      this.lat=element.__EMPTY_9;
      this.lng=element.__EMPTY_10;
      this.zoom=12;
      this.visualizeMarker(element.__EMPTY_9,element.__EMPTY_10);
      
      // var d = {lat: element.__EMPTY_9, lng:element.__EMPTY_10};
      // this.coordinates.push(d);
      // console.log('moje')
      // console.log(this.coordinates);
    }
  }

  visualizeMarker(lat,lng){
    var newMarker = {
      name: this.markerName,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      draggable: false
    };

    this.markers.push(newMarker);
    this._markerService.addMarker(newMarker);

  }
}

// just an interface for type safety.
interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}

interface coordinate {
  lat: number;
  lng: number;
}