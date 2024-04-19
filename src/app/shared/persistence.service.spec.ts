import { TestBed, getTestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { PersistenceService } from './persistence.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { NoFlyZoneInfo } from 'src/lib/socket-events/no-fly-zone-tracking';
import { Url } from 'src/lib/utils/url';

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
      expect(zones.length).toEqual(2);
    });

    const req = httpTestingController.expectOne(Url.consumer('/NoFlyZone'));
    expect(req.request.method).toBe('GET');
    req.flush(expectedData);
  });
});
