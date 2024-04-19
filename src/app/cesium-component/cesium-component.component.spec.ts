import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CesiumComponentComponent } from './cesium-component.component';
import { HttpClientModule } from '@angular/common/http';
import { AppModule } from '../app.module';
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
});
