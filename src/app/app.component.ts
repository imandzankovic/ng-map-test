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
      
      // this.visualizeMarker(element.__EMPTY_9,element.__EMPTY_10);

      var d = {
        customer: element.__EMPTY_3 + ", " + element.__EMPTY_4 + " " + element.__EMPTY_5 + ", " + element.__EMPTY_7 + ", " + element.__EMPTY_8 ,
        title: element.__EMPTY_11 + " " + element.__EMPTY_12,
        description: element.__EMPTY_14 + ", " + element.__EMPTY_15,
        lat: element.__EMPTY_9,
        lng: element.__EMPTY_10,
        label:index
      };

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

  sve(markers) {
    var map = null;
    var infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();

    var mapOptions = {
      center: new google.maps.LatLng(
        parseFloat(markers[0].lat),
        parseFloat(markers[0].lng)
      ),
      zoom: 15,
      mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var service = new google.maps.DirectionsService();

    var infoWindow = new google.maps.InfoWindow();
    map = new google.maps.Map(document.getElementById("map"), mapOptions);
    var lat_lng = new Array();

    var marker = new google.maps.Marker({
      position: map.getCenter(),
      map: map,
      draggable: true
    });
    bounds.extend(marker.getPosition());
    google.maps.event.addListener(marker, "click", function(evt) {
      infowindow.setContent("coord:" + marker.getPosition().toUrlValue(6));
      infowindow.open(map, marker);
    });
    for (var i = 0; i < markers.length; i++) {
      if (i + 1 < markers.length) {
        var src = new google.maps.LatLng(
          parseFloat(markers[i].lat),
          parseFloat(markers[i].lng)
        );

        var name=markers[i + 1].title + ' - ' + markers[i + 1].description;
        var customer = markers[i + 1].customer;
        createMarker(src,markers[i].label,name,customer);

        var des = new google.maps.LatLng(
          parseFloat(markers[i + 1].lat),
          parseFloat(markers[i + 1].lng)
        );
        var name2=markers[i + 1].title + ' - ' + markers[i + 1].description;
        var customer2 = markers[i + 1].customer;
        createMarker(des,markers[i + 1].label, name2, customer2);
        //  poly.setPath(path);
        service.route(
          {
            origin: src,
            destination: des,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
          },
          function(result, status) {
            if (status == google.maps.DirectionsStatus.OK) {
              var path = new google.maps.MVCArray();
              var poly = new google.maps.Polyline({
                map: map,
                 strokeColor: "#F3443C",
                 strokeOpacity: 1.0,
                 strokeWeight: 2,
              });
              for (
                var i = 0, len = result.routes[0].overview_path.length;
                i < len;
                i++
              ) {
                path.push(result.routes[0].overview_path[i]);
              }
              poly.setPath(path);
              map.fitBounds(bounds);
            }
          }
        );
      }
    }

    function createMarker(latLng,label,description,customer) {
      console.log('hej ana ana')
      console.log(description)
      var marker = new google.maps.Marker({
        label: label.toString(),
        position: latLng,
        description : description,
        map: map,
        draggable: true
      });
      bounds.extend(marker.getPosition());
      google.maps.event.addListener(marker, "click", function(evt) {
        //infowindow.setContent("coord:" + this.getPosition().toUrlValue(6));
        var contentString = '<div id="content">'+
        '<div id="siteNotice">'+
        '</div>'+
        '<div id="bodyContent">'+
        '<p> Location : <b>' + description +'</b>' +
        '<p> Customer : <b>' + customer +'</b>' +
        '</div>'+
        '</div>';
        infowindow.setContent(contentString);
        //infowindow.setContent(label);
        infowindow.open(map, this);
      });
    }
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