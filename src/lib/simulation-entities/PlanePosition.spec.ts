import { Cartesian3, JulianDate } from 'cesium';
import { DynamicPlanePosition } from './PlanePosition';

describe('DynamicPlanePosition', () => {
  // Test case for initializing the DynamicPlanePosition
  it('should initialize with correct coordinates', () => {
    const coordinates = {
      longitude: -75.0,
      latitude: 40.0,
      altitude: 1000.0,
    };

    const dynamicPosition = new DynamicPlanePosition(coordinates);

    // Verify that the initial coordinates are converted to Cartesian3 correctly
    const expectedCartesian = Cartesian3.fromDegrees(coordinates.longitude, coordinates.latitude, coordinates.altitude);
    expect(dynamicPosition.getCoordinates()).toEqual(expectedCartesian);
  });

  // Test case for updating coordinates
  it('should update coordinates correctly', () => {
    const initialCoordinates = {
      longitude: -75.0,
      latitude: 40.0,
      altitude: 1000.0,
    };

    const updatedCoordinates = {
      longitude: -80.0,
      latitude: 35.0,
      altitude: 1500.0,
    };

    const dynamicPosition = new DynamicPlanePosition(initialCoordinates);

    // Update coordinates
    dynamicPosition.setCoordinates(updatedCoordinates);

    // Verify that the updated coordinates are reflected in the Cartesian3 value
    const expectedUpdatedCartesian = Cartesian3.fromDegrees(
      updatedCoordinates.longitude,
      updatedCoordinates.latitude,
      updatedCoordinates.altitude
    );
    expect(dynamicPosition.getCoordinates()).toEqual(expectedUpdatedCartesian);
  });

  // Test case for getValue method
  it('should return correct Cartesian3 value for a given time', () => {
    const coordinates = {
      longitude: -75.0,
      latitude: 40.0,
      altitude: 1000.0,
    };
    const dynamicPosition = new DynamicPlanePosition(coordinates);

    const currentTime = JulianDate.now();

    // Call getValue method with current time
    const result = new Cartesian3();
    const value = dynamicPosition.getValue(currentTime, result);

    // Verify that the returned value matches the expected Cartesian3 coordinates
    const expectedCartesian = Cartesian3.fromDegrees(coordinates.longitude, coordinates.latitude, coordinates.altitude);
    expect(value).toEqual(expectedCartesian);
  });
});
