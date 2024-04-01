import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SimulationController } from '../../lib/simulation-controller';
import { CesiumComponentComponent } from '../cesium-component/cesium-component.component';
import { Observable, combineLatest, startWith } from 'rxjs';
import { FormControl } from '@angular/forms';
import { DeepReadonly } from 'src/lib/utils/types';
import { FlightInformation } from 'src/lib/socket-events/flight-tracking';
import { NoFlyZoneInfo } from 'src/lib/socket-events/no-fly-zone-tracking';
import { NoFlyZone } from 'src/lib/simulation-entities/no-fly-zone';
import { Plane } from 'src/lib/simulation-entities/plane';

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
  public noFlyZones$: Observable<DeepReadonly<NoFlyZone[]>>;

  public flights: DeepReadonly<Plane[]> = [];
  public noFlyZones: DeepReadonly<NoFlyZone[]> = [];

  constructor(private _snackBar: MatSnackBar) {}

  ngAfterViewInit() {
    this.simulationRenderer.initialize();

    this.simulationController = new SimulationController(this.simulationRenderer);

    this.flights$ = this.simulationController.events.flightListUpdated.intoObservable();
    this.noFlyZones$ = this.simulationController.events.noFlyZoneListUpdated.intoObservable();

    combineLatest([
      this.flights$.pipe(startWith([])),
      this.filter.valueChanges.pipe(startWith('')),
      this.noFlyZones$.pipe(startWith([])),
    ]).subscribe((values) => {
      const [flights, filter, noFlyZones] = values;
      console.log('Trigered ', flights, noFlyZones);

      this.flights = flights.filter((f) => f.flightInformation.flightId.includes(filter ?? ''));

      this.noFlyZones = noFlyZones.filter((f) => f.info.id.includes(filter ?? ''));
    });

    this.simulationController.events.message.addHandler((message) => {
      this._snackBar.open(message.message, '', {
        duration: 7000,
      });
    });

    setTimeout(() => {
      console.log('things');
      this.simulationController.initialize();
    }, 2000);

    this.addTestData(); 
  }

  public addTestData(): void {
    this.simulationRenderer.CreateCircularNoFlyZone({
      id: 'No Fly Zone Id',
      altitude: 100_000,
      createdAt: 'Now brother',
      notamNumber: ' NO Fly zone number',
      type: 'CIRCLE',
      radius: 2000,
      center: {
        latitude: 41.25716,
        longitude: -95.995102,
      },
    });


    var stuff  = this.simulationRenderer.CreatePolygonNoFlyZone({
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

    let check = this.simulationRenderer.drawPath([
      {latitude: 35, longitude: -60},
      {latitude: 45, longitude: -70},
      {latitude: 55, longitude: -80},
    ], 'TS1234');

    this.simulationRenderer.drawAlternatePath({
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
        coordinates: {latitude: 35, longitude: -60,},
      },
      destination: {
        name: 'IDEK',
        icaoCode: 'IDEK',
        coordinates: {latitude: 55, longitude: -80,},
      },
      checkPoints: [
        {latitude: 35, longitude: -60},
        {latitude: 45, longitude: -75},
        {latitude: 55, longitude: -80},
      ],
    }, {
      name: 'TST3',
      icaoCode: 'TST3',
      coordinates: {latitude: 45, longitude: -50,},
    });

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
        coordinates: {latitude: 35, longitude: -60,},
      },
      destination: {
        name: 'TST2',
        icaoCode: 'TST2',
        coordinates: {latitude: 55, longitude: -80,},
      },
      checkPoints: [
        {latitude: 35, longitude: -60},
        {latitude: 45, longitude: -70},
        {latitude: 55, longitude: -80},
      ],
    });

    this.simulationRenderer.drawTrackedPath({
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
        coordinates: {latitude: 35, longitude: -60,},
      },
      destination: {
        name: 'TST2',
        icaoCode: 'TST2',
        coordinates: {latitude: 55, longitude: -80,},
      },
      checkPoints: [
        {latitude: 35, longitude: -60},
        {latitude: 40, longitude: -65},
        {latitude: 45, longitude: -70},
        {latitude: 50, longitude: -75},
        {latitude: 55, longitude: -80},
      ],
    }, [
      {latitude: 43, longitude: -70},
      {latitude: 47, longitude: -70},
    ]);

    this.simulationRenderer.createAirport({
      name: 'KJFK',
      icaoCode: 'KJFK',
      coordinates: {latitude: 40.641766, longitude: -73.780968,},
    });

    //this.simulationRenderer.focus(stuff);
  }
}
