import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SimulationController } from '../../lib/simulation-controller';
import { CesiumComponentComponent } from '../cesium-component/cesium-component.component';
import { Observable, combineLatest, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { DeepReadonly } from 'src/lib/utils/types';
import { FlightInformation } from 'src/lib/socket-events/flight-tracking';
import { NoFlyZoneInfo } from 'src/lib/socket-events/no-fly-zone-tracking';
import { NoFlyZoneEntity } from 'src/lib/simulation-entities/no-fly-zone';
import { AirportNode } from 'src/lib/simulation-entities/airport-node';
import { Plane } from 'src/lib/simulation-entities/plane';
import { PersistenceService } from '../shared/persistence.service';

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

  ngAfterViewInit() {
    this.simulationController = new SimulationController(this.simulationRenderer, this.persistenceService);

    this.addTestData();

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
  }

  public addTestData(): void {
    for (let i = 0; i < 100; i++) {
      let intervalOne = 1155437;
      let intervalTwo  = 1742577;

      this.simulationRenderer.createAirport({
        name: 'AP' + i,
        icaoCode: 'AP' + i,
        coordinates: { latitude: intervalOne * i % 90 - 45, longitude: intervalTwo * i % 360 - 180 },
      });
    }

    /*
    for (let i = 0; i < 100; i++) {
      let loopTestFlight = {
        flightId: 'FL' + i,
        location: {
          latitude: Math.random() * 90 - 45,
          longitude: Math.random() * 360 - 180,
          altitude: 300,
        },
        groundSpeed: 500,
        heading: Math.random() * 360,
        source: {
          name: 'NOAP',
          icaoCode: 'NOAP',
          coordinates: { latitude: 0, longitude: 0 },
        },
        destination: {
          name: 'NOAP',
          icaoCode: 'NOAP',
          coordinates: { latitude: 0, longitude: 0 },
        },
        checkPoints: [0, 0],
      }
      this.simulationRenderer.createFlight(loopTestFlight);

      let loopTestAirport = this.simulationRenderer.getClosestAirport(loopTestFlight);
      if (loopTestAirport != null) {
        this.simulationRenderer.drawAlternatePath(loopTestFlight, loopTestAirport);
      }
    }
    */
    
    //this.simulationRenderer.focus(stuff);
  }
}
