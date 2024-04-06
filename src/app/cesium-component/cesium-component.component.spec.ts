import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CesiumComponentComponent } from './cesium-component.component';
import { HttpClientModule } from '@angular/common/http';
import { AppModule } from '../app.module';
import {
  JulianDate,
  Entity,
  Matrix4,
  EntityCollection,
  Event,
  ModelGraphics,
  Property,
  PositionProperty,
  SampledPositionProperty,
  ConstantProperty,
} from 'cesium';
import { FlightInformation } from 'src/lib/socket-events/flight-tracking';
import { GeographicCoordinates2D } from 'src/lib/simulation-entities/coordinattes';

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

  it('it should create circle no fly zone', async () => {
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

    expect(noFlyZone).toBeTruthy();
  });

  it('it should create polygon no fly zone', async () => {
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

    expect(noFlyZone).toBeTruthy();
  });

  it('should create flight', async () => {
    let flight: FlightInformation = {
      flightId: 'testFlight',
      location: {
        latitude: 10,
        longitude: 20,
        altitude: 30,
      },
      groundSpeed: 100,
      heading: 32,
      source: {
        name: 'sourceName',
        icaoCode: 'sourceIcao',
        coordinates: {
          latitude: 120,
          longitude: 120,
        },
      },
      destination: {
        name: 'destinationName',
        icaoCode: 'destinationIcao',
        coordinates: {
          latitude: 150,
          longitude: 150,
        },
      },
      checkPoints: [
        {
          latitude: 100,
          longitude: 200,
        },
        {
          latitude: 10000,
          longitude: 20000,
        },
      ],
    };

    let planeEntity = component.createFlight(flight);

    expect(planeEntity).toBeTruthy();
  });

  it('should draw path and return entity', () => {
    let coordinates: GeographicCoordinates2D[] = [];

    coordinates.push({
      latitude: 10,
      longitude: 30,
    });

    coordinates.push({
      latitude: 3000,
      longitude: 5000,
    });

    component.drawPath(coordinates, 'name');

    expect(component.getViewer().entities.values.length).toEqual(1);
  });
});
