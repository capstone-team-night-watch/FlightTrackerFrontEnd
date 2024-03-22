import { GeographicCoordinates2D, GeographicCoordinates3D } from '../simulation-entities/coordinattes';

export type FlightInformation = {
  /**
   * Unique identifier for the flight
   */
  flightId: string;

  /**
   * Current location of the plane
   */
  location: GeographicCoordinates3D;

  /**
   * List of points the plane will pass though during the flight
   */
  checkPoints?: GeographicCoordinates2D[];

  /**
   * Describes the group speed of the plan in miles per second
   */
  groundSpeed: number;

  /**
   * Describes the general direction of the plane
   * TODO: Find how this is represented on the aero api
   */
  heading: number;
};

export type FlightLocationUpdatedMessage = {
  flightInformation: FlightInformation;
};
