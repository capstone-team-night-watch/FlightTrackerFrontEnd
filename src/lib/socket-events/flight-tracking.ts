import {
  GeographicCoordinates2D,
  GeographicCoordinates3D,
} from '../simulation-entities/coordinattes';

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
   * Describes the group speed of the plan in miles per second
   */
  groundSpeed: number;

  /**
   * Describes the general direction of the plane
   * TODO: Find how this is represented on the aero api
   */
  heading: number;

  /**
   * Airport the plane is flying from
   */
  source: Airport;

  /**
   * Airport the plane is flying to
   */
  destination: Airport;

  /**
   * List of points that the place will go through during the trip
   */
  checkPoints: GeographicCoordinates2D[];
};

export type Airport = {
  name: string;
  icaoCode: string;
  coordinates: GeographicCoordinates2D;
};

export type FlightLocationUpdatedMessage = {
  flightInformation: FlightInformation;
};
