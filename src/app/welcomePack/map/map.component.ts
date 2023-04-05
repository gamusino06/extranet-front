
import { SimpleChanges } from '@angular/core';
import { Input } from '@angular/core';
import { Component, AfterViewInit, ViewChild, ElementRef, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user.service';
import { finalize } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements AfterViewInit {
  constructor(
    private userService: UserService,
    private translate: TranslateService
  ) { }

  @Input() dataMap: any;
  @ViewChild("mapContainer", { static: false }) gmap: ElementRef;

  map: google.maps.Map;
  lat = 40.427704;
  lng = -3.66577;
  markers = [];
  elementMarkers: any;
  elementMarkers2: any;
  marker: google.maps.Marker;


  //Coordinates to set the center of the map
  coordinates = new google.maps.LatLng(this.lat, this.lng);

  mapOptions: google.maps.MapOptions = {
    center: this.coordinates,
    zoom: 9
  };

  ngAfterViewInit(): void {
    this.initMarker();
  }


  initMarker() {
    let dataReq = {
      direccion: "",
      listaIdsTiposDelegaciones: [],
      listaIdsLocalidades: [],
      listaIdsProvincias: [],
    }

    this.userService.getDelegaciones(dataReq).pipe(finalize(() => {
      this.elementMarkers.forEach(item => {
        this.refreshMap(item);
      });
    }))
      .subscribe(dataMap => {
        if (dataMap != undefined) {
          this.elementMarkers = [];
          this.markers = [];
          this.elementMarkers = dataMap;
          const aux = new Object({
            latitud: this.lat,
            longitud: this.lng,
            nombre: 'MADRID - RUFINO'
          });
          this.elementMarkers.push(aux);// para iniciar el mapa en madrid
          this.elementMarkers.forEach(element => {
            this.elementMarkers2 = [
              {
                position: new google.maps.LatLng(element.latitud, element.longitud),
                map: this.map,
                title: element.nombre
              }
            ];
            this.markers.push(this.elementMarkers2);
          });
          this.mapInitializer();
        }
      })
  }

  mapInitializer(): void {
    this.map = new google.maps.Map(this.gmap.nativeElement, this.mapOptions);
    //Adding Click event to default marker
    if (this.marker != undefined) {
      this.marker.addListener("click", () => {
        const infoWindow = new google.maps.InfoWindow({
          content: this.marker.getTitle()
        });
        infoWindow.open(this.marker.getMap(), this.marker);
      });

      //Adding default marker to map
      this.marker.setMap(this.map);
    }
    //Adding other markers
    this.loadAllMarkers();

  }

  loadAllMarkers(): void {
    if (this.markers != undefined) {
      this.markers.forEach(markerInfo => {
        //Creating a new marker object
        const marker = new google.maps.Marker({
          ...markerInfo
        });

        //creating a new info window with markers info
        const infoWindow = new google.maps.InfoWindow({
          content: marker.getTitle()
        });

        //Add click event to open info window on marker
        marker.addListener("click", () => {
          infoWindow.open(marker.getMap(), marker);
        });

        //Adding marker to google map
        marker.setMap(this.map);
        if (this.map != undefined) {
          this.map.setZoom(12);
          if (marker.getPosition().lat.arguments != null) {
            this.map.setCenter(marker.getPosition() as google.maps.LatLng);
          }
        }
      });
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    this.refreshMap(changes.dataMap.currentValue);
  }

  refreshMap(any) {
    if (any != null && any != undefined) {
      if (any.latitud != undefined && any.longitud != undefined) {
        if (any.latitud != '' && any.longitud != '') {
          //Creating a new marker object
          const marker = new google.maps.Marker({
            position: new google.maps.LatLng(any.latitud, any.longitud),
            map: this.map,
            title: any.nombre
          });

          //creating a new info window with markers info
          const infoWindow = new google.maps.InfoWindow({
            content: marker.getTitle()
          });

          //Add click event to open info window on marker
          marker.addListener("click", () => {
            infoWindow.open(marker.getMap(), marker);
          });

          //Adding marker to google map
          marker.setMap(this.map);
          if (this.map != undefined) {
            this.map.setZoom(12);
            this.map.setCenter(marker.getPosition() as google.maps.LatLng);
          }
        }
      }
    }
  }



}
