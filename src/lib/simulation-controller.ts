import { Socket, io } from 'socket.io-client';
import { SimulationEvent } from './SimulationEvent';
import { SimulationMessage } from './simulation-events';
import { Url } from './utils/url';
import { FlightInformation, Airport } from './socket-events/flight-tracking';
import { NoFlyZoneInfo } from './socket-events/no-fly-zone-tracking';
import { DeepReadonly } from './utils/types';
import { NoFlyZoneEntity } from './simulation-entities/no-fly-zone';
import { Plane } from './simulation-entities/plane';
import { UIError } from './error';
import { CesiumComponentComponent } from 'src/app/cesium-component/cesium-component.component';
import { ClientToServerEvents, ServerToClientEvents } from './socket-events/socket-events-type';
import { PersistenceService } from 'src/app/shared/persistence.service';
import { Observable } from 'rxjs';
import { AirportNode } from './simulation-entities/airport-node';

export class SimulationController {
  public events = {
    flightListUpdated: new SimulationEvent<DeepReadonly<Plane[]>>(),
    noFlyZoneListUpdated: new SimulationEvent<DeepReadonly<NoFlyZoneEntity[]>>(),

    message: new SimulationEvent<DeepReadonly<SimulationMessage>>(),
  };

  private renderer: CesiumComponentComponent;
  private persistenceService: PersistenceService;

  private planes: Plane[] = [];
  private noFlyZones: NoFlyZoneEntity[] = [];

  public socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  constructor(renderer: CesiumComponentComponent, persistenceService: PersistenceService) {
    this.renderer = renderer;
    this.socket = io(Url.socket());
    this.persistenceService = persistenceService;
  }

  public async initialize(): Promise<void> {
    const allNoFlyZones = await this.persistenceService.getAllNoFlyZone();
    const allActiveFlight = await this.persistenceService.getAllActiveFlight();

    for (let noFlyZone of allNoFlyZones) {
      this.createNoFlyZone(noFlyZone);
    }

    for (let flight of allActiveFlight) {
      this.handleFlightCreated(flight);
      
      let flightCollisionsAmount: number = 0;
      let flightPathCollisionsAmount: number = 0;

      if (flight.flightCollisions != undefined) {
        flightCollisionsAmount = flight.flightCollisions.length;
      }

      if (flight.flightPathCollisions != undefined) {
        flightCollisionsAmount = flight.flightPathCollisions.length;
      }

      if (flightCollisionsAmount > 0 || flightPathCollisionsAmount > 0) {
        let possibleAirports: AirportNode[] = this.renderer.getClosestAirport(flight);
        let closestAirport: Airport | undefined = this.renderer.getClosestValidAirport(flight, possibleAirports)
        if (closestAirport != undefined) {
          this.renderer.drawAlternatePath(flight, closestAirport);
        }
      }
    }

    this.events.flightListUpdated.trigger(this.planes);
    this.events.noFlyZoneListUpdated.trigger(this.noFlyZones);

    this.handleFlightEvents();
    this.handleNoFlyZoneEvents();

    // Join relevant rooms
    this.joinRoom([
      'no-fly-zone-room',
      'flight-information-lobby',
      ...allActiveFlight.map((flight) => 'flight-' + flight.flightId),
    ]);

    this.performServerHealthCheck();
  }

  private loadFlightInformation(): void {}

  /**
   * Register events listener that handle any time flight information is updated
   */
  private handleFlightEvents(): void {
    // Handle the update of the location or expected path of a flight
    this.socket.on('flight-location-updated', (data) => {
      var getPlane = this.getPlane(data.flightId);

      getPlane.flightInformation.heading = data.heading;
      getPlane.flightInformation.location = data.newLocation;
      getPlane.flightInformation.groundSpeed = data.groundSpeed;

      this.renderer.updateFlightLocation(getPlane.cesiumEntity, getPlane.flightInformation);
    });

    this.socket.on('flight-path-updated', (data) => {
      var getPlane = this.getPlane(data.flightId);
      getPlane.flightInformation.checkPoints = data.newCheckPoints;
      console.log("Bro loggin' his flight.");
      this.renderer.updateFlightPath(getPlane.cesiumEntity, getPlane.flightInformation);
    });

    this.socket.on('flight-path-intersect-with-no-fly-zone', (data) => {
      var getPlane = this.getPlane(data.flightInformation.flightId);
      this.renderer.updateAlternateFlightPath(getPlane.cesiumEntity, getPlane.flightInformation)
      
      this.events.message.trigger({
        message: `Path of flight with id ${data.flightInformation.flightId} intersect with no fly zone ${data.noFlyZone.id}`,
      });
    });

    this.socket.on('flight-entered-no-fly-zone', (data) => {
      var getPlane = this.getPlane(data.flightInformation.flightId);
      this.renderer.updateAlternateFlightPath(getPlane.cesiumEntity, getPlane.flightInformation);
      
      this.events.message.trigger({
        message: `Flight with id ${data.flightInformation.flightId} has entered a no fly zone ${data.baseNoFlyZone.id}`,
      });
    });

    // Handle the creation of a new flight
    this.socket.on('flight-created', (data) => {
      this.joinRoom(['flight-' + data.flightInformation.flightId]);
      this.handleFlightCreated(data.flightInformation);
    });
  }

  /**
   * Call back invoked when a new flight is created
   */
  private async handleFlightCreated(flightInformation: FlightInformation): Promise<void> {
    let plane = {
      isTracked: true,
      flightInformation: flightInformation,
      cesiumEntity: await this.renderer.createFlight(flightInformation),
    } satisfies Plane;

    this.planes.push(plane);
    this.events.flightListUpdated.trigger(this.planes);
  }

  /**
   * Call back invoked when a new no-fly zone is created
   */
  private handleNoFlyZoneEvents(): void {
    this.socket.on('no-fly-zone-created', (message) => {
      this.createNoFlyZone(message.noFlyZone);
    });
  }

  private createNoFlyZone(noFlyZoneInfo: NoFlyZoneInfo): void {
    try {
      let noFlyZone = {
        info: noFlyZoneInfo,
        cesiumEntity: this.renderer.CreateNoFlyZone(noFlyZoneInfo),
      } satisfies NoFlyZoneEntity;

      this.noFlyZones.push(noFlyZone);
      this.events.noFlyZoneListUpdated.trigger(this.noFlyZones);
    } catch(e) {
      console.log(e);
    }   
  }

  private performServerHealthCheck(): void {
    this.socket.on('health-check', (data: string) => {
      this.events.message.trigger({
        message: 'Established connection with the server',
      });
    });

    this.socket.emit('health-check', 'Are you alive');
  }

  /**
   * Returns the plane whose flight Id matches the one provided
   *
   * @param flightId Flight Id of the plane being tracked
   */
  private getPlane(flightId: string): Plane {
    var plane = this.planes.find((plane) => plane.flightInformation.flightId === flightId);

    if (plane === undefined) {
      throw new UIError('Flight not found');
    }

    return plane;
  }

  /**
   * Adds the client to the list of rooms provided
   */
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

  public getPlanes = () => {
    return this.planes;
  };
}
