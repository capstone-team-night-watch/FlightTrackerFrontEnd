import { Entity, Plane } from 'cesium';
import { NoFlyZone } from './simulation-entities/no-fly-zone';
import { CircularNoFlyZone, NoFlyZoneInfo, PolygonNoFlyZone } from './socket-events/no-fly-zone-tracking';
import { FlightInformation } from './socket-events/flight-tracking';

export interface SimulationRenderer {
  createFlight(flight: FlightInformation): Promise<Entity>;

  CreateNoFlyZone(noFlyZone: NoFlyZoneInfo): Entity;

  CreateCircularNoFlyZone(noFlyZone: CircularNoFlyZone): Entity;

  RemovePlane(plane: Plane): void;
  RemoveNoFlyZone(zone: NoFlyZone): void;

  updateFlightLocation(entity: Entity ,flight: FlightInformation): void;

  focus(entiyt: Entity): void;
}

export interface SimulationViewer {
  handleNoFlyZoneCreation(zone: NoFlyZone): void;
}
