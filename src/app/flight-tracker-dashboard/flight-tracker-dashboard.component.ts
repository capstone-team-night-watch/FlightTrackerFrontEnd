import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SimulationController } from '../../lib/simulation-controller';
import { CesiumComponentComponent } from '../cesium-component/cesium-component.component';
import { Observable, combineLatest, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { DeepReadonly } from 'src/lib/utils/types';
import { FlightInformation } from 'src/lib/socket-events/flight-tracking';
import { PolygonNoFlyZone, CircularNoFlyZone, NoFlyZoneInfo } from 'src/lib/socket-events/no-fly-zone-tracking';
import { NoFlyZoneEntity } from 'src/lib/simulation-entities/no-fly-zone';
import { AirportNode } from 'src/lib/simulation-entities/airport-node';
import { Plane } from 'src/lib/simulation-entities/plane';
import { PersistenceService } from '../shared/persistence.service';
import { Cartesian2, Cartesian3 } from 'cesium';

@Component({
  selector: 'app-flight-tracker-dashboard',
  templateUrl: './flight-tracker-dashboard.component.html',
  styleUrls: ['./flight-tracker-dashboard.component.css'],
})
export class FlightTrackerDashboardComponent implements AfterViewInit {
  @ViewChild('simulationRenderer') simulationRenderer: CesiumComponentComponent;

  private simulationController: SimulationController;

  public filter = new FormControl('');

  public flights$: Observable<DeepReadonly<Plane[]>>;
  public noFlyZones$: Observable<DeepReadonly<NoFlyZoneEntity[]>>;

  public flights: DeepReadonly<Plane[]> = [];
  public noFlyZones: DeepReadonly<NoFlyZoneEntity[]> = [];

  constructor(private _snackBar: MatSnackBar, private persistenceService: PersistenceService) {}

  /**
   * Gets flights and no-fly-zones from the simulation controller.
   */
  ngAfterViewInit() {
    this.simulationController = new SimulationController(this.simulationRenderer, this.persistenceService);

    this.flights$ = this.simulationController.events.flightListUpdated.intoObservable();
    this.noFlyZones$ = this.simulationController.events.noFlyZoneListUpdated.intoObservable();

    combineLatest([
      this.flights$.pipe(startWith([])),
      this.filter.valueChanges.pipe(startWith('')),
      this.noFlyZones$.pipe(startWith([])),
    ]).subscribe((values) => {
      const [flights, filter, noFlyZones] = values;

      this.flights = flights.filter((f) => f.flightInformation.flightId.includes(filter ?? ''));

      this.noFlyZones = noFlyZones.filter((f) => f.info.id.includes(filter ?? ''));
    });

    this.simulationController.events.message.addHandler((message) => {
      this._snackBar.open(message.message, '', {
        duration: 1000_000,
      });
    });

    setTimeout(() => {
      this.simulationController.initialize();
    }, 2000);

    this.addTestData();
  }

  /**
   * Used to insert test data into the Cesium viewer.
   */
  public addTestData(): void {
    for (let i = 0; i < 100; i++) {
      this.simulationRenderer.createAirport({
        name: 'AP' + i,
        icaoCode: 'AP' + i,
        coordinates: { latitude: Math.random() * 90 - 45, longitude: Math.random() * 360 - 180 },
      });
    }
  }
}