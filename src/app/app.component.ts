import { Component } from "@angular/core";
import { MouseEvent } from "@agm/core";
import { MarkerService } from "./services/marker.service";

@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
  providers: [MarkerService]
})
export class AppComponent {
  title = "mapit";
  // Zoom level
  zoom: number = 8;
  // Start position
  lat: number = 51.673858;
  lng: number = 7.815982;

  // Values
  markerName: string;
  markerLat: string;
  markerLng: string;
  markerDraggable: string;

  // Markers
  markers: marker[] = [];

  constructor(private _markerService: MarkerService) {
    this.markers = this._markerService.getMarkers();
  }

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
    for(var i=0; i < this.markers.length;i++){

      if(marker.lat == this.markers[i].lat && marker.lng == this.markers[i].lng){
        this.markers.splice(i,1);
      }
    }

    this._markerService.removeMarker(marker);
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
