import { Component, OnInit, ɵConsole } from "@angular/core";
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
  path: any[] = [];

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
          label: index,
          id: index
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
          label: this.counter,
          id: this.counter
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
    let newCoordinates = [];
    let c = 0;
    var infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    let path;

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

    google.maps.event.addListener(map, "click", function() {
      console.log("aha");
    });

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

    function createMarker(latLng, label, description, customer, color, id) {
      var org;
      let changed = false;
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
        label: { text: label.toString(), color: "black" },
        position: latLng,
        description: description,
        map: map,
        draggable: false,
        icon: pinIcon
      });
      marker.id = id;
      marker.color = color;

      bounds.extend(marker.getPosition());
      google.maps.event.addListener(marker, "click", function() {
        setInfo(description, customer, marker);
      });

      google.maps.event.addListener(marker, "dblclick", function(event) {
        c++;
        console.log(newCoordinates);

        console.log(marker.position.lat());
        console.log(marker.position.lng());

        var newCoordinate = {
          lat: marker.position.lat(),
          lng: marker.position.lng()
        };
        newCoordinates.push(newCoordinate);

        var label = this.getLabel();
        label.color = "#32CD32";
        this.setLabel(label);

        var pinIconNew = new google.maps.MarkerImage(
          "http://maps.google.com/mapfiles/ms/icons/green.png",

          null /* size is determined at runtime */,
          null /* origin is 0,0 */,
          null /* anchor is bottom center of the scaled image */,
          new google.maps.Size(47, 43)
        );

        var newMarker = new google.maps.Marker({
          position: event.latLng,
          icon: pinIconNew,
          map: map,
          label: { text: c.toString(), color: "black", fontSize: "15px" }
        });

        for (let index = 0; index < newCoordinates.length; index++) {
          if (index + 1 < newCoordinates.length) {
            var src = new google.maps.LatLng(
              parseFloat(newCoordinates[index].lat),
              parseFloat(newCoordinates[index].lng)
            );

            var des = new google.maps.LatLng(
              parseFloat(newCoordinates[index + 1].lat),
              parseFloat(newCoordinates[index + 1].lng)
            );
            draw(src, des);
          }
        }
      });
    }

    function setInfo(description, customer, marker) {
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
      infowindow.open(map, marker);
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
            ? createMarker(
                src,
                markers[i].label,
                name,
                customer,
                "red",
                markers[i].id
              )
            : createMarker(
                src,
                markers[i].label,
                name,
                customer,
                "blue",
                markers[i].id
              );

          var des = new google.maps.LatLng(
            parseFloat(markers[i + 1].lat),
            parseFloat(markers[i + 1].lng)
          );
          var name2 = markers[i + 1].title + " - " + markers[i + 1].description;
          var customer2 = markers[i + 1].customer;

          org == true
            ? createMarker(
                des,
                markers[i + 1].label,
                name2,
                customer2,
                "red",
                markers[i + 1].id
              )
            : createMarker(
                des,
                markers[i + 1].label,
                name2,
                customer2,
                "blue",
                markers[i + 1].id
              );

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

    function draw(src, des) {
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
              strokeColor: "#32CD32",
              strokeOpacity: 2.0,
              strokeWeight: 8
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
