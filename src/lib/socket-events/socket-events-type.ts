import { GeographicCoordinates3D } from '../simulation-entities/coordinattes';
import { NoFlyZoneEntity } from '../simulation-entities/no-fly-zone';
import { FlightInformation } from './flight-tracking';
import { NoFlyZoneInfo } from './no-fly-zone-tracking';
import { JoinRoomPayload, LeaveRoomPayload } from './room-management';

export interface ServerToClientEvents {
  'flight-created': (data: FlightCreatedMessage) => void;
  'flight-location-updated': (data: FlightLocationUpdatedMessage) => void;
  'flight-entered-no-fly-zone': (data: FlightEnteredNoFlyZoneMessage) => void;

  'no-fly-zone-created': (data: NoFlyZoneCreatedMessage) => void;
  'no-fly-zone-deleted': (data: NoFylZoneDeletedMessage) => void;

  'flight-path-updated': (data: FlightPathUpdateMessage) => void;
  'flight-path-intersect-with-no-fly-zone': (data: FlightIntersectWithNoFlyZoneMessage) => void;

  'health-check': (data: string) => void;
  'broadcast-health-check': (data: string) => void;
}

export interface ClientToServerEvents {
  'health-check': (data: String) => void;
  'leave-rooms': (data: LeaveRoomPayload) => void;
  'join-rooms': (data: JoinRoomPayload, callback: (ack: Ack) => void) => void;
}

export type FlightEnteredNoFlyZoneMessage = SocketMessage & {
  baseNoFlyZone: NoFlyZoneInfo;
  flightInformation: FlightInformation;
};

export type FlightCreatedMessage = SocketMessage & { flightInformation: FlightInformation };

export type NoFlyZoneCreatedMessage = SocketMessage & {
  noFlyZoneId: string;
  noFlyZone: NoFlyZoneInfo;
  type: 'POLYGON' | 'CIRCLE';
};

export type NoFylZoneDeletedMessage = SocketMessage & {
  noFlyZoneId: string;
};

export type FlightLocationUpdatedMessage = SocketMessage & {
  heading: number;
  flightId: string;
  groundSpeed: number;
  newLocation: GeographicCoordinates3D;
};

export type FlightPathUpdateMessage = SocketMessage & {
  flightId: string;
  newCheckPoints: number[];
};

export type FlightIntersectWithNoFlyZoneMessage = SocketMessage & {
  noFlyZone: NoFlyZoneInfo;
  flightInformation: FlightInformation;
};

export type Ack = {
  code: number;
  message: string;
};

export type SocketMessage = {
  room: string;
  name: string;
  message: string;
};
