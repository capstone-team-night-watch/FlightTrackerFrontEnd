import { SimulationRenderer } from './SimulationRenderer';
import { SimulationController } from './simulation-controller';
import { FlightInformation, FlightLocationUpdatedMessage } from './socket-events/flight-tracking';

describe('SimulationController', () => {
  let simulationController: SimulationController;
  let mockRenderer: SimulationRenderer;
  let mockSocket: any; // Mocked socket.io instance

  const flightLocationUpdatedData: FlightLocationUpdatedMessage = {
    flightInformation: {
      flightId: 'ABC123',
      location: {
        latitude: 10,
        longitude: 20,
        altitude: 30,
      },
      groundSpeed: 40,
      heading: 50,
      source: {
        name: 'SourceName',
        icaoCode: 'IcaoCode',
        coordinates: {
          latitude: 60,
          longitude: 70,
        },
      },
      destination: {
        name: 'DestinationName',
        icaoCode: 'IcaoCode',
        coordinates: {
          latitude: 80,
          longitude: 90,
        },
      },
      checkPoints: [
        {
          latitude: 100,
          longitude: 200,
        },
        {
          latitude: 10000,
          longitude: 20000,
        },
      ],
    },
  };

  beforeEach(() => {
    mockRenderer = jasmine.createSpyObj('SimulationRenderer', ['updateFlightLocation', 'createFlight']);
    mockSocket = jasmine.createSpyObj('Socket', ['on', 'emit']);

    simulationController = new SimulationController(mockRenderer);
    simulationController.socket = mockSocket;

    simulationController.initialize();
  });

  it('should create plane through socket', async () => {
    // (x)[y] - x is endpoint, y is callback function
    const flightCreatedCallback = mockSocket.on.calls.argsFor(1)[1];
    flightCreatedCallback(flightLocationUpdatedData);

    // wait so that everything in socket-end point finshes
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(simulationController.getPlanes().length).toEqual(1);
  });

  it('should update flight location through socket', async () => {
    // Create flight to update
    const flightCreatedCallback = mockSocket.on.calls.argsFor(1)[1];
    flightCreatedCallback(flightLocationUpdatedData);

    // wait so that everything in socket-end point finshes
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(simulationController.getPlanes().length).toEqual(1);

    // get flight-location-updated callback
    const flightLocationUpdatedCallback: (data: FlightLocationUpdatedMessage) => void =
      mockSocket.on.calls.argsFor(0)[1];

    const flightToUpate: FlightInformation = {
      flightId: 'ABC123',
      location: {
        latitude: 999,
        longitude: 999,
        altitude: 999,
      },
      groundSpeed: 40,
      heading: 50,
      source: {
        name: 'SourceName',
        icaoCode: 'IcaoCode',
        coordinates: {
          latitude: 60,
          longitude: 70,
        },
      },
      destination: {
        name: 'DestinationName',
        icaoCode: 'IcaoCode',
        coordinates: {
          latitude: 80,
          longitude: 90,
        },
      },
      checkPoints: [
        {
          latitude: 100,
          longitude: 200,
        },
        {
          latitude: 10000,
          longitude: 20000,
        },
      ],
    };

    flightLocationUpdatedCallback({ flightInformation: flightToUpate });

    // wait so that everything in socket-end point finshes
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const plane = simulationController.getPlanes()[0].flightInformation;

    expect(simulationController.getPlanes()[0].flightInformation.location).toEqual(plane.location);
  });

  it('should call createPlane() in activate flight through socket', async () => {
    // get activate-flight endpoint
    const activeFlightCallback = mockSocket.on.calls.argsFor(1)[1];
    activeFlightCallback(flightLocationUpdatedData);

    // wait so that everything in socket-end point finshes
    await new Promise((resolve) => setTimeout(resolve, 1000));

    expect(simulationController.getPlanes().length).toEqual(1);
  });
});
