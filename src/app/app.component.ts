import { Component } from "@angular/core";
import { MouseEvent } from "@agm/core";
import { MarkerService } from "./services/marker.service";
import * as XLSX from "xlsx";
declare var google: any;

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
     // this.visualizeMarker(element.__EMPTY_9,element.__EMPTY_10);


    
 
      
      var d = {lat: element.__EMPTY_9, lng:element.__EMPTY_10};
      this.coordinates.push(d);
      console.log('moje')
      console.log(this.coordinates); 
      this.sve(this.coordinates);
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

  sve(checkboxArray){
    var directionsService = new google.maps.DirectionsService();
    var directionsDisplay = new google.maps.DirectionsRenderer();
    var map = new google.maps.Map(document.getElementById("map"), {
      zoom: 7,
      center: { lat: 41.85, lng: -87.65 }
    });
    directionsDisplay.setMap(map);
    calculateAndDisplayRoute(directionsService, directionsDisplay,checkboxArray);

    function calculateAndDisplayRoute(directionsService, directionsDisplay,checkboxArray) {
      var waypts = [];
      // var checkboxArray: any[] = [
      //   { lat: 52.520008, lng: 13.404954 },
      //   { lat: 50.737431, lng: 7.098207 },
      //   { lat: 53.551086, lng: 9.993682 }
      // ];
      for (var i = 0; i < checkboxArray.length; i++) {
        waypts.push({
          location: checkboxArray[i],
          stopover: true
        });
      }

      directionsService.route(
        {
          origin: { lat: checkboxArray[0].lat, lng: checkboxArray[0].lng },
          destination: { lat: checkboxArray[length].lat, lng: checkboxArray[length].lng },
          waypoints: waypts,
          optimizeWaypoints: true,
          travelMode: "DRIVING"
        },
        function(response, status) {
          if (status === "OK") {
            directionsDisplay.setDirections(response);
          } else {
            window.alert("Directions request failed due to " + status);
          }
        }
      );
    }
  }
  
  ngOnInit() {
  }

}

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