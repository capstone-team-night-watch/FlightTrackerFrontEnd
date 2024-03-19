import {
  FlightInformation,
  FlightLocationUpdatedMessage,
} from './flight-tracking';
import { NoFlyZoneCreatedMessage, NoFlyZoneInfo } from './no-fly-zone-tracking';
import { JoinRoomPayload, LeaveRoomPayload } from './room-management';
import { Ack } from './socker-ack';

export interface ClientToServerEvents {
  'health-check': (data: String) => void;
  'join-rooms': (data: JoinRoomPayload, callback: (ack: Ack) => void) => void;
  'leave-rooms': (data: LeaveRoomPayload) => void;
}

export interface ServerToClientEvents {
  'flight-created': (data: FlightInformation) => void;
  'no-fly-zone-created': (data: NoFlyZoneCreatedMessage) => void;
  'flight-location-updated': (data: FlightLocationUpdatedMessage) => void;


  'active-flight': (data: FlightInformation) => void;
  'active-no-fly-zone': (data: NoFlyZoneInfo) => void;

  'health-check': (data: string) => void;
  'broadcast-health-check': (data: string) => void;
}
