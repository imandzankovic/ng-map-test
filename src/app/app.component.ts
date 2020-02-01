import { Component } from "@angular/core";
import { MarkerManager } from "@agm/core";
import { MouseEvent } from "@agm/core";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"]
})
export class AppComponent {
  title = "mapit";
  // Zoom level
  zoom: number = 8;
  // Start position
  lat: number = 51.673858;
  lng: number = 7.815982;
  
  // Values
  markerName:string;
  markerLat:string;
  markerLng:string;
  markerDraggable:string;
  
  // Markers
  markers: marker[] = [
    {
      lat: 51.673858,
      lng: 7.815982,
      label: "A",
      draggable: true
    },
    {
      lat: 51.373858,
      lng: 7.215982,
      label: "B",
      draggable: false
    },
    {
      lat: 51.723858,
      lng: 7.895982,
      label: "C",
      draggable: true
    }
  ];

  mapClicked($event: MouseEvent) {
    this.markers.push({
      lat: $event.coords.lat,
      lng: $event.coords.lng,
      draggable: false
    });
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
  }

  addMarker(){
    console.log('adding marker');
    if(this.markerDraggable == 'yes'){
      var isDraggable = true;

    }else{
      var isDraggable = false;
    }

    var newMarker={
      name:this.markerName,
      lat: parseFloat(this.markerLat),
      lng:parseFloat(this.markerLng),
      draggable:isDraggable
    }


    this.markers.push(newMarker);
  }

  clickedMarker(label: string, index: number) {
    console.log(`clicked the marker: ${label || index}`);
  }
}

// just an interface for type safety.
interface marker {
  lat: number;
  lng: number;
  label?: string;
  draggable: boolean;
}
