import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PersistenceService } from './persistence.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NoFlyZoneInfo } from 'src/lib/socket-events/no-fly-zone-tracking';
import { Url } from 'src/lib/utils/url';
import { FlightInformation } from 'src/lib/socket-events/flight-tracking';

describe('PersistenceService', () => {
  let service: PersistenceService;
  let httpTestingController: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [PersistenceService],
    });
    service = TestBed.inject(PersistenceService);
    httpTestingController = TestBed.inject(HttpTestingController);
  });

  // Verifies that no outstanding requests
  afterEach(() => {
    httpTestingController.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return all no fly zones', async () => {
    const expectedData: NoFlyZoneInfo[] = [
      {
        id: '123',
        altitude: 100,
        createdAt: 'creatd now',
        notamNumber: 'notam-123',
        type: 'POLYGON',
        vertices: [{ latitude: 10, longitude: 10 }],
      },
      {
        id: '456',
        altitude: 100,
        createdAt: 'created now',
        notamNumber: 'notam-456',
        type: 'CIRCLE',
        radius: 5,
        center: { latitude: 50, longitude: 50 },
      },
    ];
    service.getAllNoFlyZone().then((zones) => {
      expect(zones).toEqual(expectedData);
    });

    const req = httpTestingController.expectOne(Url.consumer('/NoFlyZone'));
    expect(req.request.method).toBe('GET');
    req.flush({ data: expectedData });
  });

  it('should return all active flights', () => {
    const expectedData: FlightInformation[] = [
      {
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
        flightCollisions: [],
        flightPathCollisions: [],
        checkPoints: [0, 1, 2, 3, 4],
      },
      {
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
        flightCollisions: [],
        flightPathCollisions: [],
        checkPoints: [0, 1, 2, 3, 4],
      },
    ];

    service.getAllActiveFlight().then((flights) => {
      expect(flights).toEqual(expectedData);
    });

    const req = httpTestingController.expectOne(Url.consumer('/Flight'));
    expect(req.request.method).toBe('GET');
    req.flush({ data: expectedData });
  });
});
