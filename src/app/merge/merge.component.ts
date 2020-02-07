import { Component, OnInit } from '@angular/core';
declare var google: any;
@Component({
  selector: 'app-merge',
  templateUrl: './merge.component.html',
  styleUrls: ['./merge.component.css']
})
export class MergeComponent implements OnInit {

  constructor() { }

   map : any;
 polyLine : any;
polyOptions : any;

 initialize() {
    
    var mapOptions = {
        zoom: 5,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: new google.maps.LatLng(0,0)
    };

    let map = new google.maps.Map(document.getElementById('map'), mapOptions);

    this.polyOptions = {
        strokeColor: '#008000',
        strokeOpacity: 1.0,
        strokeWeight: 1,
        geodesic: true,
    }

    let polyLine = new google.maps.Polyline(this.polyOptions);
    polyLine.setMap(map);
    
    google.maps.event.addListener(map, 'click', function(event) {

        addPoint(event);
    }); 
    function addPoint(event) {
 
    var path = polyLine.getPath();
    path.push(event.latLng);

    var marker = new google.maps.Marker({
        position: event.latLng,
        map: map,
    });
    
    map.setCenter(event.latLng);
    let markers=[];
    markers.push(marker);
  google.maps.event.addListener(marker, 'dblclick', function(event) {

      DeleteMarker(markers);
      var path = polyLine.getPath();
      path.push(event.latLng);
  
      var pinIconNew = new google.maps.MarkerImage(
        "http://maps.google.com/mapfiles/ms/icons/green.png",
      //  "http://maps.gstatic.com/mapfiles/markers2/boost-marker-mapview.png",
      
        null, /* size is determined at runtime */
        null, /* origin is 0,0 */
        null, /* anchor is bottom center of the scaled image */
        new google.maps.Size(47,43)
    );
    
      var marker = new google.maps.Marker({
          position: event.latLng,
          icon:pinIconNew,
          map: map,
          
      });
    
      map.setCenter(event.latLng);
      
  }); 
}
  
function DeleteMarker(markers) {
  //Find and remove the marker from the Array
  for (var i = 0; i < markers.length; i++) {
      // if (markers[i].id == id) {
          //Remove the marker from Map                  
          markers[i].setMap(null);

          //Remove the marker from array.
          markers.splice(i, 1);
          return;
      // }
  }
}
}


  ngOnInit() {
    this.initialize()
  }

}
