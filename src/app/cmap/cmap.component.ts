import { Component, OnInit, ɵConsole } from "@angular/core";
declare var google: any;
import * as XLSX from "xlsx";
import { MarkerService } from "../services/marker.service";
declare var google: any;
declare var $: any;

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
  counter: number = 1;
  nCounter: number = 0;
  orgID: any;
  path: any[] = [];
  showData: boolean = false;
 times=[];

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

      var d = {
        customer: {
          tourName: element.__EMPTY_2,
          time: element.__EMPTY_3,
          careCode: element.__EMPTY_4,
          careTime: element.__EMPTY_5,
          careRevenue: element.__EMPTY_6,
          custName: element.__EMPTY_7,
          custFName: element.__EMPTY_8
        },

        title: {
          custStreet: element.__EMPTY_11,
          custStreetNumber: element.__EMPTY_12
        },
        description: {
          custCity: element.__EMPTY_14,
          custCountry: element.__EMPTY_15
        },
        lat: element.__EMPTY_9,
        lng: element.__EMPTY_10,
        label: index,
        id: index
      };

      elements[index].__EMPTY_1 == this.orgID
        ? this.coordinates.push(d)
        : this.otherOrg(d)
    }

    this.displayCoordinates(this.coordinates, this.cors);
  }

  otherOrg(d){
   var a= this.counter++;
   console.log(a)
    d.id=a;
    d.label=a;
    this.cors.push(d);
  }
  displayCoordinates(markers, markers2) {
    let map = null;
    let newCoordinates = [];
    let c = 0;
    let dTime=0;
    var infowindow = new google.maps.InfoWindow();
    var bounds = new google.maps.LatLngBounds();
    // let cIndex : any = 0;
    let list=[];

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

    function createMarker(
      latLng,
      label,
      customer,
      color,
      id,
      description,
      title
    ) {
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
        label: { text: label.toString(), color: "black" },
        position: latLng,
        description: description,
        customer: customer,
        map: map,
        draggable: false,
        icon: pinIcon
      });
      marker.id = id;
      marker.color = color;

      bounds.extend(marker.getPosition());
      google.maps.event.addListener(marker, "click", function() {
        setInfo(description, customer, title, marker);
      });

      google.maps.event.addListener(marker, "dblclick", function(event) {
        c++;
       let times=[];
       list.push(marker.customer.careTime.slice(0,2))
       console.log('muss ich leben')
       console.log(list) 

        var newCoordinate = {
          lat: marker.position.lat(),
          lng: marker.position.lng(),
          customer: marker.customer
        };
  
        let cIndex : any = 0;
       
        for (let index = 0; index < list.length; index++) {
          cIndex+=parseInt(list[index]);
          console.log('ajmo')
          console.log(cIndex)
          
        }
        $("#staticCareTime").val(
          cIndex + ' minutes'
        );
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
       
            if (index == 0) {
              setRouteInfo(newCoordinates[0].customer, index + 1);
            }

            
            addNewInfo(newCoordinates[index + 1].customer, c + 1);
          
            var src = new google.maps.LatLng(
              parseFloat(newCoordinates[index].lat),
              parseFloat(newCoordinates[index].lng)
            );

            var des = new google.maps.LatLng(
              parseFloat(newCoordinates[index + 1].lat),
              parseFloat(newCoordinates[index + 1].lng)
            );
          
           draw(src, des,times);

          }
        }
      });
    }

    function setInfo(description, customer, title, marker) {
      console.log(customer);
      var contentString =
        '<div id="content">' +
        '<div id="siteNotice">' +
        "</div>" +
        '<div id="bodyContent">' +
        "<p> Location : <b>" +
        title.custStreet +
        " " +
        title.custStreetNumber +
        " - " +
        description.custCity +
        " , " +
        description.custCountry +
        "</b>" +
        "<p> Customer : <b>" +
        customer.time +
        " - " +
        customer.careCode +
        " - " +
        customer.careTime +
        " - " +
        customer.careRevenue +
        " - " +
        customer.custFName +
        " " +
        customer.custName +
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

          org == true
            ? createMarker(
                src,
                markers[i].label,
                markers[i].customer,
                "red",
                markers[i].id,
                markers[i].description,
                markers[i].title
              )
            : createMarker(
                src,
                markers[i].label,
                markers[i].customer,
                "blue",
                markers[i].id,
                markers[i].description,
                markers[i].title
              );

          var des = new google.maps.LatLng(
            parseFloat(markers[i + 1].lat),
            parseFloat(markers[i + 1].lng)
          );

          org == true
            ? createMarker(
                des,
                markers[i + 1].label,
                markers[i + 1].customer,
                "red",
                markers[i + 1].id,
                markers[i + 1].description,
                markers[i + 1].title
              )
            : createMarker(
                des,
                markers[i + 1].label,
                markers[i + 1].customer,
                "blue",
                markers[i + 1].id,
                markers[i + 1].description,
                markers[i + 1].title
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

    
    function draw(src, des,times) {
       
      service.route(
        {
          origin: src,
          destination: des,
          travelMode: google.maps.DirectionsTravelMode.DRIVING
        },
        function(result, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            console.log('zeit')
              console.log( result.routes[0].legs[0].duration.text );
              times.push( (result.routes[0].legs[0].duration.text).slice(0,2) )

              var dIndex : any = 0;
              for (let j = 0; j < times.length; j++) {
          
                dIndex+=(parseInt(times[j]));
     
              }

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

            $("#staticDrivingTime").val(dIndex + ' minutes');
            var s=parseInt(parseInt($("#staticCareTime").val().slice(0,2)) + dIndex)
            $("#staticExpectedTTime").val(
             s + ' minutes'
            );
          }
        }
      );
 
    }

    function setRouteInfo(customer, index) {
      $("#dvPassport").show();
      console.log(customer.time);
      console.log(customer.time.slice(0, 10));
      console.log(customer.time.slice(13));
      console.log(customer.careTime);
      // var day=30;
      var minutes = 45;
      $("#staticTourname").val(customer.tourName);
      $("#staticStartTime").val(
        customer.time.slice(13) + " " + customer.time.slice(0, 10)
      );
      $("#staticCustomerOverhead").val(minutes);
      $("#staticClient").val(
        // index +
          "     " +
          customer.custFName +
          " " +
          customer.custName +
          "  " +
          customer.time.slice(13) +
          "  " +
          customer.careTime
      );
      $("#staticCareCode").val(customer.careCode);
    }


    function addNewInfo(customer, index) {
     
      var staticClient =
        // index +
        "     " +
        customer.custFName +
        " " +
        customer.custName +
        "  " +
        customer.time.slice(13) +
        "  " +
        customer.careTime;

      var someID = customer.custFName;

      var content =
        '<input id="' +
        someID +
        '" value="' +
        staticClient +
        '" class="form-control-plaintext">';
       
        var inputs = $("#newRow :input");
        
        var seen ={};
        $("#newRow :input").each(function(){
          var va=$(this).val();
          console.log(va)
          if(seen[va]){
            console.log('uslo jednom')
             $(this).remove();
          }
         
          else 
          seen[va]=true;
        });
           $("#newRow").append(
        content
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
