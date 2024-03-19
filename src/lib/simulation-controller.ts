import { Socket, io } from 'socket.io-client';
import { SimulationEvent } from './SimulationEvent';
import { SimulationMessage } from './simulation-events';
import { Url } from './utils/url';
import { SimulationRenderer } from './SimulationRenderer';
import {
  JoinRoomPayload,
  LeaveRoomPayload,
} from './socket-events/room-management';
import {
  FlightInformation,
  FlightLocationUpdatedMessage,
} from './socket-events/flight-tracking';
import { NoFlyZoneCreatedMessage, NoFlyZoneInfo } from './socket-events/no-fly-zone-tracking';
import { NoFlyZone } from './simulation-entities/no-fly-zone';
import { Ack } from './socket-events/socker-ack';
import { Flight } from 'src/app/objects/flight/flight';
import { DeepReadonly } from './utils/types';
import { ClientToServerEvents, ServerToClientEvents } from './socket-events/socket-events-type';


export class SimulationController {
  public events = {
    noFllyZonesUpdated: new SimulationEvent<DeepReadonly<NoFlyZoneInfo[]>>(),
    flightCreated: new SimulationEvent<DeepReadonly<FlightInformation[]>>(),
    message: new SimulationEvent<DeepReadonly<SimulationMessage>>(),
  };

  private renderer: SimulationRenderer;

  private noFlyZones: NoFlyZoneInfo[] = [];
  private flights: FlightInformation[] = [];

  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  constructor() {
    this.socket = io(Url.socket());
    this.configureSocketConnection();
  }

  private configureSocketConnection(): void {
    this.socket.on('no-fly-zone-created', (data: NoFlyZoneCreatedMessage) => {
      this.noFlyZones.push(data.noFlyZone);
      this.events.noFllyZonesUpdated.trigger(this.noFlyZones);
    });


    this.socket.on('active-no-fly-zone', (data: NoFlyZoneInfo) => {
      this.noFlyZones.push(data);
      this.events.noFllyZonesUpdated.trigger(this.noFlyZones);
    });

    this.socket.on(
      'flight-location-updated',
      (data: FlightLocationUpdatedMessage) => {
        // Simplly notify the event handler that a flight has been updated
        // Will include more complex logic in the future
        this.events.message.trigger({
          message: `The location of flight with id ${
            data.flightInformation.flightId
          } has been created ${JSON.stringify(data, null, 2)}`,
        });
      }
    );

    this.socket.on('flight-created', (data) => {
      this.flights.push(data);
      this.events.flightCreated.trigger(this.flights);
    });

    this.socket.on('active-flight', (data) => {
      // Join room of the specific flight
      this.joinRoom([data.flightId]);

      this.flights.push(data);
      this.events.flightCreated.trigger(this.flights);
    });

    // Join relevant rooms
    this.joinRoom(['no-fly-zone-room', 'flight-information-lobby']);

    this.performServerHealthCheck();
  }

  private performServerHealthCheck(): void {
    this.socket.on('health-check', (data: string) => {
      this.events.message.trigger({
        message: data,
      });
    });

    this.socket.emit('health-check', 'Are you alive');
  }

  private joinRoom(rooms: string[]): void {
    this.socket.emit(
      'join-rooms',
      {
        rooms,
      },
      (response) => {
        if (response.code === 200) {
          throw new Error(response.message);
        }
      }
    );
  }

  private createNoFlyZone(noFlyZone: NoFlyZone): void {}

  private createPlane(flightInformation: FlightInformation): void {}

  private updatePlaneLocation(flightInformation: FlightInformation): void {}
}
