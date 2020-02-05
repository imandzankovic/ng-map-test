import { Component, OnInit } from "@angular/core";
declare var google: any;
import * as XLSX from "xlsx";
import { MarkerService } from "../services/marker.service";
declare var google: any;

@Component({
  selector: "app-cmap",
  templateUrl: "./cmap.component.html",
  styleUrls: ["./cmap.component.css"]
})
export class CmapComponent implements OnInit {
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
  cors: any[] = [];
  counter: number = 0;
  orgID : any;

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
      this.orgID=elements[1].__EMPTY_1;
      // this.visualizeMarker(element.__EMPTY_9,element.__EMPTY_10);
      // if (element.__EMPTY_1 == 282100) {
        if(elements[index].__EMPTY_1 == this.orgID){
        console.log("hajra");
        console.log(element.__EMPTY_1);
        var d = {
          customer:
            element.__EMPTY_3 +
            " - " +
            element.__EMPTY_4 +
            " - " +
            element.__EMPTY_5 +
            " - " +
            element.__EMPTY_7 +
            "  " +
            element.__EMPTY_8,
          title: element.__EMPTY_11 + " " + element.__EMPTY_12,
          description: element.__EMPTY_14 + ", " + element.__EMPTY_15,
          lat: element.__EMPTY_9,
          lng: element.__EMPTY_10,
          label: index
        };

        this.coordinates.push(d);
        console.log("moje");
        console.log(this.coordinates);
      } else {
         ++this.counter;
        console.log(element.__EMPTY_1);
        var s = {
          customer:
            element.__EMPTY_3 +
            " - " +
            element.__EMPTY_4 +
            " - " +
            //Number.parseFloat(element.__EMPTY_5).toFixed(2)
            element.__EMPTY_5
            +
            " - " +
            element.__EMPTY_7 +
            "  " +
            element.__EMPTY_8,
          title: element.__EMPTY_11 + " " + element.__EMPTY_12,
          description: element.__EMPTY_14 + ", " + element.__EMPTY_15,
          lat: element.__EMPTY_9,
          lng: element.__EMPTY_10,
          label: this.counter
        };

        this.cors.push(s);
        console.log("moje 223");
        console.log(this.cors);
      }
    }

    this.sve(this.coordinates, this.cors);
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

  sve(markers, markers2) {
    console.log("ovo je uslo:");
    console.log(markers);
    console.log("i ovo :");
    console.log(markers2);
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

        var name = markers[i].title + " - " + markers[i].description;
        var customer = markers[i].customer;
        createMarker(src, markers[i].label, name, customer,false);

        var des = new google.maps.LatLng(
          parseFloat(markers[i + 1].lat),
          parseFloat(markers[i + 1].lng)
        );
        var name2 = markers[i + 1].title + " - " + markers[i + 1].description;
        var customer2 = markers[i + 1].customer;
        createMarker(des, markers[i + 1].label, name2, customer2,false);
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
                strokeWeight: 2
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

    for (var i = 0; i < markers2.length; i++) {
      if (i + 1 < markers2.length) {
        var src = new google.maps.LatLng(
          parseFloat(markers2[i].lat),
          parseFloat(markers2[i].lng)
        );

        var name = markers2[i].title + " - " + markers2[i].description;
        var customer = markers2[i].customer;
        createMarker(src, markers2[i].label, name, customer,true);

        var des = new google.maps.LatLng(
          parseFloat(markers2[i + 1].lat),
          parseFloat(markers2[i + 1].lng)
        );
        var name2 = markers2[i + 1].title + " - " + markers2[i + 1].description;
        var customer2 = markers2[i + 1].customer;
        createMarker(des, markers2[i + 1].label, name2, customer2,true);
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
                strokeColor: "#0000FF",
                strokeOpacity: 1.0,
                strokeWeight: 2
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

    function createMarker(latLng, label, description, customer,color) {
      var pinIcon = new google.maps.MarkerImage(
        "http://maps.google.com/mapfiles/ms/icons/blue.png",
      //  "http://maps.gstatic.com/mapfiles/markers2/boost-marker-mapview.png",
      
        null, /* size is determined at runtime */
        null, /* origin is 0,0 */
        null, /* anchor is bottom center of the scaled image */
        new google.maps.Size(47,43)
    );

    var pinIcon2 = new google.maps.MarkerImage(
      "http://maps.google.com/mapfiles/ms/icons/red.png",
    //  "http://maps.gstatic.com/mapfiles/markers2/boost-marker-mapview.png",
    
      null, /* size is determined at runtime */
      null, /* origin is 0,0 */
      null, /* anchor is bottom center of the scaled image */
      new google.maps.Size(47,43)
  );
      console.log("hej ana ana");
      console.log(description);
      if(color){
         var marker = new google.maps.Marker({
        label: label.toString(),
        position: latLng,
        description: description,
        map: map,
        draggable: false,
        icon: pinIcon
        // {
        //   url: "http://maps.google.com/mapfiles/ms/icons/blue.png"
         
        // }
      });
      }else{
        var marker = new google.maps.Marker({
          label: label.toString(),
          position: latLng,
          description: description,
          map: map,
          draggable: false,
          icon: pinIcon2
        });
      }
     
      bounds.extend(marker.getPosition());
      google.maps.event.addListener(marker, "click", function(evt) {
        //infowindow.setContent("coord:" + this.getPosition().toUrlValue(6));
        var contentString =
          '<div id="content">' +
          '<div id="siteNotice">' +
          "</div>" +
          '<div id="bodyContent">' +
          "<p> Location : <b>" +
          description +
          "</b>" +
          "<p> Customer : <b>" +
          customer +
          "</b>" +
          "</div>" +
          "</div>";
        infowindow.setContent(contentString);
        //infowindow.setContent(label);
        infowindow.open(map, this);
      });
    }
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
