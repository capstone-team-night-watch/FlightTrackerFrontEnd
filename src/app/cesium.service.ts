import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable, LOCALE_ID } from '@angular/core';
import { RectangleNoFly } from './objects/rectangle-no-fly/rectangle-no-fly';
import { PolygonNoFly } from './objects/polygon-no-fly/polygon-no-fly';
import { EllipsoidNoFly } from './objects/ellipsoid-no-fly/ellipsoid-no-fly';
import { GetNoFlyZonesResponse } from './objects/get-no-fly-zones-response/get-no-fly-zones-response';
import { getNoFlyZonesConflictResponse } from './objects/get-no-fly-zones-conflict-response/get-no-fly-zones-conflict-response';
import { Observable, elementAt, tap } from 'rxjs';
import { GetFlightLocationResponse } from './objects/get-flight-location-response/get-flight-location-response';
import { MilitaryBase } from './objects/military-base/military-base';
import {
  FlightDataFa_Id,
  FlightDataIdent,
  Operator,
} from './objects/aero-api/flight-data';
import { Cartesian3, Color, Entity, Ion, IonResource, Quaternion, Transforms, Viewer } from 'cesium';

// declare let Cesium: any;

// TODO: Consider hiding this api token so it is not stored on the front-end
Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNzIyMjA2MC02ZDY2LTQ1YmUtYjc0Yi05MzFhY2ViZWNkMWUiLCJpZCI6MTIzOTU4LCJpYXQiOjE2NzU4OTY5MzV9.iWKvQ4p-2joQPJ4o3vMeT3HDeBkyKb5ijeA87NEppa4';

@Injectable({
  providedIn: 'root',
})
export class CesiumService {
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

  ellipsoidNoFly: EllipsoidNoFly = new EllipsoidNoFly();
  rectangleNoFly: RectangleNoFly = new RectangleNoFly();
  militaryBase: MilitaryBase = new MilitaryBase();
  polygonNoFly: PolygonNoFly = new PolygonNoFly();
  getNoFlyZoneResponse: GetNoFlyZonesResponse;
  getNoFlyZoneConflictResponse: getNoFlyZonesConflictResponse;
  prevFlightLabel: string;
  global_viewer: any;
  global_coord_map: Map<string, number[]> = new Map<string, number[]>();
  conflictFlights: string[];
  pointsMap: Map<string, any[]> = new Map<string, any[]>();
  entities: any;
  ellipsoids: any;
  rectangles: any;
  polygons: any;
  militaryBases: any;
  aeroFlightIdentResponse: FlightDataIdent;
  aeroFlightFaIdResponse: FlightDataFa_Id;
  aeroOperatorResponse: Operator;

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
    this.setUpViewer(div);

    // Load all no custom fly zones from database into cesium
    this.getAndLoadNoFlyZones();
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

  public setUpViewer(div: string): void {
    // Setting up viewer. Checks to make sure it doesn't exist before creating a new one
    Math.setRandomNumberSeed(1234);
    if (this.global_viewer == null || this.global_viewer == undefined) {
      this.global_viewer = new Viewer(div, {
        animation: false,
        timeline: false,
      });
      this.entities = this.global_viewer.entities;
      this.ellipsoids = this.entities.add(new Entity());
      this.rectangles = this.entities.add(new Entity());
      this.polygons = this.entities.add(new Entity());
      this.militaryBases = this.entities.add(new Entity());
    }
  }

  public hidePolygonNoFlys() {
    this.polygons.show = !this.polygons.show;
  }

  public hideRectangleNoFlyz() {
    this.rectangles.show = !this.rectangles.show;
  }

  public hideEllipsoidNoFlyz() {
    this.ellipsoids.show = !this.ellipsoids.show;
  }

  public hideMilitaryBasesNoFlyz() {
    this.militaryBases.show = !this.militaryBases.show;
  }

  public hideSelected() {
    this.global_viewer.selectedEntity.show =
      !this.global_viewer.selectedEntity.show;

    var parentId = this.global_viewer.selectedEntity.id;

    this.global_viewer.entities.values.forEach((element: any) => {
      if (element.parent != undefined && element.parent.id == parentId) {
        element.show = !element.show;
      }
    });
  }

  public resetEntities() {
    var list: any[] = [];
    this.global_viewer.entities.values.forEach((element: any) => {
      if (element.show == false) {
        list.push(element);
        console.log('NOT SHOWING' + element.id);
      }
    });

    if (list.length > 0) {
      list.forEach((element) => {
        this.global_viewer.entities.getById(element.id).show = true;
      });
    }
  }

  public deleteNoFlyZone() {
    var zoneName = this.global_viewer.selectedEntity.name;
    var entity = this.global_viewer.selectedEntity.id;
    console.log(entity);
    this.global_viewer.entities.removeById(entity);
    let queryParams = new HttpParams();
    queryParams = queryParams.append('zoneName', zoneName);

    this.httpClient
      .get<string>('http://34.198.166.4:9093/deleteNoFlyZone', {
        headers: this.httpHeaders,
        params: queryParams,
      })
      .subscribe((response) => {
        console.log('Getting RESPONSE ' + response);
      });
  }

  public flyToNoFlyZone(zoneName: string) {
    this.global_viewer.entities.values.forEach((element: any) => {
      if (element.name == zoneName) {
        this.global_viewer.zoomTo(element);
      }
      if (element.name == zoneName) {
        this.global_viewer.zoomTo(element);
      }
    });
  }

  public findFlight(flightIcao: string) {
    this.global_viewer.entities.values.forEach((element: any) => {
      if (element.id == 'Flight ICAO: ' + flightIcao) {
        this.global_viewer.zoomTo(element);
      }
    });
  }

  public getTrackedFlights(): string[] {
    var tracked_flights: string[] = [];

    this.global_coord_map.forEach((value: number[], key: string) => {
      tracked_flights.push(key);
    });
    return tracked_flights;
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
        'http://34.198.166.4:9093/getInNoFlyZone',
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
        'http://34.198.166.4:9093/getFlightLocation',
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

  public async makePlane(
    view: any,
    name: string,
    long: number,
    lat: number,
    alt: number
  ) {
    // If plane exists
    if (view.entities.getById(name)) {
      let oldAirplane = view.entities.getById(name);

      // Move plane and change scale
      if (!(long == 0 && lat == 0 && alt == 0)) {
        let newPosition = new Cartesian3.fromDegrees(long, lat, alt);

        let direction = Cartesian3.subtract(
          newPosition,
          oldAirplane._position._value,
          new Cartesian3()
        );
        Cartesian3.normalize(direction, direction);

        let rotationMatrix =
          Transforms.rotationMatrixFromPositionVelocity(
            oldAirplane._position._value,
            direction
          );

        oldAirplane._position._value = newPosition;

        let newOrientation = new Quaternion();
        Quaternion.fromRotationMatrix(rotationMatrix, newOrientation);
        oldAirplane.orientation = newOrientation;
      }
      let distance = Cartesian3.distance(
        oldAirplane._position._value,
        view.camera.position
      );
      oldAirplane._model._scale._value = distance / (100 + distance / 10000);
    } else {
      // If this is a new plane, make it
      view.entities.remove(view.entities.getById(name));
      let newPosition =  Cartesian3.fromDegrees(long, lat, alt);
      let distance = Cartesian3.distance(
        newPosition,
        view.camera.position
      );

      const pUri = await IonResource.fromAssetId(1662340);
      let airplane = {
        id: name,
        name: name,
        position: newPosition,
        model: {
          uri: pUri,

          scale: distance / (100 + distance / 10000),
        },
      };
      view.entities.add(airplane);
    }
  }

  public getAndLoadNoFlyZones(): void {
    console.log('Loading No FlyZones');

    this.httpClient
      .get<GetNoFlyZonesResponse>(
        'http://34.198.166.4:9093/get-no-fly-zones',
        this.httpOptions
      )
      .subscribe((data) => {
        this.getNoFlyZoneResponse = data;

        //console.log('ELLIPSOID NO FLY ZONES')
        for (const ellipsoidNoFly of this.getNoFlyZoneResponse
          .ellipsoidNoFlyZones) {
          var contains: boolean = false;
          this.global_viewer.entities.values.forEach((element: any) => {
            if (element.name == ellipsoidNoFly.name) {
              contains = true;
            }
          });

          if (!contains) {
            this.global_viewer.entities.add({
              parent: this.ellipsoids,
              name: ellipsoidNoFly.name,
              position: Cartesian3.fromDegrees(
                Number(ellipsoidNoFly.longitude),
                Number(ellipsoidNoFly.latitude),
                Number(ellipsoidNoFly.altitude)
              ),
              ellipsoid: {
                radii: new Cartesian3(
                  ellipsoidNoFly.longRadius,
                  ellipsoidNoFly.latRadius,
                  ellipsoidNoFly.altRadius
                ),
                material: Color.RED.withAlpha(0.5),
              },
            });
            //console.log(ellipsoidNoFly)
          }
        }

        //console.log('RECTANGLE NO FLY ZONE')
        for (const rectangleNoFly of this.getNoFlyZoneResponse
          .rectangleNoFlyZones) {
          var contains: boolean = false;
          this.global_viewer.entities.values.forEach((element: any) => {
            if (element.name == rectangleNoFly.name) {
              contains = true;
            }
          });

          if (!contains) {
            this.global_viewer.entities.add({
              parent: this.rectangles,
              name: rectangleNoFly.name, // String name
              rectangle: {
                rotation: Math.toRadians(
                  Number(rectangleNoFly.rotationDegree)
                ), // .toRadians( rotation value )
                extrudedHeight: Number(rectangleNoFly.minAltitude), //Minimum Height
                height: Number(rectangleNoFly.maxAltitude),
                material: Color.TEAL.withAlpha(0.5),
                coordinates: Rectangle.fromDegrees(
                  Number(rectangleNoFly.westLongDegree),
                  Number(rectangleNoFly.southLatDegree),
                  Number(rectangleNoFly.eastLongDegree),
                  Number(rectangleNoFly.northLatDegree)
                ),
              },
            });
            // console.log(rectangleNoFly)
          }
        }

        //console.log('POLYGON NO FLY ZONE')
        for (const polygonNoFly of this.getNoFlyZoneResponse
          .polygonNoFlyZones) {
          var contains: boolean = false;
          this.global_viewer.entities.values.forEach((element: any) => {
            if (element.name == polygonNoFly.name) {
              contains = true;
            }
          });

          if (!contains) {
            this.global_viewer.entities.add({
              parent: this.polygons,
              name: polygonNoFly.name, //String Name

              polygon: {
                hierarchy: {
                  positions: Cartesian3.fromDegreesArrayHeights([
                    polygonNoFly.vertex1Long,
                    polygonNoFly.vertex1Lat,
                    polygonNoFly.maxAltitude,
                    polygonNoFly.vertex2Long,
                    polygonNoFly.vertex2Lat,
                    polygonNoFly.maxAltitude,
                    polygonNoFly.vertex3Long,
                    polygonNoFly.vertex3Lat,
                    polygonNoFly.maxAltitude,
                    polygonNoFly.vertex4Long,
                    polygonNoFly.vertex4Lat,
                    polygonNoFly.maxAltitude,
                  ]),

                  //shapeValues: Array ordered: vertex 1 Longitude, vertex 1 Latitude, max height, vertex 2 Longitude, vertex 2 Latitude, max height, ...
                },
                extrudedHeight: polygonNoFly.minAltitude, //int minimum height
                perPositionHeight: true,
                material: Color.VIOLET.withAlpha(0.5),
              },
            });
          }
        }

        //console.log("MILITARY NO FLY ZONES")
        for (const militaryBase of this.getNoFlyZoneResponse
          .militaryNoFlyZones) {
          let data = JSON.parse(militaryBase.geoJson);

          var contains: boolean = false;
          this.global_viewer.entities.values.forEach((element: any) => {
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
            this.global_viewer.entities.add({
              parent: this.militaryBases,
              name: militaryBase.name, //String Name
              polygon: {
                hierarchy: {
                  positions: Cesium.Cartesian3.fromDegreesArray(coordArray),
                  //shapeValues: Array ordered: vertex 1 Longitude, vertex 1 Latitude, max height, vertex 2 Longitude, vertex 2 Latitude, max height, ...
                },
                extrudedHeight: 30000, //int minimum height
                perPositionHeight: true,
                material: Cesium.Color.SALMON.withAlpha(0.5),
              },
            });
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
  ) {
    //console.log("Inside Fly to and Plot Point" + flightDetails.flight)
    if (flightFaIdRespObj) {
      this.aeroFlightFaIdResponse = flightFaIdRespObj;
    }

    let airlineNmVal = airlineName || '';
    //let waypoints: number[] | undefined;
    //let current_coord_arr: number[] | undefined;

    let conflictResponse: string = '';

    if (!this.global_coord_map.has(flightIdent_Icao)) {
      this.global_coord_map.set(flightIdent_Icao, []);
    }
    if (!this.pointsMap.has(flightIdent_Icao)) {
      this.pointsMap.set(flightIdent_Icao, []);
    }

    let current_coord_arr = this.global_coord_map.get(flightIdent_Icao);
    let prev_entity_point: any[] | undefined =
      this.pointsMap.get(flightIdent_Icao);
    let prevVals: number[] | undefined;
    let prevLong: number = 0;
    let prevLat: number = 0;
    let prevAlt: number = 0;
    let location_has_changed: boolean = true;

    if (current_coord_arr != undefined && current_coord_arr?.length > 0) {
      prevVals = current_coord_arr?.slice(
        Math.max(current_coord_arr.length - 3, 0)
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
      if (current_coord_arr != undefined) {
        current_coord_arr.push(longitude);
        current_coord_arr.push(latitude);
        current_coord_arr.push(altitude);
      }
    }

    if (
      !this.global_viewer.entities.getById('Flight ICAO: ' + flightIdent_Icao)
    ) {
      this.global_viewer.camera.moveEnd.addEventListener(() =>
        this.makePlane(
          this.global_viewer,
          'Flight ICAO: ' + flightIdent_Icao,
          0,
          0,
          0
        )
      );
    }

    // Making a line with the stored coordinates
    if (location_has_changed) {
      this.global_viewer.entities.add({
        name: flightIdent_Icao,
        parent: this.global_viewer.entities.getById(
          'Flight ICAO: ' + flightIdent_Icao
        ),
        polyline: {
          positions:
            Cesium.Cartesian3.fromDegreesArrayHeights(current_coord_arr),
          width: 10,
          material: Cesium.Color.PURPLE,
          clampToGround: false,
        },
      });
    }
    if (location_has_changed) {
      this.makePlane(
        this.global_viewer,
        'Flight ICAO: ' + flightIdent_Icao,
        longitude,
        latitude,
        altitude
      ).then((wait) => {
        if (this.aeroFlightFaIdResponse && flightFaIdRespObj != null) {
          this.httpClient
            .get<FlightDataIdent>(
              'http://34.198.166.4/flightident/' + flightIdent_Icao,
              this.httpOptions
            )
            .subscribe((flightResponse) => {
              this.aeroFlightIdentResponse = flightResponse;
              if (this.aeroFlightIdentResponse) {
                //console.log(this.aeroFlightIdentResponse)
                // if (this.aeroFlightFaIdResponse.waypoints && this.aeroFlightFaIdResponse.waypoints.length > 0) {
                //   let count = 0;
                //   let prev_coord: number;
                //   for (var coordinate of this.aeroFlightFaIdResponse.waypoints) {
                //     prev_coord = coordinate;
                //     count++;
                //     if (count == 2) {
                //       waypoints?.push(coordinate);
                //       waypoints?.push(prev_coord);
                //       waypoints?.push(altitude);
                //       count = 0;
                //       prev_coord = 0;
                //     }
                //   }
                //   console.log("Waypoints provided");

                //   current_coord_arr = this.global_coord_map.get(flightIdent_Icao);
                //   if (waypoints && current_coord_arr && waypoints.length > 0) {
                //     if (waypoints[1] !== current_coord_arr[0]) {
                //       console.log("adding waypoints")
                //       waypoints.push(...current_coord_arr);
                //       current_coord_arr = waypoints;
                //     }
                //   }
                // }

                this.httpClient
                  .get<Operator>(
                    'http://34.198.166.4/operator/' +
                      this.aeroFlightIdentResponse.operator,
                    this.httpOptions
                  )
                  .subscribe((operatorResponse) => {
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
                        var point: any;
                        this.global_viewer.entities.values.forEach(
                          (element: any) => {
                            if (
                              element.id ==
                              'Flight ICAO: ' + flightIdent_Icao
                            ) {
                              point = element;
                            }
                          }
                        );
                        //console.log("CONFLICT RESPONSE STRING: " + conflictResponse);
                        if (data.inConflict) {
                          point.description =
                            '<p> Flight ICAO: ' +
                            flightIdent_Icao +
                            ' is in no fly zone: ' +
                            data.noFlyZoneName +
                            '<br>\
                        For Airline: ' +
                            airlineNmVal +
                            '</p><br> Flight location is over ' +
                            response.location +
                            ' <br> Origin Place: ' +
                            flightFaIdRespObj?.origin.name +
                            ' <br> Takeoff Time: ' +
                            flightFaIdRespObj?.actual_off +
                            ' <br> Destination: ' +
                            flightFaIdRespObj?.destination?.name +
                            ' <br> GroundSpeed: ' +
                            flightFaIdRespObj?.last_position?.groundspeed +
                            ' <br> Flight Latitude: ' +
                            latitude +
                            ' <br> Flight Longitude: ' +
                            longitude +
                            ' <br> Flight Altitude: ' +
                            altitude +
                            ' <br> Altitude Change: ' +
                            flightFaIdRespObj?.last_position?.altitude_change +
                            ' <br> Heading: ' +
                            flightFaIdRespObj?.last_position?.heading +
                            ' <br> Aircraft Type: ' +
                            flightFaIdRespObj?.aircraft_type +
                            ' <br> Time latest position recieved: ' +
                            flightFaIdRespObj?.last_position?.timestamp +
                            '</p>';

                          this.global_viewer.selectedEntity = point;
                          point.billboard = {
                            image: '/assets/images/WarningLabel.png',
                            verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                            pixelOffset: new Cesium.Cartesian2(0, 35),
                            width: 57,
                            height: 15,
                          };
                        } else {
                          point.description =
                            '<p> Flight ICAO: ' +
                            flightIdent_Icao +
                            ' is over ' +
                            response.location +
                            '<br> ' +
                            'Airline: ' +
                            airlineNmVal +
                            ' <br> Origin Place: ' +
                            flightFaIdRespObj?.origin.name +
                            ' <br> Takeoff Time: ' +
                            flightFaIdRespObj?.actual_off +
                            ' <br> Destination: ' +
                            flightFaIdRespObj?.destination?.name +
                            ' <br> GroundSpeed: ' +
                            flightFaIdRespObj?.last_position?.groundspeed +
                            ' <br> Flight Latitude: ' +
                            latitude +
                            ' <br> Flight Longitude: ' +
                            longitude +
                            ' <br> Flight Altitude: ' +
                            altitude +
                            ' <br> Altitude Change: ' +
                            flightFaIdRespObj?.last_position?.altitude_change +
                            ' <br> Heading: ' +
                            flightFaIdRespObj?.last_position?.heading +
                            ' <br> Aircraft Type: ' +
                            flightFaIdRespObj?.aircraft_type +
                            ' <br> Time latest position recieved: ' +
                            flightFaIdRespObj?.last_position?.timestamp +
                            '</p>';

                          point.billboard = undefined;
                        }
                      });
                    });
                  });
              }
            });
        } else {
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
              this.global_viewer.entities.values.forEach((element: any) => {
                if (element.id == 'Flight ICAO: ' + flightIdent_Icao) {
                  point = element;
                }
              });

              if (data.inConflict) {
                point.description = `
                  <b>This is a mock generated flight</b><br>
                  <p>Flight ICAO: ${flightIdent_Icao} is in no fly zone: ${data.noFlyZoneName}<br>
                  For Airline: ${airlineName}</p><br>
                  Flight location is over ${response.location}<br>
                  Flight Latitude: ${latitude}<br>
                  Flight Longitude: ${longitude}<br>
                  Flight Altitude: ${altitude}
                `;

                this.global_viewer.selectedEntity = point;
                point.billboard = {
                  image: '/assets/images/WarningLabel.png',
                  verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
                  pixelOffset: new Cesium.Cartesian2(0, 35),
                  width: 57,
                  height: 15,
                };
              } else {
                point.description = `
                  <b>This is a mock generated flight</b><br>
                  <p>Flight ICAO: ${flightIdent_Icao} is over ${response.location}<br>
                  Airline: ${airlineName}<br>
                  Flight Latitude: ${latitude}<br>
                  Flight Longitude: ${longitude}<br>
                  Flight Altitude: ${altitude}
                `;

                point.billboard = undefined;
              }
            });
          });
        }
      });
    }
  }
}
