import { GetFlightLocationResponse } from './get-flight-location-response';

describe('FlightLocation', () => {
  let response: GetFlightLocationResponse;

  beforeEach(() => {
    response = new GetFlightLocationResponse();
  });

  it('should create an instance', () => {
    expect(response).toBeTruthy();
  });

  it('should get and set the location', () => {
    const location = 'LOCATION';
    response.location = location;
    expect(response.location).toEqual(location);
  });
});
