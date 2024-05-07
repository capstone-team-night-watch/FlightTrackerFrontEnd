import { Entity, EntityCollection } from 'cesium';
import { FlightInformation } from '../socket-events/flight-tracking';

export type Plane = {
  isTracked: boolean;
  flightInformation: FlightInformation;
  cesiumEntity: Readonly<RenderedFlight>;
};

export type RenderedFlight = {
  plane: Entity;
  planePath: Entity;
  alternatePath?: Entity;
};
