import { EllipsoidNoFly } from '../ellipsoid-no-fly/ellipsoid-no-fly';
import { GetNoFlyZonesResponse } from '../get-no-fly-zones-response/get-no-fly-zones-response';
import { PolygonNoFly } from '../polygon-no-fly/polygon-no-fly';
import { RectangleNoFly } from '../rectangle-no-fly/rectangle-no-fly';
import { PlaceholderRepository } from './placeholder-repository';

describe('PlaceholderRepository', () => {
  let repository: PlaceholderRepository;

  beforeEach(() => {
    repository = new PlaceholderRepository();
    repository.setUpRepository();
  });

  it('should create an instance', () => {
    expect(repository).toBeTruthy();
  });

  it('should get GetNoFlyZonesRespose after setting it', () => {
    let testResponse: GetNoFlyZonesResponse = new GetNoFlyZonesResponse();

    repository.getNoFlyZonesResponse = testResponse;

    expect(repository.getNoFlyZonesResponse).toEqual(testResponse);
  });

  it('should add zones after setup', () => {
    expect(repository.getNoFlyZonesResponse.ellipsoidNoFlyZones.length).toEqual(
      1
    );
    expect(repository.getNoFlyZonesResponse.rectangleNoFlyZones.length).toEqual(
      1
    );
    expect(repository.getNoFlyZonesResponse.polygonNoFlyZones.length).toEqual(
      1
    );
    expect(repository.getNoFlyZonesResponse.militaryNoFlyZones.length).toEqual(
      0
    );
    expect(repository.getNoFlyZonesResponse.tfrNoFlyZones.length).toEqual(0);
  });

  it('should delete ellipsoid zone with zone name', () => {
    repository.deleteNoFlyZone('Test Ellipsoid');
    expect(repository.getNoFlyZonesResponse.ellipsoidNoFlyZones.length).toEqual(
      0
    );
    expect(repository.getNoFlyZonesResponse.rectangleNoFlyZones.length).toEqual(
      1
    );
    expect(repository.getNoFlyZonesResponse.polygonNoFlyZones.length).toEqual(
      1
    );
    expect(repository.getNoFlyZonesResponse.militaryNoFlyZones.length).toEqual(
      0
    );
    expect(repository.getNoFlyZonesResponse.tfrNoFlyZones.length).toEqual(0);
  });

  it('should delete rectangle zone with zone name', () => {
    repository.deleteNoFlyZone('Test Rectangle');
    expect(repository.getNoFlyZonesResponse.ellipsoidNoFlyZones.length).toEqual(
      1
    );
    expect(repository.getNoFlyZonesResponse.rectangleNoFlyZones.length).toEqual(
      0
    );
    expect(repository.getNoFlyZonesResponse.polygonNoFlyZones.length).toEqual(
      1
    );
    expect(repository.getNoFlyZonesResponse.militaryNoFlyZones.length).toEqual(
      0
    );
    expect(repository.getNoFlyZonesResponse.tfrNoFlyZones.length).toEqual(0);
  });

  it('should delete polygon zone with zone name', () => {
    repository.deleteNoFlyZone('Test Polygon');
    expect(repository.getNoFlyZonesResponse.ellipsoidNoFlyZones.length).toEqual(
      1
    );
    expect(repository.getNoFlyZonesResponse.rectangleNoFlyZones.length).toEqual(
      1
    );
    expect(repository.getNoFlyZonesResponse.polygonNoFlyZones.length).toEqual(
      0
    );
    expect(repository.getNoFlyZonesResponse.militaryNoFlyZones.length).toEqual(
      0
    );
    expect(repository.getNoFlyZonesResponse.tfrNoFlyZones.length).toEqual(0);
  });

  it('should add ellipsoid no fly zone', () => {
    let testEllipsoid = new EllipsoidNoFly();
    testEllipsoid.name = 'Test Ellipsoid';
    testEllipsoid.latitude = 41;
    testEllipsoid.longitude = -99;
    testEllipsoid.altitude = 5000;
    testEllipsoid.latRadius = 1000000;
    testEllipsoid.longRadius = 1000000;
    testEllipsoid.altRadius = 10000;

    repository.addEllipsoidNoFlyZone(testEllipsoid);

    expect(repository.getNoFlyZonesResponse.ellipsoidNoFlyZones.length).toEqual(
      2
    );
  });

  it('should add rectangle no fly zone', () => {
    let testRectangle = new RectangleNoFly();
    testRectangle.name = 'Test Rectangle';
    testRectangle.northLatDegree = 50;
    testRectangle.southLatDegree = 30;
    testRectangle.westLongDegree = -50;
    testRectangle.eastLongDegree = -30;
    testRectangle.minAltitude = 0;
    testRectangle.maxAltitude = 10000;
    testRectangle.rotationDegree = 0;

    repository.addRectangleNoFlyZone(testRectangle);

    expect(repository.getNoFlyZonesResponse.rectangleNoFlyZones.length).toEqual(
      2
    );
  });

  it('should add polygon no fly zone', () => {
    let testPolygon = new PolygonNoFly();
    testPolygon.name = 'Test Polygon';
    testPolygon.vertex1Lat = -20;
    testPolygon.vertex1Long = -50;
    testPolygon.vertex2Lat = -20;
    testPolygon.vertex2Long = -30;
    testPolygon.vertex3Lat = 0;
    testPolygon.vertex3Long = -30;
    testPolygon.vertex4Lat = -10;
    testPolygon.vertex4Long = -60;
    testPolygon.minAltitude = 0;
    testPolygon.maxAltitude = 10000;

    repository.addPolygonNoFlyZone(testPolygon);

    expect(repository.getNoFlyZonesResponse.polygonNoFlyZones.length).toEqual(
      2
    );
  });
});
