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
  nCounter: number = 0;
  orgID: any;

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
      this.orgID = elements[1].__EMPTY_1;
      // this.visualizeMarker(element.__EMPTY_9,element.__EMPTY_10);
      // if (element.__EMPTY_1 == 282100) {
      if (elements[index].__EMPTY_1 == this.orgID) {
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
            element.__EMPTY_5 +
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

    this.displayCoordinates(this.coordinates, this.cors);
  }

  displayCoordinates(markers, markers2) {
    let map = null;
    let c = 0;
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
    map = new google.maps.Map(document.getElementById("map"), mapOptions);

    let polyOptions = {
      strokeColor: "#008000",
      strokeOpacity: 1.0,
      strokeWeight: 1,
      geodesic: true
    };

    let polyLine = new google.maps.Polyline(polyOptions);
    polyLine.setMap(map);

    handleMarkers(markers, true);
    handleMarkers(markers2, false);

    function createMarker(latLng, label, description, customer, color) {
      var org;
      color == "red" ? (org = true) : (org = false);

      var pinIcon = new google.maps.MarkerImage(
        "http://maps.google.com/mapfiles/ms/icons/" + color + ".png",
        //  "http://maps.gstatic.com/mapfiles/markers2/boost-marker-mapview.png",

        null /* size is determined at runtime */,
        null /* origin is 0,0 */,
        null /* anchor is bottom center of the scaled image */,
        new google.maps.Size(47, 43)
      );

      var marker = new google.maps.Marker({
        label: label.toString(),
        position: latLng,
        description: description,
        map: map,
        draggable: false,
        icon: pinIcon
      });

      bounds.extend(marker.getPosition());
      google.maps.event.addListener(marker, "click", function() {
        setInfo(description, customer);
      });

      google.maps.event.addListener(marker, "dblclick", function(event) {
        console.log(c);
        ++c;
        handleNewRoute(event, c, org);
      });
    }

    function handleNewRoute(event, c, org) {
      let i;
      org == true ? (i = DeleteMarker(markers)) : (i = DeleteMarker(markers2));

      polyLine.setMap(map);

      var path = polyLine.getPath();
      path.push(event.latLng);

      var pinIconNew = new google.maps.MarkerImage(
        "http://maps.google.com/mapfiles/ms/icons/green.png",

        null /* size is determined at runtime */,
        null /* origin is 0,0 */,
        null /* anchor is bottom center of the scaled image */,
        new google.maps.Size(47, 43)
      );

      var marker = new google.maps.Marker({
        position: event.latLng,
        icon: pinIconNew,
        map: map,
        label: c.toString()
      });

      if (org == true) {
        markers[i].label = "";
        markers[i] = marker;
        console.log(markers[i]);
      } else {
        markers2[i].label = "";
        markers2[i] = marker;
        console.log(markers[i]);
      }

      map.setCenter(event.latLng);
    }
    function setInfo(description, customer) {
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
    }
    function handleMarkers(markers, org) {
      for (var i = 0; i < markers.length; i++) {
        if (i + 1 < markers.length) {
          var src = new google.maps.LatLng(
            parseFloat(markers[i].lat),
            parseFloat(markers[i].lng)
          );

          var name = markers[i].title + " - " + markers[i].description;
          var customer = markers[i].customer;

          org == true
            ? createMarker(src, markers[i].label, name, customer, "red")
            : createMarker(src, markers[i].label, name, customer, "blue");

          var des = new google.maps.LatLng(
            parseFloat(markers[i + 1].lat),
            parseFloat(markers[i + 1].lng)
          );
          var name2 = markers[i + 1].title + " - " + markers[i + 1].description;
          var customer2 = markers[i + 1].customer;

          org == true
            ? createMarker(des, markers[i + 1].label, name2, customer2, "red")
            : createMarker(des, markers[i + 1].label, name2, customer2, "blue");

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
                  strokeColor: org == true ? "#F3443C" : "#0000FF",
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
    }
    function DeleteMarker(markers) {
      //Find and remove the marker from the Array
      for (var i = 0; i < markers.length; i++) {
        // if (markers[i].id == id) {
        //Remove the marker from Map
        var marker = new google.maps.Marker({
          position: new google.maps.LatLng(markers[i][1], markers[i][2]),
          map: map
        });

        markers[i] = marker;
        markers[i].setMap(null);

        //Remove the marker from array.
        markers.splice(i, 1);
        return i;
        // }
      }
    }
    // function DeleteMarker(id,markers) {
    //   //Find and remove the marker from the Array
    //   for (var i = 0; i < markers.length; i++) {
    //       if (markers[i].id == id) {
    //           //Remove the marker from Map
    //           markers[i].setMap(null);

    //           //Remove the marker from array.
    //           markers.splice(i, 1);
    //           return;
    //       }
    //   }
    // }
    // }
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
