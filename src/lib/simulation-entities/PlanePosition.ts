import { Cartesian3, JulianDate, PositionProperty, Property, ReferenceFrame, Event } from 'cesium';
import { GeographicCoordinates2D, GeographicCoordinates3D } from './coordinattes';

export class DynamicPlanePosition implements PositionProperty {
  private cartesian3: Cartesian3;

  constructor(coordinates: GeographicCoordinates3D) {
    this.cartesian3 = Cartesian3.fromDegrees(coordinates.longitude, coordinates.latitude, coordinates.altitude);
  }

  public setCoordinates(coordinates: GeographicCoordinates3D) {
    this.cartesian3 = Cartesian3.fromDegrees(coordinates.longitude, coordinates.latitude, coordinates.altitude);
  }

  public getCoordinates(): Cartesian3 {
    return this.cartesian3;
  }

  /**
   * Gets a value indicating if this property is constant.  A property is considered
   * constant if getValue always returns the same result for the current definition.
   */
  readonly isConstant: boolean;
  /**
   * Gets the event that is raised whenever the definition of this property changes.
   * The definition is considered to have changed if a call to getValue would return
   * a different result for the same time.
   */
  readonly definitionChanged: Event;
  /**
   * Gets the reference frame that the position is defined in.
   */
  readonly referenceFrame: ReferenceFrame;

  /**
   * Gets the value of the property at the provided time in the fixed frame.
   * @param time - The time for which to retrieve the value.
   * @param [result] - The object to store the value into, if omitted, a new instance is created and returned.
   * @returns The modified result parameter or a new instance if the result parameter was not supplied.
   */
  getValue(time: JulianDate, result?: Cartesian3): Cartesian3 | undefined {
    return this.cartesian3;
  }

  /**
   * Gets the value of the property at the provided time and in the provided reference frame.
   * @param time - The time for which to retrieve the value.
   * @param referenceFrame - The desired referenceFrame of the result.
   * @param [result] - The object to store the value into, if omitted, a new instance is created and returned.
   * @returns The modified result parameter or a new instance if the result parameter was not supplied.
   */
  getValueInReferenceFrame(
    time: JulianDate,
    referenceFrame: ReferenceFrame,
    result?: Cartesian3
  ): Cartesian3 | undefined {
    return this.cartesian3;
  }

  /**
   * Compares this property to the provided property and returns
   * <code>true</code> if they are equal, <code>false</code> otherwise.
   * @param [other] - The other property.
   * @returns <code>true</code> if left and right are equal, <code>false</code> otherwise.
   */
  equals(other?: Property) {
    return false;
  }
}
