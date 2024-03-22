import { Socket, io } from 'socket.io-client';
import { SimulationEvent } from './SimulationEvent';
import { SimulationMessage } from './simulation-events';
import { Url } from './utils/url';
import { SimulationRenderer } from './SimulationRenderer';
import { FlightInformation, FlightLocationUpdatedMessage } from './socket-events/flight-tracking';
import { NoFlyZoneCreatedMessage, NoFlyZoneInfo } from './socket-events/no-fly-zone-tracking';
import { DeepReadonly } from './utils/types';
import { ClientToServerEvents, ServerToClientEvents } from './socket-events/socket-signature';
import { NoFlyZone } from './simulation-entities/no-fly-zone';
import { Plane } from './simulation-entities/plane';
import { Entity } from 'cesium';

export class SimulationController {
  public events = {
    flightListUpdated: new SimulationEvent<DeepReadonly<Plane[]>>(),
    noFlyZoneListUpdated: new SimulationEvent<DeepReadonly<NoFlyZone[]>>(),

    message: new SimulationEvent<DeepReadonly<SimulationMessage>>(),
  };

  private renderer: SimulationRenderer;

  private plane: Plane[] = [];
  private noFlyZones: NoFlyZone[] = [];

  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  constructor(renderer: SimulationRenderer) {
    this.renderer = renderer;
    this.socket = io(Url.socket());
  }

  public initialize(): void {
    this.handleFlightEvents();
    this.handleNoFlyZoneEvents();

    // Join relevant rooms
    this.joinRoom(['no-fly-zone-room', 'flight-information-lobby']);

    this.performServerHealthCheck();
  }

  private handleFlightEvents() {
    // Handle the update of the location or expected path of a flight
    this.socket.on('flight-location-updated', (data: FlightLocationUpdatedMessage) => {
      const targetFlight = this.plane.find(
        (plane) => plane.flightInformation.flightId === data.flightInformation.flightId
      );

      if (targetFlight === undefined) {
        console.error('We received notification of the existence of the flight that we are not tracking');
        return;
      }

      this.renderer.updateFlightLocation(targetFlight.cesiumEntity, data.flightInformation);
    });

    // Handle the creation of a new flight
    this.socket.on('flight-created', (flightInformation) => {
      this.joinRoom([flightInformation.flightId]);
      this.createPlane(flightInformation);
    });

    // Handle the notifiation upon room entrance of the list of flight that are active
    this.socket.on('active-flight', (flightInformation) => {
      // Join room of the specific flight
      this.joinRoom([flightInformation.flightId]);
      this.createPlane(flightInformation);
    });
  }

  private async createPlane(flightInformation: FlightInformation): Promise<void> {
    let plane = {
      isTracked: true,
      flightInformation: flightInformation,
      cesiumEntity: await this.renderer.createFlight(flightInformation),
    } satisfies Plane;

    this.plane.push(plane);
    this.events.flightListUpdated.trigger(this.plane);
  }

  private handleNoFlyZoneEvents() {
    this.socket.on('no-fly-zone-created', (message: NoFlyZoneCreatedMessage) => {
      this.createNoFlyZone(message.noFlyZone);
    });

    this.socket.on('active-no-fly-zone', (noFlyZone: NoFlyZoneInfo) => {
      this.createNoFlyZone(noFlyZone);
    });
  }

  private createNoFlyZone(noFlyZoneInfo: NoFlyZoneInfo): void {
    let noFlyZone = {
      info: noFlyZoneInfo,
      cesiumEntity: this.renderer.CreateNoFlyZone(noFlyZoneInfo),
    } satisfies NoFlyZone;

    this.noFlyZones.push(noFlyZone);
    this.events.noFlyZoneListUpdated.trigger(this.noFlyZones);
  }

  private performServerHealthCheck(): void {
    this.socket.on('health-check', (data: string) => {
      this.events.message.trigger({
        message: 'Established connection with the server',
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
}
