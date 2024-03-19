import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Url } from '../lib/utils/url';
import { Injectable } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { CesiumViewController } from './view.controller';
import { RectangleNoFly } from './objects/rectangle-no-fly/rectangle-no-fly';
import { PolygonNoFly } from './objects/polygon-no-fly/polygon-no-fly';
import { EllipsoidNoFly } from './objects/ellipsoid-no-fly/ellipsoid-no-fly';
import { MilitaryBase } from './objects/military-base/military-base';
import { GetNoFlyZonesResponse } from './objects/get-no-fly-zones-response/get-no-fly-zones-response';
import { getNoFlyZonesConflictResponse } from './objects/get-no-fly-zones-conflict-response/get-no-fly-zones-conflict-response';
import { GetFlightLocationResponse } from './objects/get-flight-location-response/get-flight-location-response';
import {
  FlightDataFa_Id,
  FlightDataIdent,
  Operator,
} from './objects/aero-api/flight-data';

import { TfrNoFly } from './objects/tfr-no-fly/tfr-no-fly';

import { PlaceholderRepository } from './objects/placeholder-repository/placeholder-repository';//PLACEHOLDER

@Injectable({
    providedIn: 'root',
})
export class CesiumSimulationController {
    ellipsoidNoFly: EllipsoidNoFly = new EllipsoidNoFly();
    rectangleNoFly: RectangleNoFly = new RectangleNoFly();
    militaryBase: MilitaryBase = new MilitaryBase();
    polygonNoFly: PolygonNoFly = new PolygonNoFly();
    tfrNoFly: TfrNoFly = new TfrNoFly();
    getNoFlyZoneResponse: GetNoFlyZonesResponse;
    getTfrNoFlyZoneResponse: GetNoFlyZonesResponse;
    getNoFlyZoneConflictResponse: getNoFlyZonesConflictResponse;
    global_coord_map: Map<string, number[]> = new Map<string, number[]>();
    pointsMap: Map<string, any[]> = new Map<string, any[]>();
    entities: any;
    ellipsoids: any;
    rectangles: any;
    polygons: any;
    militaryBases: any;
    aeroFlightIdentResponse: FlightDataIdent;
    aeroFlightFaIdResponse: FlightDataFa_Id;
    aeroOperatorResponse: Operator;

    cesiumViewController: CesiumViewController = new CesiumViewController();
    placeholderRepository: PlaceholderRepository = new PlaceholderRepository();//PLACEHOLDER

    httpOptions = {
        headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        key: 'x-api-key',
        value: 'NNctr6Tjrw9794gFXf3fi6zWBZ78j6Gv3UCb3y0x',
        }),
    };
    
    // Needed so you can add params to http calls without messing up other service calls
    httpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        key: 'x-api-key',
        value: 'NNctr6Tjrw9794gFXf3fi6zWBZ78j6Gv3UCb3y0x',
    });
    
    aeroHttpHeaders = new HttpHeaders({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': 'true',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'GET,PUT,POST,DELETE',
        key: 'x-apikey',
        value: 'Lrpf86qKGBqgB8xwBvsFK0dMPhcqByAj',
    });
    
    constructor(public httpClient: HttpClient) {}

    public updateFlightsAndZones(
        div: string,
        longitude: number,
        latitude: number,
        altitude: number,
        flightIdent_Icao: string,
        airlineName: string | undefined,
        flightFaIdRespObj: FlightDataFa_Id | undefined
    ): void {
        // Sets up cesium viewer
        this.cesiumViewController.setUpViewer(div);
    
        // Load all no custom fly zones from database into cesium
        this.getAndLoadNoFlyZones();
    
        //
        this.getAndLoadTfrNoFlyZones();
        // Plots new flight point
        this.flyToAndPlotPoint(
            longitude,
            latitude,
            altitude,
            flightIdent_Icao,
            airlineName,
            flightFaIdRespObj
        );
    }

    public addEllipsoidNoFlyZone(noFlyIn: any) {
        this.placeholderRepository.addEllipsoidNoFlyZone(noFlyIn);
        this.getAndLoadNoFlyZones();
    }
    
    public addRectangleNoFlyZone(noFlyIn: any) {
        this.placeholderRepository.addRectangleNoFlyZone(noFlyIn);
        this.getAndLoadNoFlyZones();
    }
    
    public addPolygonNoFlyZone(noFlyIn: any) {
        this.placeholderRepository.addPolygonNoFlyZone(noFlyIn);
        this.getAndLoadNoFlyZones();
    }

    public deleteNoFlyZone() {
        let entity = this.cesiumViewController.global_viewer.selectedEntity.id;
        let zoneName = this.cesiumViewController.global_viewer.selectedEntity.name;
    
        this.cesiumViewController.global_viewer.entities.removeById(entity);
        let queryParams = new HttpParams();
        queryParams = queryParams.append('zoneName', zoneName);

        this.httpClient
        .get<string>(Url.consumer("/deleteNoFlyZone"), {
            headers: this.httpHeaders,
            params: queryParams,
        })
        .subscribe((response) => {
            console.log('Getting RESPONSE ' + response);
        });
    }

    public findFlight(flightIcao: string) {
        this.cesiumViewController.global_viewer.entities.values.forEach((element: any) => {
            if (element.id == 'Flight ICAO: ' + flightIcao) {
                this.cesiumViewController.global_viewer.zoomTo(element);
            }
        });
    }
    
    public getTrackedFlights(): string[] {
        const trackedFlights: string[] = [];
    
        this.global_coord_map.forEach((value: number[], key: string) => {
            trackedFlights.push(key);
        });
        return trackedFlights;
    }

    private checkInNoFly(
        longitude: number,
        latitude: number,
        altitude: number,
        flightLabel: string
    ): Observable<getNoFlyZonesConflictResponse> {
        let queryParams = new HttpParams();
        queryParams = queryParams.append('longitude', longitude);
        queryParams = queryParams.append('latitude', latitude);
        queryParams = queryParams.append('altitude', altitude);
    
        return this.httpClient
        .get<getNoFlyZonesConflictResponse>(
            Url.consumer('/getInNoFlyZone'),
            {
            headers: this.httpHeaders,
            params: queryParams,
            }
        )
        .pipe(
            tap((response) => {
            this.getNoFlyZoneConflictResponse = response;
            })
        );
    }

    private getFlightLocation(
        longitude: number,
        latitude: number,
        flightLabel: string
    ): Observable<GetFlightLocationResponse> {
        let queryParams = new HttpParams();
        queryParams = queryParams.append('longitude', longitude);
        queryParams = queryParams.append('latitude', latitude);
    
        return this.httpClient
        .get<GetFlightLocationResponse>(
            Url.consumer('/getFlightLocation'),
            {
            headers: this.httpHeaders,
            params: queryParams,
            }
        )
        .pipe(
            tap((response) => {
            console.log('Flight location response recieved' + response.location);
            })
        );
    }

    public getAndLoadNoFlyZones(): void {
        //FOR PLACEHOLDER REPOSITORY
        
        let testPlane = this.placeholderRepository.getFlightByICAO("TS1234");
        console.log("Should at least get here.");
        if (testPlane != null) {
            this.cesiumViewController.makePlane(this.cesiumViewController.global_viewer,
            testPlane.ident_icao,
            testPlane.last_position.latitude,
            testPlane.last_position.longitude,
            testPlane.last_position.altitude);
            console.log("Should have made flight");
        }
        

        //PLACEHOLDER
        this.getNoFlyZoneResponse = this.placeholderRepository.getNoFlyZonesResponse;
        //
        this.httpClient.get<GetNoFlyZonesResponse>(
        Url.consumer('/get-no-fly-zones'),
        this.httpOptions
        ).subscribe((data) => {
            this.getNoFlyZoneResponse = data;
            //
            //console.log('ELLIPSOID NO FLY ZONES')
            for (const ellipsoidNoFly of this.getNoFlyZoneResponse.ellipsoidNoFlyZones) {
                let contains: boolean = false;
                this.cesiumViewController.global_viewer.entities.values.forEach((element: any) => {
                    if (element.name == ellipsoidNoFly.name) {
                        contains = true;
                    }
                });

                if (!contains) {
                    this.cesiumViewController.addEllipsoidNoFlyZone(ellipsoidNoFly);
                    //console.log(ellipsoidNoFly)
                }
            }

            //console.log('RECTANGLE NO FLY ZONE')
            for (const rectangleNoFly of this.getNoFlyZoneResponse.rectangleNoFlyZones) {
                let contains: boolean = false;
                this.cesiumViewController.global_viewer.entities.values.forEach((element: any) => {
                    if (element.name == rectangleNoFly.name) {
                    contains = true;
                    }
                });

                if (!contains) {
                    this.cesiumViewController.addRectangleNoFlyZone(rectangleNoFly);
                    // console.log(rectangleNoFly)
                }
            }

            //console.log('POLYGON NO FLY ZONE')
            for (const polygonNoFly of this.getNoFlyZoneResponse
            .polygonNoFlyZones) {
                let contains: boolean = false;
                this.cesiumViewController.global_viewer.entities.values.forEach((element: any) => {
                    if (element.name == polygonNoFly.name) {
                        contains = true;
                    }
                });

                if (!contains) {
                    this.cesiumViewController.addPolygonNoFlyZone(polygonNoFly);
                }
            }   

            //console.log("MILITARY NO FLY ZONES")
            for (const militaryBase of this.getNoFlyZoneResponse
            .militaryNoFlyZones) {
                let data = JSON.parse(militaryBase.geoJson);

                let contains: boolean = false;
                this.cesiumViewController.global_viewer.entities.values.forEach((element: any) => {
                    if (element.name == militaryBase.name) {
                        contains = true;
                    }
                });

                let coords = data.coordinates.toString();
                let coordArray = coords.split(',');

                for (let i = 0; i < coordArray.length; i++) {
                    coordArray[i] = parseFloat(coordArray[i]);
                }

                if (!contains) {
                    this.cesiumViewController.addMilitaryNoFlyZone(militaryBase, coordArray);
                }
            }
        });//
    }

    public getAndLoadTfrNoFlyZones(): void {
        console.log('Loading TFR No FlyZones');
    
        this.httpClient
        .get<GetNoFlyZonesResponse>(
            Url.consumer('/getTfrNoFlyZones'),
            this.httpOptions
        )
        .subscribe((data) => {
            this.getTfrNoFlyZoneResponse = data;
    
            console.log('TFR NO FLY ZONES')
            console.log(this.getTfrNoFlyZoneResponse);
            for (const tfrNoFly of this.getTfrNoFlyZoneResponse.tfrNoFlyZones) {
                if(tfrNoFly.notamType === "BOUNDARY") {
                    this.cesiumViewController.addTFRBoundaryNoFlyZone(tfrNoFly);
                }
        
                if(tfrNoFly.notamType === "RADIUS") {
                    this.cesiumViewController.addTFRRadiusNoFlyZone(tfrNoFly);
                }
            }
        });
    }

    flyToAndPlotPoint(
        longitude: number,
        latitude: number,
        altitude: number,
        flightIdent_Icao: string,
        airlineName: string | undefined,
        flightFaIdRespObj: FlightDataFa_Id | undefined
    ){
        if (flightFaIdRespObj) {
            this.aeroFlightFaIdResponse = flightFaIdRespObj;
        }
    
        let airlineNmVal = airlineName ?? '';
    
        if (!this.global_coord_map.has(flightIdent_Icao)) {
            this.global_coord_map.set(flightIdent_Icao, []);
        }
        if (!this.pointsMap.has(flightIdent_Icao)) {
            this.pointsMap.set(flightIdent_Icao, []);
        }
    
        let current_coordinates = this.global_coord_map.get(flightIdent_Icao);
    
        let prevVals: number[] | undefined;
        let prevLong: number = 0;
        let prevLat: number = 0;
        let prevAlt: number = 0;
        let location_has_changed: boolean = true;
    
        if (current_coordinates != undefined && current_coordinates?.length > 0) {
            prevVals = current_coordinates?.slice(
                Math.max(current_coordinates.length - 3, 0)
            );
            console.log('sliced array: ' + prevVals);
        
            if (prevVals.length == 3) {
                prevLong = prevVals[0];
                prevLat = prevVals[1];
                prevAlt = prevVals[2];
                location_has_changed =
                longitude != prevLong || latitude != prevLat || altitude != prevAlt;
                console.log('location_has_changed: ' + location_has_changed);
            }
        }
    
        if (location_has_changed) {
            if (current_coordinates != undefined) {
                current_coordinates.push(longitude);
                current_coordinates.push(latitude);
                current_coordinates.push(altitude);
            }
        }
    
        if (!this.cesiumViewController.global_viewer.entities.getById('Flight ICAO: ' + flightIdent_Icao)) {
            this.cesiumViewController.global_viewer.camera.moveEnd.addEventListener(() =>
                this.cesiumViewController.makePlane(this.cesiumViewController.global_viewer, 'Flight ICAO: ' + flightIdent_Icao, 0, 0, 0));
        }
    
        // Making a line with the stored coordinates (OLD)
        /*
        if (location_has_changed && current_coordinates) {
            this.cesiumViewController.makeTrailLine(flightIdent_Icao, current_coordinates);
        }
        */

        //(NEW)
        /*
        let originLongIn, originLatIn = this.placeholderRepository.getAirportCoordinates(flightFaIdRespObj?.origin.code_icao);
        let destinationLongIn, destinationLatIn = this.placeholderRepository.getAirportCoordinates(flightFaIdRespObj?.destination.code_icao);
        console.log("Origin long: " + originLongIn);
        if (originLongIn != null && originLatIn != null) {
            this.cesiumViewController.makePastLine(flightIdent_Icao, originLatIn, originLongIn, flightFaIdRespObj)
        }
        if (destinationLatIn != null && destinationLongIn != null) {
            this.cesiumViewController.makePastLine(flightIdent_Icao, destinationLatIn, destinationLongIn, flightFaIdRespObj)
        }
        */
        this.cesiumViewController.makeTrailLine(flightIdent_Icao, flightFaIdRespObj?.waypoints);

        if (location_has_changed) {
            this.cesiumViewController.makePlane(
                this.cesiumViewController.global_viewer,
                'Flight ICAO: ' + flightIdent_Icao,
                longitude,
                latitude,
                altitude
            ).then((wait) => {
                if (this.aeroFlightFaIdResponse && flightFaIdRespObj != null) {
                    //
                    this.httpClient.get<FlightDataIdent>(
                        Url.producer('/flightident/') + flightIdent_Icao,
                        this.httpOptions
                    ).subscribe((flightResponse) => {
                        this.aeroFlightIdentResponse = flightResponse;
                        if (this.aeroFlightIdentResponse) {
                            this.httpClient.get<Operator>(
                                Url.producer('/operator/') +
                                this.aeroFlightIdentResponse.operator,
                                this.httpOptions
                            ).subscribe((operatorResponse) => {
                                this.aeroOperatorResponse = operatorResponse;
                                airlineNmVal = operatorResponse.name;
                                // console.log(operatorResponse)
                                console.log('airline: ' + airlineNmVal);
            
                                this.getFlightLocation(
                                    longitude,
                                    latitude,
                                    flightIdent_Icao
                                ).subscribe((response) => {
                                    this.checkInNoFly(
                                        longitude,
                                        latitude,
                                        altitude,
                                        flightIdent_Icao
                                    ).subscribe((data) => {
                                        let point: any;
                
                                        this.cesiumViewController.global_viewer.entities.values.forEach(
                                        (element: any) => {
                                            if (element.id == 'Flight ICAO: ' + flightIdent_Icao) {
                                                point = element;
                                            }
                                        });
                
                                        if (data.inConflict) {
                                            this.cesiumViewController.makeConflictBillboard(point, data.noFlyZoneName, flightFaIdRespObj,
                                                flightIdent_Icao, airlineNmVal, response.location, latitude, longitude, altitude);
                                        } else {
                                            this.cesiumViewController.makeFlightBillboard(point, flightFaIdRespObj,
                                                flightIdent_Icao, airlineNmVal, response.location, latitude, longitude, altitude);
                                        }
                                    });
                                });
                            });
                        }
                    });
                    //
                } else {
                    //
                    //If basically flight is generated
                    this.getFlightLocation(
                        longitude,
                        latitude,
                        flightIdent_Icao
                    ).subscribe((response) => {
                        this.checkInNoFly(
                        longitude,
                        latitude,
                        altitude,
                        flightIdent_Icao
                        ).subscribe((data) => {
                            let point: any;
                            this.cesiumViewController.global_viewer.entities.values.forEach((element: any) => {
                                if (element.id == 'Flight ICAO: ' + flightIdent_Icao) {
                                    point = element;
                                }
                            });
                
                            if (data.inConflict) {
                                this.cesiumViewController.makeMockConflictBillboard(point, data.noFlyZoneName, flightIdent_Icao, airlineNmVal,
                                    response.location, latitude, longitude, altitude);
                            } else {
                                this.cesiumViewController.makeMockFlightBillboard(point, flightIdent_Icao, airlineNmVal,
                                    response.location, latitude, longitude, altitude);
                            }
                        });
                    });
                    //
                }
            });
        }
    }
}
