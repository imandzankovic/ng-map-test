import { Component, OnInit } from "@angular/core";
import { MarkerService } from "../services/marker.service";
declare var google: any;
import * as XLSX from "xlsx";
declare var google: any;

@Component({
  selector: "app-route",
  templateUrl: "./route.component.html",
  styleUrls: ["./route.component.css"],
  providers: [MarkerService]
})
export class RouteComponent implements OnInit {
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
  coordinates: coordinate[] = [];

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
      console.log(element.__EMPTY_9);
      console.log(element.__EMPTY_10);

      this.lat = element.__EMPTY_9;
      this.lng = element.__EMPTY_10;
      this.zoom = 12;
      // this.visualizeMarker(element.__EMPTY_9,element.__EMPTY_10);

      var d = { lat: element.__EMPTY_9, lng: element.__EMPTY_10 };
      this.coordinates.push(d);
      console.log("moje");
      console.log(this.coordinates);
    }
    this.sve(this.coordinates);
  }

  visualizeMarker(lat, lng) {
    var newMarker = {
      name: this.markerName,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      draggable: false
    };

    this.markers.push(newMarker);
    this._markerService.addMarker(newMarker);
  }

  sve(checkboxArray) {
     let directionsService = new google.maps.DirectionsService();
     let directionsDisplay = new google.maps.DirectionsRenderer();
    let map = new google.maps.Map(document.getElementById("map"), {
      zoom: 7,
      center: { lat: checkboxArray[0].lat, lng: checkboxArray[0].lng }
    });
     directionsDisplay.setMap(map);
    // calculateAndDisplayRoute(directionsService, directionsDisplay,checkboxArray);

    // function calculateAndDisplayRoute(directionsService, directionsDisplay,checkboxArray) {
    //  console.log('fatim')
    //   console.log(checkboxArray)
    //   console.log('esma')
    //   console.log(directionsService)
    //   var waypts = [];
    //   // var checkboxArray: any[] = [
    //   //   { lat: 52.520008, lng: 13.404954 },
    //   //   { lat: 50.737431, lng: 7.098207 },
    //   //   { lat: 53.551086, lng: 9.993682 }
    //   // ];

    //   // for (var i = 0; i < checkboxArray.length; i++) {
    //   //   waypts.push({
    //   //     location: checkboxArray[i],
    //   //     stopover: true
    //   //   });
    //   // }

    //  // let a=0; let l=[];
    //   // while(a!=checkboxArray.length){
    //   //   l.push(checkboxArray[1], checkboxArray[2]);
    //   //    a++;
    //   //    console.log(l);

    //   //    console.log('hana')
    //   //    console.log(directionsService)
    //      //this.loop(directionsService,directionsDisplay,l)

    //       // for (let i = 0; i < 2; i++) {
    //         // const element = l[i];
    //         // console.log('mama')
    //         // console.log(l[i].lat)
    //         // console.log('tata')
    //         // console.log(l[i].lng)

    //         //  function loop(l){

    //     let l: any[] = [
    //     { lat: 52.520008, lng: 13.404954 },
    //     { lat: 50.737431, lng: 7.098207 }
    //   ];

    //   let r:any[]= [
    //     { lat: 50.737431, lng: 7.098207 },
    //     { lat: 53.551086, lng: 9.993682 }
    //   ];

    //   let h:any[]=[];
    //   h.push(l,r);

    //         for (let i = 0; i < h.length; i++) {

    //           console.log('mmj')
    //           console.log(h[i][0].lat)
    //                directionsService.route(
    //          {
    //            origin: { lat: h[i][0].lat, lng: h[i][0].lng },
    //            destination: { lat: h[i][1].lat, lng: h[i][1].lng },

    //            //waypoints: waypts,
    //            optimizeWaypoints: true,
    //            travelMode: "DRIVING"
    //          }
    //          ,
    //          function(response, status) {
    //            if (status === "OK") {
    //              directionsDisplay.setDirections(response);
    //            } else {
    //              window.alert("Directions request failed due to " + status);
    //            }
    //          }
    //        );
    //         }

    //       // }
    //     // }
    //  // }

    // }

    function renderDirections(result) {
      var directionsRenderer = new google.maps.DirectionsRenderer();
      directionsRenderer.setMap(map);
      directionsRenderer.setDirections(result);
    }

   // var directionsService = new google.maps.DirectionsService();
    function requestDirections(start, end) {
      directionsService.route(
        {
          origin: start,
          destination: end,
          travelMode: google.maps.DirectionsTravelMode.DRIVING
        },
        function(result) {
          renderDirections(result);
        }
      );
    }
    requestDirections('Huntsville, AL', 'Boston, MA');
    requestDirections('Bakersfield, CA', 'Vancouver, BC');
    requestDirections(
      { lat: 52.520008, lng: 13.404954 },
      { lat: 50.737431, lng: 7.098207 }
    );
    requestDirections(
      { lat: 50.737431, lng: 7.098207 },
      { lat: 53.551086, lng: 9.993682 }
    );
    requestDirections(
      { lat: 53.551086, lng: 9.993682 },
      { lat: 58.551086, lng: 10.993682 }
    );
  }

  ngOnInit() {}
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
