import { TestBed } from '@angular/core/testing';

import { CesiumService } from './cesium.service';
import { HttpClientModule } from '@angular/common/http';
import { AppModule } from './app.module';
import { EllipsoidNoFly } from './objects/ellipsoid-no-fly/ellipsoid-no-fly';
import { RectangleNoFly } from './objects/rectangle-no-fly/rectangle-no-fly';
import { PolygonNoFly } from './objects/polygon-no-fly/polygon-no-fly';

describe('CesiumService', () => {
  let service: CesiumService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
    });
    service = TestBed.inject(CesiumService);
    service.placeholderRepository.setUpRepository();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add rectangle no fly zone', () => {
    const rectangle: RectangleNoFly = {
      name: '',
      westLongDegree: 0,
      eastLongDegree: 0,
      southLatDegree: 0,
      northLatDegree: 0,
      rotationDegree: 0,
      maxAltitude: 0,
      minAltitude: 0,
    };

    service.addRectangleNoFlyZone(rectangle);

    expect(
      service.placeholderRepository.getNoFlyZonesResponse.rectangleNoFlyZones
        .length
    ).toEqual(2);
  });

  it('should add polygon no fly zone', () => {
    const polygon: PolygonNoFly = {
      name: '',
      vertex1Long: 0,
      vertex1Lat: 0,
      vertex2Long: 0,
      vertex2Lat: 0,
      vertex3Long: 0,
      vertex3Lat: 0,
      vertex4Long: 0,
      vertex4Lat: 0,
      maxAltitude: 0,
      minAltitude: 0,
    };

    service.addPolygonNoFlyZone(polygon);

    expect(
      service.placeholderRepository.getNoFlyZonesResponse.polygonNoFlyZones
        .length
    ).toEqual(2);
  });
});
