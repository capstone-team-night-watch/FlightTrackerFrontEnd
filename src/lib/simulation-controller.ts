import { Socket, io } from 'socket.io-client';
import { SimulationEvent } from './SimulationEvent';
import { CollisionEvent } from './simulation-events';
import { Url } from './utils/url';

interface ClientToServerEvents {
  'health-check': (data: string) => void;
}

interface ServerToClientEvents {
  'health-check': (data: string) => void;
  'broadcast-health-check': (data: string) => void;
  healthcheck: (data: string) => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;
}

export class SimulationController {
  private colisionEvent: SimulationEvent<CollisionEvent> =
    new SimulationEvent();

  private socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  constructor() {
    this.socket = io(Url.socket());
    this.configureSocketConnection();
  }

  public onColision(handler: (event: CollisionEvent) => void): () => void {
    this.colisionEvent.addHandler(handler);
    return () => this.colisionEvent.removeHandler(handler);
  }

  private configureSocketConnection(): void {

    this.socket.on('broadcast-health-check', (data: string) => {
      this.colisionEvent.trigger({
        data: data,
      });
    });

    this.socket.on('health-check', (data: string) => {
      console.log('specific healtcheck', data);
    });

    this.socket.emit('health-check', 'Are you alive');
  }
}
