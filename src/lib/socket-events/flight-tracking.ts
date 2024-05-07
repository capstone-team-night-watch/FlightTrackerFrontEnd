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
   * List of no-fly-zones the flight is colliding with.
   */
  flightCollisions: flightCollisionData[];

  /**
   * List of no-fly-zones the flight's path is colliding with.
   */
  flightPathCollisions: pathCollisionData[];

  /**
   * List of points that the place will go through during the trip
   */
  checkPoints: number[];
};

export type Airport = {
  name: string;
  icaoCode: string;
  coordinates: GeographicCoordinates2D;
};

export type flightCollisionData = {
  flightId: string;
  noFlyZone: string;
}

export type pathCollisionData = {
  flightId: string;
  location: string;
  noFlyZone: string;
}