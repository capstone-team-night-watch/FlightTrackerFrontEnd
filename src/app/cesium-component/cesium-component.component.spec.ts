import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CesiumComponentComponent } from './cesium-component.component';
import { HttpClientModule } from '@angular/common/http';
import { AppModule } from '../app.module';
import { Airport, FlightInformation } from 'src/lib/socket-events/flight-tracking';
import { GeographicCoordinates2D } from 'src/lib/simulation-entities/coordinattes';
import { Cartesian3, Entity, JulianDate, VerticalOrigin } from 'cesium';
import { NoFlyZoneInfo } from 'src/lib/socket-events/no-fly-zone-tracking';
import { AirportNode } from 'src/lib/simulation-entities/airport-node';

describe('CesiumComponentComponent', () => {
  let component: CesiumComponentComponent;
  let fixture: ComponentFixture<CesiumComponentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HttpClientModule, AppModule],
      declarations: [CesiumComponentComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CesiumComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('it should create circle no fly zone', () => {
    const noFlyZone = component.CreateCircularNoFlyZone({
      id: 'No Fly Zone Id',
      altitude: 100_000,
      createdAt: 'Now brother',
      notamNumber: ' NO Fly zon enumber',
      type: 'CIRCLE',
      radius: 2000,
      center: {
        latitude: 41.25716,
        longitude: -95.995102,
      },
    });

    expect(component.getViewer().entities.values.length).toEqual(1);
  });

  it('it should create polygon no fly zone', () => {
    const noFlyZone = component.CreatePolygonNoFlyZone({
      id: 'No Fly Zone Id',
      altitude: 100_000,
      createdAt: 'Now brother',
      notamNumber: ' NO Fly zon enumber',
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

    expect(component.getViewer().entities.values.length).toEqual(1);
  });

  it('should draw path and return entity', () => {
    let coordinates: GeographicCoordinates2D[] = [
      {
        latitude: 41.25716,
        longitude: -95.995102,
      },
      {
        latitude: 41.25716,
        longitude: -95.995102,
      },
      {
        latitude: 41.25716,
        longitude: -95.995102,
      },
      {
        latitude: 41.25716,
        longitude: -95.995102,
      },
      {
        latitude: 41.25716,
        longitude: -95.995102,
      },
      {
        latitude: 41.25716,
        longitude: -95.995102,
      },
    ];

    component.drawPath(coordinates, 'name');

    expect(component.getViewer().entities.values.length).toEqual(1);
  });

  it('should attach early warning', () => {
    let entity = new Entity();

    component.attachEarlyWarning(entity);

    expect(entity.billboard?.image?.getValue(JulianDate.now())).toEqual('assets/images/EarlyWarningLabel.png');
    expect(entity.billboard?.verticalOrigin?.getValue(JulianDate.now())).toEqual(VerticalOrigin.BOTTOM);
  });

  it('should attach warning', () => {
    let entity = new Entity();

    component.attachWarning(entity);

    expect(entity.billboard?.image?.getValue(JulianDate.now())).toEqual('assets/images/WarningLabel.png');
    expect(entity.billboard?.verticalOrigin?.getValue(JulianDate.now())).toEqual(VerticalOrigin.BOTTOM);
  });

  it('should erase warning', () => {
    let entity = new Entity();

    component.eraseWarnings(entity);

    expect(entity.billboard).toEqual(undefined);
  });

  it('should create no fly zone', () => {
    let noFlyZoneInfoPolygon: NoFlyZoneInfo = {
      id: 'No Fly Zone Id',
      altitude: 100_000,
      createdAt: 'Now brother',
      notamNumber: ' NO Fly zon enumber',
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
    };

    let noFlyZoneInfoCircle: NoFlyZoneInfo = {
      id: 'No Fly Zone Id',
      altitude: 100_000,
      createdAt: 'Now brother',
      notamNumber: ' NO Fly zon enumber',
      type: 'CIRCLE',
      radius: 2000,
      center: {
        latitude: 41.25716,
        longitude: -95.995102,
      },
    };

    component.CreateNoFlyZone(noFlyZoneInfoPolygon);

    expect(component.getViewer().entities.values.length).toEqual(1);

    component.CreateNoFlyZone(noFlyZoneInfoCircle);

    expect(component.getViewer().entities.values.length).toEqual(2);
  });

  it('should create two airports', () => {
    let airport1: Airport = {
      name: 'airport1-name',
      icaoCode: 'airport1-icaoCode',
      coordinates: {
        latitude: -42.789,
        longitude: 42.789,
      },
    };

    let airport2: Airport = {
      name: 'airport2-name',
      icaoCode: 'airport2-icaoCode',
      coordinates: {
        latitude: -42.7899,
        longitude: 42.7899,
      },
    };

    let newAirportNode1: AirportNode = {
      airportObject: airport1,
      coords: Cartesian3.packArray([
        Cartesian3.fromDegrees(airport1.coordinates.longitude, airport1.coordinates.latitude, 0),
      ]),
      depth: 0,
      leftNode: undefined,
      rightNode: undefined,
    };

    let newAirportNode2: AirportNode = {
      airportObject: airport1,
      coords: Cartesian3.packArray([
        Cartesian3.fromDegrees(airport2.coordinates.longitude, airport2.coordinates.latitude, 0),
      ]),
      depth: 0,
      leftNode: undefined,
      rightNode: undefined,
    };

    let airportNode = component.createAirport(airport1);

    expect(airportNode).toEqual(newAirportNode1);

    let airportNode2 = component.createAirport(airport2);

    expect(airportNode.leftNode?.airportObject).toEqual(airport2);

    airportNode.leftNode = newAirportNode2;
  });

  it('should return closest airport null', () => {
    let flightInformation: FlightInformation = {
      flightId: 'flightId',
      location: {
        latitude: 41.25716,
        longitude: -95.995102,
        altitude: 30,
      },
      groundSpeed: 40,
      heading: 50,
      source: {
        name: 'source-name',
        icaoCode: 'source-icao',
        coordinates: {
          latitude: 41.25716,
          longitude: -95.995102,
        },
      },
      destination: {
        name: 'destination-name',
        icaoCode: 'destination-icao',
        coordinates: {
          latitude: 41.25716,
          longitude: -95.995102,
        },
      },
      checkPoints: [0, 1, 2, 3, 4],
    };

    let airport = component.getClosestAirport(flightInformation);

    expect(airport).toEqual({
      name: 'NULL',
      icaoCode: 'NULL',
      coordinates: { latitude: 41.25716, longitude: -95.995102 },
    });
  });

  it('should return closest airport', () => {
    let flightInformation: FlightInformation = {
      flightId: 'flightId',
      location: {
        latitude: 41.25716,
        longitude: -95.995102,
        altitude: 30,
      },
      groundSpeed: 40,
      heading: 50,
      source: {
        name: 'source-name',
        icaoCode: 'source-icao',
        coordinates: {
          latitude: 41.25716,
          longitude: -95.995102,
        },
      },
      destination: {
        name: 'destination-name',
        icaoCode: 'destination-icao',
        coordinates: {
          latitude: 41.25716,
          longitude: -95.995102,
        },
      },
      checkPoints: [0, 1, 2, 3, 4],
    };

    let airport: Airport = {
      name: 'airport1-name',
      icaoCode: 'airport1-icaoCode',
      coordinates: {
        latitude: -42.789,
        longitude: 42.789,
      },
    };

    let airportLeftNode: AirportNode = {
      airportObject: airport,
      coords: Cartesian3.packArray([
        Cartesian3.fromDegrees(airport.coordinates.longitude, airport.coordinates.latitude, 0),
      ]),
      depth: 0,
      leftNode: undefined,
      rightNode: undefined,
    };

    let airportRightNode: AirportNode = {
      airportObject: airport,
      coords: Cartesian3.packArray([
        Cartesian3.fromDegrees(airport.coordinates.longitude, airport.coordinates.latitude, 0),
      ]),
      depth: 0,
      leftNode: undefined,
      rightNode: undefined,
    };

    let airporttNode: AirportNode = {
      airportObject: airport,
      coords: Cartesian3.packArray([
        Cartesian3.fromDegrees(airport.coordinates.longitude, airport.coordinates.latitude, 0),
      ]),
      depth: 0,
      leftNode: airportLeftNode,
      rightNode: airportRightNode,
    };

    let closestAirport = component.getClosestAirport(flightInformation, airporttNode, 1_000);

    expect(closestAirport).toEqual(airport);
  });
});
