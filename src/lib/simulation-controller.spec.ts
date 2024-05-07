import { CesiumComponentComponent } from 'src/app/cesium-component/cesium-component.component';
import { PersistenceService } from 'src/app/shared/persistence.service';
import { UIError } from './error';
import { SimulationController } from './simulation-controller';
import { FlightInformation } from './socket-events/flight-tracking';
import {
  FlightCreatedMessage,
  FlightEnteredNoFlyZoneMessage,
  FlightIntersectWithNoFlyZoneMessage,
  FlightLocationUpdatedMessage,
  FlightPathUpdateMessage,
} from './socket-events/socket-events-type';

describe('SimulationController', () => {
  let controller: SimulationController;
  let mockRenderer: any;
  let mockPersistenceService: any;
  let mockSocket: any; // Mock socket object

  beforeEach(() => {
    mockRenderer = jasmine.createSpyObj('CesiumComponentComponent', [
      'createFlight',
      'CreateNoFlyZone',
      'updateFlightLocation',
      'updateFlightPath',
      'updateAlternateFlightPath',
      'drawAlternatePath',
      'getClosestAirport',
      'checkCircularCollision',
      'checkPolygonCollision',
      'getClosestValidAirport',
    ]);
    mockPersistenceService = jasmine.createSpyObj('PersistenceService', ['getAllNoFlyZone', 'getAllActiveFlight']);
    mockSocket = {
      on: jasmine.createSpy('on'),
      emit: jasmine.createSpy('emit'),
    };
    controller = new SimulationController(mockRenderer, mockPersistenceService);
    controller.socket = mockSocket;
  });

  let info: FlightInformation = {
    flightId: 'flightId',
    location: {
      latitude: 41.25716,
      longitude: -95.995102,
      altitude: 30,
    },
    groundSpeed: 40,
    heading: 50,
    source: {
      name: 'source-name',
      icaoCode: 'source-icao',
      coordinates: {
        latitude: 41.25716,
        longitude: -95.995102,
      },
    },
    destination: {
      name: 'destination-name',
      icaoCode: 'destination-icao',
      coordinates: {
        latitude: 41.25716,
        longitude: -95.995102,
      },
    },
    flightCollisions: [],
    flightPathCollisions: [],
    checkPoints: [0, 1, 2, 3, 4],
  };

  let flightCreatedMessage: FlightCreatedMessage = {
    room: 'room-abc',
    name: 'name-abc',
    message: 'message-abc',
    flightInformation: info,
  };

  const mockNoFlyZones = [
    {
      type: 'POLYGON',
      verticies: [{ latitude: 100, longitude: 200 }],
    },
  ];
  const mockActiveFlights = [
    {
      flightId: 'flightId',
      location: {
        latitude: 41.25716,
        longitude: -95.995102,
        altitude: 30,
      },
      groundSpeed: 40,
      heading: 50,
      source: {
        name: 'source-name',
        icaoCode: 'source-icao',
        coordinates: {
          latitude: 41.25716,
          longitude: -95.995102,
        },
      },
      destination: {
        name: 'destination-name',
        icaoCode: 'destination-icao',
        coordinates: {
          latitude: 41.25716,
          longitude: -95.995102,
        },
      },
      checkPoints: [0, 1, 2, 3, 4],
    },
    {
      flightId: 'flightId2',
      location: {
        latitude: 41.25716,
        longitude: -95.995102,
        altitude: 30,
      },
      groundSpeed: 40,
      heading: 50,
      source: {
        name: 'source-name2',
        icaoCode: 'source-icao2',
        coordinates: {
          latitude: 41.25716,
          longitude: -95.995102,
        },
      },
      destination: {
        name: 'destination-name2',
        icaoCode: 'destination-icao2',
        coordinates: {
          latitude: 41.25716,
          longitude: -95.995102,
        },
      },
      checkPoints: [0, 1, 2, 3, 4],
    },
  ];

  beforeEach(async () => {
    mockPersistenceService.getAllNoFlyZone.and.resolveTo(mockNoFlyZones);
    mockPersistenceService.getAllActiveFlight.and.resolveTo(mockActiveFlights);

    await controller.initialize();
  });

  it('should be created', () => {
    expect(controller).toBeTruthy();
  });

  describe('initialize', () => {
    it('should load flight information and no-fly zones', async () => {
      expect(mockPersistenceService.getAllNoFlyZone).toHaveBeenCalled();
      expect(mockPersistenceService.getAllActiveFlight).toHaveBeenCalled();
      expect(mockRenderer.createFlight).toHaveBeenCalledTimes(mockActiveFlights.length);
      expect(mockRenderer.CreateNoFlyZone).toHaveBeenCalledTimes(mockNoFlyZones.length);
      expect(controller.getPlanes().length).toEqual(2);
    });

    it('should handle errors during initialization', async () => {
      mockPersistenceService.getAllNoFlyZone.and.rejectWith(new Error('Failed to fetch data'));

      await expectAsync(controller.initialize()).toBeRejectedWithError('Failed to fetch data');
    });
  });

  it('should create a plane through socket event', async () => {
    const socketCreateFlightCallback = mockSocket.on.calls.argsFor(4)[1];
    socketCreateFlightCallback(flightCreatedMessage);

    expect(controller.getPlanes().length).toEqual(2);
  });

  it('should update flight location on socket event', async () => {
    const mockData: FlightLocationUpdatedMessage = {
      room: 'room-abc',
      name: 'name-abc',
      message: 'message-abc',
      heading: 5,
      flightId: 'flightId',
      groundSpeed: 5,
      newLocation: {
        latitude: 0,
        longitude: 0,
        altitude: 0,
      },
    };

    await new Promise((resolve) => setTimeout(resolve, 1000));

    const socketFlightLocationUpdated = mockSocket.on.calls.argsFor(0)[1];
    socketFlightLocationUpdated(mockData);

    const plane = controller.getPlanes()[0];
    expect(plane.flightInformation.heading).toEqual(5);
    expect(mockRenderer.updateFlightLocation).toHaveBeenCalled();
    expect(plane.flightInformation.location).toEqual(mockData.newLocation);
  });

  it('should update flight path on socket event', () => {
    const data: FlightPathUpdateMessage = {
      room: 'room-abc',
      name: 'name-abc',
      message: 'new-message',
      flightId: 'flightId',
      newCheckPoints: [0, 0, 0, 0],
    };

    // flight-path-updated event
    const socketFlightPathUpdated = mockSocket.on.calls.argsFor(1)[1];
    socketFlightPathUpdated(data);

    expect(mockRenderer.updateFlightPath).toHaveBeenCalled();
  });

  it('should draw alternate path when flight path intersects with no-fly-zone', () => {
    const data: FlightIntersectWithNoFlyZoneMessage = {
      room: 'room-abc',
      name: 'name-abc',
      message: 'new-message',
      noFlyZone: {
        id: '',
        altitude: 0,
        createdAt: '',
        notamNumber: '',
        type: 'CIRCLE',
        radius: 5,
        center: {
          latitude: 10,
          longitude: 10,
        },
      },
      flightInformation: {
        flightId: 'flightId',
        location: {
          latitude: 41.25716,
          longitude: -95.995102,
          altitude: 30,
        },
        groundSpeed: 40,
        heading: 50,
        source: {
          name: 'source-name',
          icaoCode: 'source-icao',
          coordinates: {
            latitude: 41.25716,
            longitude: -95.995102,
          },
        },
        destination: {
          name: 'destination-name',
          icaoCode: 'destination-icao',
          coordinates: {
            latitude: 41.25716,
            longitude: -95.995102,
          },
        },
        flightCollisions: [],
        flightPathCollisions: [],
        checkPoints: [0, 1, 2, 3, 4],
      },
    };

    // flight-path-intersect-with-no-fly-zone
    const socketFlightPathIntersectWithNoFlyZone = mockSocket.on.calls.argsFor(2)[1];
    socketFlightPathIntersectWithNoFlyZone(data);

    expect(mockRenderer.drawAlternatePath).toHaveBeenCalled();
  });

  it('should draw alternate path with flight path intersect with no-fly-zone', () => {
    const data: FlightEnteredNoFlyZoneMessage = {
      room: 'room-abc',
      name: 'name-abc',
      message: 'new-message',
      baseNoFlyZone: {
        id: '',
        altitude: 0,
        createdAt: '',
        notamNumber: '',
        type: 'CIRCLE',
        radius: 5,
        center: {
          latitude: 10,
          longitude: 10,
        },
      },
      flightInformation: {
        flightId: 'flightId',
        location: {
          latitude: 41.25716,
          longitude: -95.995102,
          altitude: 30,
        },
        groundSpeed: 40,
        heading: 50,
        source: {
          name: 'source-name',
          icaoCode: 'source-icao',
          coordinates: {
            latitude: 41.25716,
            longitude: -95.995102,
          },
        },
        destination: {
          name: 'destination-name',
          icaoCode: 'destination-icao',
          coordinates: {
            latitude: 41.25716,
            longitude: -95.995102,
          },
        },
        flightCollisions: [],
        flightPathCollisions: [],
        checkPoints: [0, 1, 2, 3],
      },
    };
    // flight-entered-no-fly-zone
    const socketFlightEnteredNoFlyZone = mockSocket.on.calls.argsFor(3)[1];
    socketFlightEnteredNoFlyZone(data);

    expect(mockRenderer.drawAlternatePath).toHaveBeenCalled();
  });
});
