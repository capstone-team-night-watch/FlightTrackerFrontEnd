import { EllipsoidNoFly } from "../ellipsoid-no-fly/ellipsoid-no-fly";
import { PolygonNoFly } from "../polygon-no-fly/polygon-no-fly";
import { RectangleNoFly } from "../rectangle-no-fly/rectangle-no-fly";
import { MilitaryBase } from '../military-base/military-base';
import { TfrNoFly } from "../tfr-no-fly/tfr-no-fly";
import { CesiumService } from '../../cesium.service';
import { CesiumViewController } from '../../view.controller';
import { CesiumSimulationController } from '../../simulation.controller';
import { GetNoFlyZonesResponse } from '../get-no-fly-zones-response/get-no-fly-zones-response';
import {
    FlightDataFa_Id,
    FlightDataIdent,
    BasicAirport,
    Position,
    Operator
  } from '../aero-api/flight-data';


export class PlaceholderRepository {

    private _getNoFlyZonesResponse: GetNoFlyZonesResponse = new GetNoFlyZonesResponse();
    private _flightsByFa_Id: FlightDataFa_Id[] = [];
    private _flightsByIdent: FlightDataIdent[] = [];
    private _flightOperators: Operator[] = [];
    private _airportICAOS: string[] = ["KJFK", "VIDP"];
    private _airportLongs: number[] = [-75, 75];//[-73.780968, 77.0988];
    private _airportLats: number[] = [40, 30];//[40.641766, 28.557777];

    private cesium: CesiumService;
    private cesiumViewController: CesiumViewController;
    private cesiumSimulationController: CesiumSimulationController;

    public get getNoFlyZonesResponse(): GetNoFlyZonesResponse {
        return this._getNoFlyZonesResponse;
    }

    public set getNoFlyZonesResponse(value: GetNoFlyZonesResponse) {
        this._getNoFlyZonesResponse = value;
    }

    public setUpRepository() {
        this._getNoFlyZonesResponse.ellipsoidNoFlyZones = [];
        this._getNoFlyZonesResponse.rectangleNoFlyZones = [];
        this._getNoFlyZonesResponse.polygonNoFlyZones = [];
        this._getNoFlyZonesResponse.militaryNoFlyZones = [];
        this._getNoFlyZonesResponse.tfrNoFlyZones = [];

        //Everything below can be deleted at a later date

        let testEllipsoid = new EllipsoidNoFly();
        testEllipsoid.name = "Test Ellipsoid";
        testEllipsoid.latitude = 41;
        testEllipsoid.longitude = -99;
        testEllipsoid.altitude = 5000;
        testEllipsoid.latRadius = 1000000;
        testEllipsoid.longRadius = 1000000;
        testEllipsoid.altRadius = 10000;

        let testRectangle = new RectangleNoFly();
        testRectangle.name = "Test Rectangle";
        testRectangle.northLatDegree = 50;
        testRectangle.southLatDegree = 30;
        testRectangle.westLongDegree = -50;
        testRectangle.eastLongDegree = -30;
        testRectangle.minAltitude = 0;
        testRectangle.maxAltitude = 10000;
        testRectangle.rotationDegree = 0;

        let testPolygon = new PolygonNoFly();
        testPolygon.name = "Test Polygon";
        testPolygon.vertex1Lat = -20;
        testPolygon.vertex1Long = -50;
        testPolygon.vertex2Lat = -20;
        testPolygon.vertex2Long = -30;
        testPolygon.vertex3Lat = 0;
        testPolygon.vertex3Long = -30;
        testPolygon.vertex4Lat = -10;
        testPolygon.vertex4Long = -60;
        testPolygon.minAltitude = 0;
        testPolygon.maxAltitude = 10000;

        let testMilitaryBase = new MilitaryBase();
        testMilitaryBase.name = "Test Military Base";
        testMilitaryBase.geoJson = "";

        this._getNoFlyZonesResponse.ellipsoidNoFlyZones = [testEllipsoid];
        this._getNoFlyZonesResponse.rectangleNoFlyZones = [testRectangle];
        this._getNoFlyZonesResponse.polygonNoFlyZones = [testPolygon];
        this._getNoFlyZonesResponse.militaryNoFlyZones = [];
        this._getNoFlyZonesResponse.tfrNoFlyZones = [];

        //this.createTestFlight();
        //this.checkInterval();
    }

    public checkInterval() {
        console.log("We out here.");
        /*
        this.cesium.flyToAndPlotPoint(
            this._flightsByFa_Id[0].last_position.longitude,
            this._flightsByFa_Id[0].last_position.latitude,
            this._flightsByFa_Id[0].last_position.altitude,
            this._flightsByFa_Id[0].ident_icao,
            this._flightsByFa_Id[0].origin.name,
            this._flightsByFa_Id[0]
        );
        */
        setInterval(this.checkInterval, 10000);
    }

    public createTestFlight() {
        let testFa_Id = {} as FlightDataFa_Id;
        
        testFa_Id.ident = "AIC102";
        testFa_Id.ident_icao = "AIC102";
        testFa_Id.ident_iata = "AI102";
        testFa_Id.fa_flight_id = "AIC102-1709487870-schedule-1653p";
        testFa_Id.actual_off = "2024-03-05T17:51:36Z";
        testFa_Id.actual_on = "";
        testFa_Id.foresight_predictions_available = "true";
        testFa_Id.predicted_out = "";
        testFa_Id.predicted_off = "";
        testFa_Id.predicted_on = "";
        testFa_Id.predicted_in = "";
        testFa_Id.predicted_out_source = "";
        testFa_Id.predicted_off_source = "";
        testFa_Id.predicted_on_source = "";
        testFa_Id.predicted_in_source = "";

        let originAirport = {} as BasicAirport;
        originAirport.code = "KJFK";
        originAirport.code_icao = "KJFK";
        originAirport.code_iata = "JFK";
        originAirport.code_lid = "JFK";
        originAirport.timezone = "America/New_York";
        originAirport.name = "John F Kennedy Int'l";
        originAirport.city = "New York";
        originAirport.airport_info_url = "/airports/KJFK";

        let destinationAirport = {} as BasicAirport;
        destinationAirport.code = "VIDP";
        destinationAirport.code_icao = "VIDP";
        destinationAirport.code_iata = "DEL";
        destinationAirport.code_lid = "";
        destinationAirport.timezone = "Asia/Kolkata";
        destinationAirport.name = "Indira Gandhi Int'l";
        destinationAirport.city = "New Delhi";
        destinationAirport.airport_info_url = "/airports/VIDP";

        testFa_Id.origin = originAirport;
        testFa_Id.destination = destinationAirport;

        testFa_Id.waypoints = [
            40.64,
            -73.78,
            40.69,
            -73.75,
            40.75,
            -73.72,
            40.75,
            -73.72,
            40.77,
            -73.71,
            40.8,
            -73.69,
            40.83,
            -73.68,
            40.83,
            -73.68,
            40.84,
            -73.67,
            40.86,
            -73.66,
            40.89,
            -73.64,
            40.92,
            -73.63,
            40.92,
            -73.63,
            40.93,
            -73.62,
            41.02,
            -73.57,
            41.18,
            -73.48,
            41.22,
            -73.46,
            41.26,
            -73.44,
            41.3,
            -73.41,
            41.42,
            -73.35,
            41.46,
            -73.32,
            41.49,
            -73.3,
            41.5,
            -73.3,
            41.57,
            -73.3,
            41.57,
            -73.3,
            41.71,
            -73.29,
            41.8,
            -73.29,
            41.88,
            -73.29,
            41.9,
            -73.28,
            41.98,
            -73.27,
            42.07,
            -73.25,
            42.14,
            -73.24,
            42.2,
            -73.22,
            42.31,
            -73.2,
            42.33,
            -73.19,
            42.33,
            -73.18,
            42.55,
            -72.99,
            42.83,
            -72.79,
            43.98,
            -71.97,
            44.94,
            -71.25,
            45.38,
            -70.91,
            45.8,
            -70.6,
            45.82,
            -70.59,
            45.85,
            -70.56,
            46.29,
            -70.21,
            46.34,
            -70.17,
            46.35,
            -70.16,
            46.36,
            -70.15,
            46.48,
            -70.06,
            46.49,
            -70.05,
            46.49,
            -70.04,
            47.3,
            -69.37,
            47.74,
            -69,
            48.07,
            -68.81,
            49.73,
            -67.79,
            51.34,
            -66.72,
            51.65,
            -66.5,
            51.98,
            -66.22,
            53.29,
            -65.32,
            54.91,
            -64.03,
            55.25,
            -63.85,
            56.49,
            -62.68,
            58.13,
            -61.12,
            58.68,
            -60.56,
            59.11,
            -60.1,
            59.62,
            -59.47,
            59.82,
            -59.42,
            60.47,
            -58.59,
            60.47,
            -58.52,
            60.95,
            -57.93,
            60.97,
            -58,
            61.67,
            -57.26,
            62.9,
            -55.95,
            63.28,
            -55.4,
            63.3,
            -55.37,
            63.91,
            -54.59,
            64.58,
            -53.65,
            64.7,
            -53.54,
            65.47,
            -52.43,
            67,
            -50,
            67.54,
            -48.51,
            70,
            -40,
            75,
            -20,
            75.55,
            -14.69,
            76.36,
            0,
            76.41,
            3.37,
            76.42,
            6.75,
            76.38,
            10.13,
            76,
            20,
            75.56,
            23.53,
            75.07,
            26.85,
            74.67,
            29.2,
            73.35,
            35.54,
            69.32,
            47.65,
            67.84,
            50.7,
            57.3,
            63.66,
            55.52,
            65.06,
            42.69,
            72.18,
            40.83,
            72.94,
            39.89,
            73.31,
            35.21,
            75.01,
            32.08,
            76.03,
            30.51,
            76.52,
            30.45,
            76.54,
            30.4,
            76.56,
            30.19,
            76.62,
            29.9,
            76.71,
            29.65,
            76.78,
            29.34,
            76.87,
            29.18,
            76.92,
            28.97,
            76.98,
            28.93,
            77,
            28.81,
            77.03,
            28.73,
            77.06,
            28.65,
            77.08,
            28.57,
            77.1
        ];

        testFa_Id.first_position_time = "2024-03-05T17:23:39Z";

        let lastPosition = {} as Position;
        lastPosition.altitude = 330;
        lastPosition.altitude_change = "-";
        lastPosition.groundspeed = 500;
        lastPosition.heading = 136;
        lastPosition.latitude = 71.37;//379;
        lastPosition.longitude = 42.4;//39663;
        lastPosition.timestamp = "2024-03-06T01:03:33Z";
        lastPosition.update_type = "P";

        testFa_Id.last_position = lastPosition;

        testFa_Id.bounding_box = [
            76.42177,
            -73.78644,
            40.62222,
            42.39663
        ];
        testFa_Id.ident_prefix = "";
        testFa_Id.aircraft_type = "B77W";

        this._flightsByFa_Id.push(testFa_Id);
        console.log(this._flightsByFa_Id[0].ident);

        return testFa_Id;
    }

    public getFlightByICAO(flightICAO: string) {
        for (let i = 0; i < this._flightsByFa_Id.length; i++) {
            if (this._flightsByFa_Id[i].ident_icao == flightICAO) {
                return this._flightsByFa_Id[i];
            }
        }
        return null;
    }

    public getAirportCoordinates(airportICAO: string | undefined) {
        if (airportICAO != undefined) {
            for (let i = 0; i < this._airportICAOS.length; i++) {
                if (this._airportICAOS[i] == airportICAO) {
                    return this._airportLongs[i], this._airportLats[i];
                }
            }
        }
        return null;
    }

    public deleteNoFlyZone(zoneName: string) {
        for (let i = 0; i < this._getNoFlyZonesResponse.ellipsoidNoFlyZones.length; i++) {
            if (this._getNoFlyZonesResponse.ellipsoidNoFlyZones[i].name == zoneName) {
                this._getNoFlyZonesResponse.ellipsoidNoFlyZones.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < this._getNoFlyZonesResponse.rectangleNoFlyZones.length; i++) {
            if (this._getNoFlyZonesResponse.rectangleNoFlyZones[i].name == zoneName) {
                this._getNoFlyZonesResponse.rectangleNoFlyZones.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < this._getNoFlyZonesResponse.polygonNoFlyZones.length; i++) {
            if (this._getNoFlyZonesResponse.polygonNoFlyZones[i].name == zoneName) {
                this._getNoFlyZonesResponse.polygonNoFlyZones.splice(i, 1);
                break;
            }
        }
        for (let i = 0; i < this._getNoFlyZonesResponse.militaryNoFlyZones.length; i++) {
            if (this._getNoFlyZonesResponse.militaryNoFlyZones[i].name == zoneName) {
                this._getNoFlyZonesResponse.militaryNoFlyZones.splice(i, 1);
                break;
            }
        }
    }

    public addEllipsoidNoFlyZone(ellipsoidIn: EllipsoidNoFly) {
        this._getNoFlyZonesResponse.ellipsoidNoFlyZones.push(ellipsoidIn); 
    }

    public addRectangleNoFlyZone(rectangleIn: RectangleNoFly) {
        this._getNoFlyZonesResponse.rectangleNoFlyZones.push(rectangleIn);
    }

    public addPolygonNoFlyZone(polygonIn: PolygonNoFly) {
        this._getNoFlyZonesResponse.polygonNoFlyZones.push(polygonIn);
    }
}
