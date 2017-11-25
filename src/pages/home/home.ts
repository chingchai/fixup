import { ReportPage } from './../report/report';
import { Component } from '@angular/core';
import { NavController} from 'ionic-angular';
import L from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation';
import { LoadingController } from 'ionic-angular/components/loading/loading-controller';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {
  map: L.map;
  marker: L.marker; 
  pos: number[];

  constructor(
    public loadingCtrl: LoadingController,
    private geolocation: Geolocation,
    public navCtrl: NavController,
    //public navParams: NavParams
  ) {
    
  }

  ionViewDidLoad(){
    this.loadMap();  
  }  

  loadMap(){    
    this.map = L.map('map',{
      center: [13.00, 101.50],
      zoom: 5
    })

    let osm = L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attributions: 'OSM',
      maxZoom: 11
    });

    let mapbox = L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access' +
        '_token=pk.eyJ1IjoicGF0cmlja3IiLCJhIjoiY2l2aW9lcXlvMDFqdTJvbGI2eXUwc2VjYSJ9.trTzs' +
        'dDXD2lMJpTfCVsVuA').addTo(this.map);

    let baseLayers = {
      "Mapbox": mapbox,
      "OpenStreetMap": osm
    };

    let overlays = {
      //"hcenter": hcenter,
      //"dengue": dengue
    };
    L.control.layers(baseLayers, overlays).addTo(this.map);

    this.showLocation();
  }

  showLocation() {  
    let loading = this.loadingCtrl.create({
      content: 'Please wait...'
    });
    loading.present();
    
    this.geolocation.getCurrentPosition().then((res) => {      
      // resp.coords.latitude
      // resp.coords.longitude
      //let pos=[res.coords.latitude, res.coords.longitude]; 
      
      this.pos=[res.coords.latitude, res.coords.longitude];
      //let pos = [res.coords.latitude, res.coords.longitude];
      this.map.setView(this.pos, 16);
      this.marker = L.marker(this.pos, {draggable: true}).addTo(this.map);
      loading.dismiss();

      // drage marker
      this.marker.on("dragend", function (e) {
        this.pos = [e.target._latlng.lat, e.target._latlng.lng];          
      });
     }).catch((error) => {
       console.log('Error getting location', error);
     });      
  }

  gotoReport(){
    this.navCtrl.push(ReportPage, {
      location: this.pos
    })
  }

}
