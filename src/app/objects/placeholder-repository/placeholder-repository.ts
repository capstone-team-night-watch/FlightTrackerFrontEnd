import { EllipsoidNoFly } from "../ellipsoid-no-fly/ellipsoid-no-fly";
import { PolygonNoFly } from "../polygon-no-fly/polygon-no-fly";
import { RectangleNoFly } from "../rectangle-no-fly/rectangle-no-fly";
import { MilitaryBase } from '../military-base/military-base';
import { TfrNoFly } from "../tfr-no-fly/tfr-no-fly";
import { CesiumService } from '../../cesium.service';
import { ViewController } from '../../view.controller';
import { SimulationController } from '../../simulation.controller';
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

    private cesium: CesiumService;
    private viewController: ViewController;
    private simulationController: SimulationController;

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

        this.createTestFlight();
        this.checkInterval();
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
        
        testFa_Id.ident = "Test Ident";
        testFa_Id.ident_icao = "TS1234";
        testFa_Id.ident_iata = "TST";
        testFa_Id.fa_flight_id = "OPAQUE";
        testFa_Id.actual_off = "12:00:00";
        testFa_Id.actual_on = "18:00:00";
        testFa_Id.foresight_predictions_available = "FALSE";
        testFa_Id.predicted_out = "11:00:00";
        testFa_Id.predicted_off = "12:00:00";
        testFa_Id.predicted_on = "18:00:00";
        testFa_Id.predicted_in = "19:00:00";
        testFa_Id.predicted_out_source = "OUT_TEST";
        testFa_Id.predicted_off_source = "OFF_TEST";
        testFa_Id.predicted_on_source = "ON_TEST";
        testFa_Id.predicted_in_source = "IN_TEST";

        let originAirport = {} as BasicAirport;
        originAirport.code = "1";
        originAirport.code_icao = "OR1234";
        originAirport.code_iata = "ORI";
        originAirport.code_lid = "ORI";
        originAirport.name = "Origin Airport";
        originAirport.city = "Origin City";
        originAirport.airport_info_url = "https://www.google.com";

        let destinationAirport = {} as BasicAirport;
        destinationAirport.code = "2";
        destinationAirport.code_icao = "DE1234";
        destinationAirport.code_iata = "DES";
        destinationAirport.code_lid = "DES";
        destinationAirport.name = "Destination Airport";
        destinationAirport.city = "Destination City";
        destinationAirport.airport_info_url = "https://duckduckgo.com";

        testFa_Id.origin = originAirport;
        testFa_Id.destination = destinationAirport;

        testFa_Id.waypoints = [];
        testFa_Id.first_position_time = "12:00:00";

        let lastPosition = {} as Position;
        lastPosition.altitude = 10000;
        lastPosition.altitude_change = "SURE";
        lastPosition.groundspeed = 600;
        lastPosition.heading = 0;
        lastPosition.latitude = 10;
        lastPosition.longitude = 10;
        lastPosition.timestamp = "15:00:00";
        lastPosition.update_type = "YES";

        testFa_Id.last_position = lastPosition;

        testFa_Id.bounding_box = [];
        testFa_Id.ident_prefix = "TS";
        testFa_Id.aircraft_type = "747";

        this._flightsByFa_Id.push(testFa_Id);
        console.log(this._flightsByFa_Id[0].ident);
        /*
        this.cesium.makePlane(
            this.cesium.global_viewer,
            this._flightsByFa_Id[0].ident_icao,
            this._flightsByFa_Id[0].last_position.latitude,
            this._flightsByFa_Id[0].last_position.longitude,
            this._flightsByFa_Id[0].last_position.altitude
        );
        */
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
