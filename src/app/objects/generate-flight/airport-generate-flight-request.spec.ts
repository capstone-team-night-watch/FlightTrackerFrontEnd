import { AirportGenerateFlightRequest } from './airport-generate-flight-request';

describe('AirportGenerateFlightRequest', () => {
  let request: AirportGenerateFlightRequest;

  beforeEach(() => {
    request = new AirportGenerateFlightRequest();
  });

  it('should create an instance', () => {
    expect(new AirportGenerateFlightRequest()).toBeTruthy();
  });

  it('should return airline name if set', () => {
    let testName = 'Airline Test Name';
    request.setAirlineName(testName);
    expect(request.getAirlineName()).toEqual(testName);
  });

  it('should return falsy if airline name not set', () => {
    let airlineName = request.getAirlineName();
    expect(airlineName).toBeFalsy();
  });

  it('should return flight icao if set', () => {
    let flightIcao = 'Flight Acao';
    request.setFlightIcao(flightIcao);
    expect(request.getFlightIcao()).toEqual(flightIcao);
  });

  it('should return falsy if icao not set', () => {
    let icao = request.getFlightIcao();
    expect(icao).toBeFalsy();
  });
});
