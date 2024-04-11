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
    this.simulationRenderer.CreateCircularNoFlyZone({
      id: 'No Fly Zone Id',
      altitude: 100_000,
      createdAt: 'Now brother',
      notamNumber: ' NO Fly zone number',
      type: 'CIRCLE',
      radius: 300_000,
      center: {
        latitude: 41.25716,
        longitude: -95.995102,
      },
    });

    var stuff = this.simulationRenderer.CreatePolygonNoFlyZone({
      id: 'No Fly Zone Id',
      altitude: 100_000,
      createdAt: 'Now brother',
      notamNumber: ' NO Fly zone number',
      type: 'POLYGON',
      vertices: [
        {
          latitude: 41.25716,
          longitude: -95.995102,
        },
        {
          latitude: 20.25716,
          longitude: -95.995102,
        },
        {
          latitude: 30.25716,
          longitude: -85.995102,
        },
      ],
    });

    this.simulationRenderer.drawAlternatePath(
      {
        flightId: 'TS1234',
        location: {
          latitude: 45,
          longitude: -70,
          altitude: 300,
        },
        groundSpeed: 500,
        heading: 135,
        source: {
          name: 'KJFK',
          icaoCode: 'KJFK',
          coordinates: { latitude: 35, longitude: -60 },
        },
        destination: {
          name: 'IDEK',
          icaoCode: 'IDEK',
          coordinates: { latitude: 55, longitude: -80 },
        },
        checkPoints: [35, -60, 45, 75, 55, -80],
      },
      {
        name: 'TST3',
        icaoCode: 'TST3',
        coordinates: { latitude: 45, longitude: -50 },
      }
    );

    let firstFlight = this.simulationRenderer.createFlight({
      flightId: 'TS1234',
      location: {
        latitude: 45,
        longitude: -70,
        altitude: 300,
      },
      groundSpeed: 500,
      heading: 135,
      source: {
        name: 'TST1',
        icaoCode: 'TST1',
        coordinates: { latitude: 35, longitude: -60 },
      },
      destination: {
        name: 'TST2',
        icaoCode: 'TST2',
        coordinates: { latitude: 55, longitude: -80 },
      },
      checkPoints: [35, -60, 45, -70, 55, -80],
    });

    this.simulationRenderer.drawTrackedPath(
      {
        flightId: 'TS1234',
        location: {
          latitude: 45,
          longitude: -70,
          altitude: 300,
        },
        groundSpeed: 500,
        heading: 135,
        source: {
          name: 'TST1',
          icaoCode: 'TST1',
          coordinates: { latitude: 35, longitude: -60 },
        },
        destination: {
          name: 'TST2',
          icaoCode: 'TST2',
          coordinates: { latitude: 55, longitude: -80 },
        },
        checkPoints: [45, -60, 40, -65, 45, -70, 50, -75, 55, -80],
      },
      [
        { latitude: 43, longitude: -70 },
        { latitude: 47, longitude: -70 },
      ]
    );

    this.simulationRenderer.createAirport({
      name: 'KJFK',
      icaoCode: 'KJFK',
      coordinates: { latitude: 40.641766, longitude: -73.780968 },
    });

    //this.simulationRenderer.focus(stuff);
  }
}
