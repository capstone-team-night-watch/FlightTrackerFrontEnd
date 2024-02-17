import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { CesiumService } from '../cesium.service';
import { SocketService } from '../socket.service';
import { MatDrawer, MatSidenav } from '@angular/material/sidenav';


@Component({
  selector: 'app-cesium-component',
  templateUrl: './cesium-component.component.html',
  styleUrls: ['./cesium-component.component.css']
})
export class CesiumComponentComponent implements OnInit {
  
  id!: string | null;
  zoneName: string;
  flightIcao: string;


  constructor(
    private cesium: CesiumService,
    private route: ActivatedRoute,
    private socket: SocketService
  ) { }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params: ParamMap) => {
      this.id = params.get('id');
      console.log(this.id);
    })

    //console.log("CESIUM SERVICE: " + this.cesium);

    // this.socket.connectToConsumer(this.cesium.flyToAndPlotPoint)
    // this.socket.connectToConsumer();
  }

  hideEllip() {
    this.cesium.hideEllipsoidNoFlyz();
  }

  hideRect() {
    this.cesium.hideRectangleNoFlyz();
  }

  hidePoly() {
    this.cesium.hidePolygonNoFlys();
  }

  hideMilitaryBases() {
    this.cesium.hideMilitaryBasesNoFlyz();
  }

  hideSelected() {
    this.cesium.hideSelected();
  }

  reset() {
    this.cesium.resetEntities();
  }

  deleteNoFly(){
    this.cesium.deleteNoFlyZone();
  }

  findZone() {
    this.cesium.flyToNoFlyZone(this.zoneName);
  }

  findFlight() {
    this.cesium.findFlight(this.flightIcao);
  }
  

}
