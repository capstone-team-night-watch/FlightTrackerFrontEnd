import { TestBed } from '@angular/core/testing';
import { SimulationEvent } from './SimulationEvent';
import { ClientToServerEvents } from './socket-events/socket-events-type';
import { JoinRoomPayload, LeaveRoomPayload } from './socket-events/room-management';
import { Ack } from './socket-events/socker-ack';

describe('SimulationEvent', () => {
  let simulationEvent: SimulationEvent<any>;
  let event: ClientToServerEvents = {
    'health-check': function (data: String): void {},
    'join-rooms': function (data: JoinRoomPayload, callback: (ack: Ack) => void): void {},
    'leave-rooms': function (data: LeaveRoomPayload): void {},
  };

  beforeEach(() => {
    simulationEvent = new SimulationEvent<any>();
    Object.values(event).forEach((handler) => simulationEvent.addHandler(handler));
  });

  it('should add handler to list', () => {
    expect(simulationEvent['handlers'].length).toBe(Object.keys(event).length);
  });

  it('should trigger handlers properly', () => {
    const mockEventData = {
      someData: 'mockData',
    };

    const handlerSpy1 = jasmine.createSpy('handler1');
    const handlerSpy2 = jasmine.createSpy('handler2');
    const handlerSpy3 = jasmine.createSpy('handler3');

    simulationEvent.addHandler(handlerSpy1);
    simulationEvent.addHandler(handlerSpy2);
    simulationEvent.addHandler(handlerSpy3);

    simulationEvent.trigger(mockEventData);

    expect(handlerSpy1).toHaveBeenCalledWith(mockEventData);
    expect(handlerSpy2).toHaveBeenCalledWith(mockEventData);
    expect(handlerSpy3).toHaveBeenCalledWith(mockEventData);
  });

  it('should remove handler from list', () => {
    const handlerSpy = jasmine.createSpy('handler');

    simulationEvent.addHandler(handlerSpy);
    expect(simulationEvent['handlers'].length).toBe(4); // Including the original 3 handlers
    simulationEvent.removeHandler(handlerSpy);
    expect(simulationEvent['handlers'].length).toBe(3); // Back to original count
  });

  it('should convert to observable', (done) => {
    const mockEventData = {
      someData: 'mockData',
    };

    const handlerSpy = jasmine.createSpy('handler').and.callFake(() => {
      done();
    });

    simulationEvent.addHandler(handlerSpy);

    const observable = simulationEvent.intoObservable();
    observable.subscribe((data) => {
      expect(data).toEqual(mockEventData);
    });

    simulationEvent.trigger(mockEventData);
  });
});
