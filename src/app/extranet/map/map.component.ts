import { Component, AfterViewInit, ViewChild, ElementRef, Input, OnChanges, SimpleChanges } from '@angular/core';
import { environment } from '../../../environments/environment';


@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})

export class MapComponent implements OnChanges, AfterViewInit {
  constructor() { }
  environment = environment;
  @Input() mapData: any;
  @Input() idDelegacionSelected: number;
  @Input() address: string;

  @ViewChild("mapContainer") gmap: ElementRef;

  lat = 40.427704;
  lng = -3.66577;
  markers = [];
  refreshMap:boolean = true;

  lost_address:any = [];
  mapaGoogle: google.maps.Map;

  ngAfterViewInit(): void {
    const mapOptions: google.maps.MapOptions = {
      center: new google.maps.LatLng(40.427704, -3.66577), //Madrid
      zoom: 9
    };
    this.mapaGoogle = new google.maps.Map(this.gmap.nativeElement, mapOptions);
  }

  ngOnChanges(changes: SimpleChanges) {
    if(changes.mapData) {
      //clear and delete markers
      this.markers.forEach( (marker: google.maps.Marker) => { marker.setMap(null)});
      this.markers = [];
      this.lost_address = [];

      changes.mapData.currentValue.forEach( item => {
        if(item.latitud != '' && item.longitud != '') {
          this.addMarker(item, new google.maps.LatLng(item.latitud, item.longitud))
        } else {
          this.lost_address.push(item);
        }
      });

      if (this.lost_address.length) {
        this.geocodeLostAddresses(0);
      }

      if (this.markers) {
        setTimeout(() => {

          let [firstMarkerKey] = Object.keys(this.markers);

          if(this.markers[firstMarkerKey] !== undefined && this.refreshMap) {
            this.mapaGoogle.setCenter(this.markers[firstMarkerKey].getPosition());
            this.mapaGoogle.setZoom(5);
          }
        }, 1000);
      }
    }

    if(changes.idDelegacionSelected) {
      let i = changes.idDelegacionSelected.currentValue;
      if (this.markers[i]) {

        this.mapaGoogle.setCenter(this.markers[i].getPosition());
        this.mapaGoogle.setZoom(14);
        //google.maps.event.trigger(this.markers[i], 'click');
      }
    }

    if (changes.address && changes.address.currentValue!==undefined)
    {
          let geocoder = new google.maps.Geocoder();
          var latlng;
          this.geocodeLatLang(changes.address.currentValue).then(place => {
             var latitude = place.geometry.location.lat();
             var longitude = place.geometry.location.lng();

             latlng = new google.maps.LatLng(latitude, longitude);
             this.mapaGoogle.setCenter(latlng);
             this.refreshMap=false;
             this.mapaGoogle.setZoom(18);
          })
          .catch(err => {
            if (environment.debug) console.log(err);
          });
    }
  }

  geocodeLatLang(address: string): Promise<any> {
    const geocoder = new google.maps.Geocoder();
    return new Promise((resolve, reject) => {
      geocoder.geocode(
        {
          address: address
        },
        (results, status) => {
          if (status === google.maps.GeocoderStatus.OK) {
            resolve(results[0]);
          } else {
            reject(new Error(status));
          }
        }
      );
    });
  }

  geocodeLostAddresses(i:number) {
      let geocoder = new google.maps.Geocoder();

      geocoder.geocode( {
        'address': this.lost_address[i].calle + ", " +  this.lost_address[i].cp
      }, (results, status) => {

        if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
          //address not found. remove from array.
          this.lost_address.splice(i, 1);

          //next index is still 0
          if(this.lost_address[i] !== undefined)
            this.geocodeLostAddresses(i);
        }
        if (status == google.maps.GeocoderStatus.OK) {
          this.addMarker( this.lost_address[i], results[0].geometry.location);

          //address found. remove from array. index is next one now
          this.lost_address.splice(i, 1);

          //next index is still 0
          if(this.lost_address[i] !== undefined)
            this.geocodeLostAddresses(i);
        }
        if (status == google.maps.GeocoderStatus.OVER_QUERY_LIMIT) {
          //Geocoder OVER_QUERY_LIMIT. Have to wait more than 1 sec and try again
          setTimeout(() => {
            if(this.lost_address[i] !== undefined)
              this.geocodeLostAddresses(i);
          }, 1200);
        }

    });

  }

  addMarker(item, location: google.maps.LatLng) {
    let contentHtml = "<p>" + item.nombre + "</p>";
    if (item.telefono)
      contentHtml += '<p><i class="fas fa-phone mr-2 ml-4"></i> ' + item.telefono  + "</p>";

    if (item.horario)
      contentHtml += '<p><i class="far fa-clock mr-2 ml-4"></i> ' + item.horario  + "</p>";

    if (item.calle)
      contentHtml += '<p><i class="fas fa-map-marker-alt mr-2 ml-4"></i> ' + item.calle  + "</p>";

    let infowindow = new google.maps.InfoWindow({
      content: contentHtml,
    });
    let marker = new google.maps.Marker({
      position: location,
      map: this.mapaGoogle,
      title: item.nombre
    });
    marker.addListener("click", () => {
      infowindow.open( this.mapaGoogle, marker);
    });
    this.markers[item.idDelegacion] = marker;
  }


}
