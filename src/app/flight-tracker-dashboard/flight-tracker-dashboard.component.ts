import { Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SimulationController } from '../../lib/simulation-controller';
import { Url } from '../../lib/utils/url';
import { CesiumService } from '../cesium.service';
import { HttpClient } from '@angular/common/http';
import { CesiumComponentComponent } from '../cesium-component/cesium-component.component';

@Component({
  selector: 'app-flight-tracker-dashboard',
  templateUrl: './flight-tracker-dashboard.component.html',
  styleUrls: ['./flight-tracker-dashboard.component.css'],
})
export class FlightTrackerDashboardComponent implements OnInit {
  private simulationController: SimulationController;
  @ViewChild('simulationRenderer') simulationRenderer: CesiumComponentComponent ;

  constructor(private _snackBar: MatSnackBar, private cesium: CesiumService) {}

  ngOnInit() {
    try {
      this.simulationController = new SimulationController();
    } catch (exception) {
      this._snackBar.open('Failed to connect to consumer socket', 'Close');
    }

    this.simulationController.onColision(() => {
      this._snackBar.open('Collision Detected', 'Close');
    });

    this.cesium.setUpViewer('cesium');
    this.cesium.getAndLoadNoFlyZones();
  }
}
