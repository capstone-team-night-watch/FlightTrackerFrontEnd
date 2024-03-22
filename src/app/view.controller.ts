import { Injectable } from '@angular/core';

declare const Cesium: any;

// TODO: Consider hiding this api token so it is not stored on the front-end
Cesium.Ion.defaultAccessToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNzIyMjA2MC02ZDY2LTQ1YmUtYjc0Yi05MzFhY2ViZWNkMWUiLCJpZCI6MTIzOTU4LCJpYXQiOjE2NzU4OTY5MzV9.iWKvQ4p-2joQPJ4o3vMeT3HDeBkyKb5ijeA87NEppa4';

@Injectable({
  providedIn: 'root',
})
export class CesiumViewController {
  // ellipsoidNoFly: EllipsoidNoFly = new EllipsoidNoFly();
  // rectangleNoFly: RectangleNoFly = new RectangleNoFly();
  // militaryBase: MilitaryBase = new MilitaryBase();
  // tfrNoFly: TfrNoFly = new TfrNoFly();
  // getNoFlyZoneConflictResponse: getNoFlyZonesConflictResponse;
  // global_viewer: any;
  // entities: any;
  // ellipsoids: any;
  // rectangles: any;
  // polygons: any;
  // militaryBases: any;
  // aeroFlightIdentResponse: FlightDataIdent;
  // aeroFlightFaIdResponse: FlightDataFa_Id;
  // aeroOperatorResponse: Operator;
  // /*
  //   Sets up a named viewer. Checks to make sure a viewer doesn't exist before creating a new viewer.
  //   */
  // public setUpViewer(div: string): void {
  //   Cesium.Math.setRandomNumberSeed(1234);
  //   if (this.global_viewer == null || this.global_viewer == undefined) {
  //     this.global_viewer = new Cesium.Viewer(div, {
  //       animation: false,
  //       timeline: false,
  //     });
  //     this.entities = this.global_viewer.entities;
  //     this.ellipsoids = this.entities.add(new Cesium.Entity());
  //     this.rectangles = this.entities.add(new Cesium.Entity());
  //     this.polygons = this.entities.add(new Cesium.Entity());
  //     this.militaryBases = this.entities.add(new Cesium.Entity());
  //   }
  // }

  // /*
  //   Both updates plane models already in the provided view
  //   and creates new plane models for those which are not.
  //   */
  // public async makePlane(view: any, name: string, long: number, lat: number, alt: number) {
  //   // If plane exists
  //   if (view.entities.getById(name)) {
  //     let oldAirplane = view.entities.getById(name);

  //     // Move plane and change scale
  //     if (!(long == 0 && lat == 0 && alt == 0)) {
  //       let newPosition = Cesium.Cartesian3.fromDegrees(long, lat, alt);

  //       let direction = Cesium.Cartesian3.subtract(newPosition, oldAirplane._position._value, new Cesium.Cartesian3());
  //       Cesium.Cartesian3.normalize(direction, direction);

  //       let rotationMatrix = Cesium.Transforms.rotationMatrixFromPositionVelocity(
  //         oldAirplane._position._value,
  //         direction
  //       );

  //       oldAirplane._position._value = newPosition;

  //       let newOrientation = new Cesium.Quaternion();
  //       Cesium.Quaternion.fromRotationMatrix(rotationMatrix, newOrientation);
  //       oldAirplane.orientation = newOrientation;
  //     }
  //     let distance = Cesium.Cartesian3.distance(oldAirplane._position._value, view.camera.position);
  //     oldAirplane._model._scale._value = distance / (100 + distance / 10000);
  //   } else {
  //     // If this is a new plane, make it
  //     view.entities.remove(view.entities.getById(name));
  //     let newPosition = Cesium.Cartesian3.fromDegrees(long, lat, alt);
  //     let distance = Cesium.Cartesian3.distance(newPosition, view.camera.position);

  //     const pUri = await Cesium.IonResource.fromAssetId(1662340);
  //     let airplane = {
  //       id: name,
  //       name: name,
  //       position: newPosition,
  //       model: {
  //         uri: pUri,

  //         scale: distance / (100 + distance / 10000),
  //       },
  //     };
  //     view.entities.add(airplane);
  //   }
  // }

  // public addEllipsoidNoFlyZone(noFlyIn: EllipsoidNoFly) {
  //   this.global_viewer.entities.add({
  //     parent: this.ellipsoids,
  //     name: noFlyIn.name,
  //     position: Cesium.Cartesian3.fromDegrees(
  //       Number(noFlyIn.longitude),
  //       Number(noFlyIn.latitude),
  //       Number(noFlyIn.altitude)
  //     ),
  //     ellipsoid: {
  //       radii: new Cesium.Cartesian3(noFlyIn.longRadius, noFlyIn.latRadius, noFlyIn.altRadius),
  //       material: Cesium.Color.RED.withAlpha(0.5),
  //     },
  //   });
  // }

  // public makeTrailLine(ICAOIn: string, coordsIn: number[] | undefined) {
  //   if (coordsIn != undefined) {
  //     let formattedCoords = this.formatCoords(coordsIn); //Because the coords in Aero data come in the reverse order they need to be.
  //     this.global_viewer.entities.add({
  //       name: ICAOIn,
  //       parent: this.global_viewer.entities.getById('Flight ICAO: ' + ICAOIn),
  //       polyline: {
  //         positions: Cesium.Cartesian3.fromDegreesArray(formattedCoords),
  //         width: 10,
  //         material: Cesium.Color.PURPLE,
  //         clampToGround: false,
  //       },
  //     });
  //   }
  // }

  // public makePastLine(ICAOIn: string, latIn: number, longIn: number, flightObject: FlightDataFa_Id | undefined) {
  //   if (flightObject != undefined && flightObject.waypoints.length > 0) {
  //     this.global_viewer.entities.add({
  //       name: ICAOIn,
  //       parent: this.global_viewer.entities.getById('Flight ICAO: ' + ICAOIn),
  //       polyline: {
  //         positions: Cesium.Cartesian3.fromDegreesArray(
  //           longIn,
  //           latIn,
  //           flightObject.waypoints[1],
  //           flightObject.waypoints[0]
  //         ),
  //         width: 10,
  //         material: Cesium.Color.PURPLE,
  //         clampToGround: false,
  //       },
  //     });
  //   } else {
  //     this.global_viewer.entities.add({
  //       name: ICAOIn,
  //       parent: this.global_viewer.entities.getById('Flight ICAO: ' + ICAOIn),
  //       polyline: {
  //         positions: Cesium.Cartesian3.fromDegreesArray(
  //           longIn,
  //           latIn,
  //           flightObject?.last_position.longitude,
  //           flightObject?.last_position.longitude
  //         ),
  //         width: 10,
  //         material: Cesium.Color.PURPLE,
  //         clampToGround: false,
  //       },
  //     });
  //   }
  // }

  // public makeFutureLine(ICAOIn: string, latIn: number, longIn: number, flightObject: FlightDataFa_Id | undefined) {
  //   if (flightObject != undefined && flightObject.waypoints.length > 0) {
  //     this.global_viewer.entities.add({
  //       name: ICAOIn,
  //       parent: this.global_viewer.entities.getById('Flight ICAO: ' + ICAOIn),
  //       polyline: {
  //         positions: Cesium.Cartesian3.fromDegreesArray(
  //           longIn,
  //           latIn,
  //           flightObject.waypoints[flightObject.waypoints.length - 1],
  //           flightObject.waypoints.length - 2
  //         ),
  //         width: 10,
  //         material: Cesium.Color.PURPLE,
  //         clampToGround: false,
  //       },
  //     });
  //   } else {
  //     this.global_viewer.entities.add({
  //       name: ICAOIn,
  //       parent: this.global_viewer.entities.getById('Flight ICAO: ' + ICAOIn),
  //       polyline: {
  //         positions: Cesium.Cartesian3.fromDegreesArray(
  //           longIn,
  //           latIn,
  //           flightObject?.last_position.longitude,
  //           flightObject?.last_position.longitude
  //         ),
  //         width: 10,
  //         material: Cesium.Color.PURPLE,
  //         clampToGround: false,
  //       },
  //     });
  //   }
  // }

  // public formatCoords(coordsIn: number[]) {
  //   let newCoords = coordsIn;
  //   let transferNum = null;

  //   for (let i = 0; i < newCoords.length; i = i + 2) {
  //     transferNum = newCoords[i];
  //     newCoords[i] = newCoords[i + 1];
  //     newCoords[i + 1] = transferNum;
  //   }

  //   return newCoords;
  // }

  // public makeConflictBillboard(
  //   pointIn: any,
  //   intersectedNoFlyZone: string | undefined,
  //   flightInfo: FlightwiDataFa_Id,
  //   flightICAO: string,
  //   airlineName: string,
  //   aboveLocation: string,
  //   flightLatitude: number,
  //   flightLongitude: number,
  //   flightAltitude: number
  // ) {
  //   pointIn.description = pointIn.description = `
  //           <p>Flight ICAO: ${flightICAO} is in no fly zone: ${intersectedNoFlyZone}<br>
  //           For Airline: ${airlineName}</p><br>
  //           Flight location is over ${aboveLocation}<br>
  //           Origin Place: ${flightInfo?.origin.name}<br>
  //           Takeoff Time: ${flightInfo?.actual_off}<br>
  //           Destination: ${flightInfo?.destination?.name}<br>
  //           GroundSpeed: ${flightInfo?.last_position?.groundspeed}<br>
  //           Flight Latitude: ${flightLatitude}<br>
  //           Flight Longitude: ${flightLongitude}<br>
  //           Flight Altitude: ${flightAltitude}<br>
  //           Altitude Change: ${flightInfo?.last_position?.altitude_change}<br>
  //           Heading: ${flightInfo?.last_position?.heading}<br>
  //           Aircraft Type: ${flightInfo?.aircraft_type}<br>
  //           Time latest position received: ${flightInfo?.last_position?.timestamp}
  //       `;

  //   this.global_viewer.selectedEntity = pointIn;
  //   pointIn.billboard = {
  //     image: '/assets/images/WarningLabel.png',
  //     verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  //     pixelOffset: new Cesium.Cartesian2(0, 35),
  //     width: 57,
  //     height: 15,
  //   };
  // }

  // public makeFlightBillboard(
  //   pointIn: any,
  //   flightInfo: FlightDataFa_Id,
  //   flightICAO: string,
  //   aboveLocation: string,
  //   airlineName: string,
  //   flightLatitude: number,
  //   flightLongitude: number,
  //   flightAltitude: number
  // ) {
  //   pointIn.description = pointIn.description = `
  //           <p>Flight ICAO: ${flightICAO} is over ${aboveLocation}<br>
  //           Airline: ${airlineName}<br>
  //           Origin Place: ${flightInfo?.origin.name}<br>
  //           Takeoff Time: ${flightInfo?.actual_off}<br>
  //           Destination: ${flightInfo?.destination?.name}<br>
  //           GroundSpeed: ${flightInfo?.last_position?.groundspeed}<br>
  //           Flight Latitude: ${flightLatitude}<br>
  //           Flight Longitude: ${flightLongitude}<br>
  //           Flight Altitude: ${flightAltitude}<br>
  //           Altitude Change: ${flightInfo?.last_position?.altitude_change}<br>
  //           Heading: ${flightInfo?.last_position?.heading}<br>
  //           Aircraft Type: ${flightInfo?.aircraft_type}<br>
  //           Time latest position received: ${flightInfo?.last_position?.timestamp}
  //       </p>`;

  //   pointIn.billboard = undefined;
  // }

  // public makeMockConflictBillboard(
  //   pointIn: any,
  //   intersectedNoFlyZone: string | undefined,
  //   flightICAO: string,
  //   airlineName: string,
  //   aboveLocation: string,
  //   flightLatitude: number,
  //   flightLongitude: number,
  //   flightAltitude: number
  // ) {
  //   pointIn.description = `
  //           <b>This is a mock generated flight</b><br>
  //           <p>Flight ICAO: ${flightICAO} is in no fly zone: ${intersectedNoFlyZone}<br>
  //           For Airline: ${airlineName}</p><br>
  //           Flight location is over ${aboveLocation}<br>
  //           Flight Latitude: ${flightLatitude}<br>
  //           Flight Longitude: ${flightLongitude}<br>
  //           Flight Altitude: ${flightAltitude}
  //       `;

  //   this.global_viewer.selectedEntity = pointIn;
  //   pointIn.billboard = {
  //     image: '/assets/images/WarningLabel.png',
  //     verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
  //     pixelOffset: new Cesium.Cartesian2(0, 35),
  //     width: 57,
  //     height: 15,
  //   };
  // }

  // public makeMockFlightBillboard(
  //   pointIn: any,
  //   flightICAO: string,
  //   aboveLocation: string,
  //   airlineName: string,
  //   flightLatitude: number,
  //   flightLongitude: number,
  //   flightAltitude: number
  // ) {
  //   pointIn.description = `
  //           <b>This is a mock generated flight</b><br>
  //           <p>Flight ICAO: ${flightICAO} is over ${aboveLocation}<br>
  //           Airline: ${airlineName}<br>
  //           Flight Latitude: ${flightLatitude}<br>
  //           Flight Longitude: ${flightLongitude}<br>
  //           Flight Altitude: ${flightAltitude}
  //           `;

  //   pointIn.billboard = undefined;
  // }

  // public hidePolygonNoFlys() {
  //   this.polygons.show = !this.polygons.show;
  // }

  // public hideRectangleNoFlyz() {
  //   this.rectangles.show = !this.rectangles.show;
  // }

  // public hideEllipsoidNoFlyz() {
  //   this.ellipsoids.show = !this.ellipsoids.show;
  // }

  // public hideMilitaryBasesNoFlyz() {
  //   this.militaryBases.show = !this.militaryBases.show;
  // }

  // public hideSelected() {
  //   this.global_viewer.selectedEntity.show = !this.global_viewer.selectedEntity.show;

  //   let parentId = this.global_viewer.selectedEntity.id;

  //   this.global_viewer.entities.values.forEach((element: any) => {
  //     if (element.parent != undefined && element.parent.id == parentId) {
  //       element.show = !element.show;
  //     }
  //   });
  // }

  // public resetEntities() {
  //   const list: any[] = [];
  //   this.global_viewer.entities.values.forEach((element: any) => {
  //     if (element.show) {
  //       list.push(element);
  //       console.log('NOT SHOWING' + element.id);
  //     }
  //   });

  //   if (list.length > 0) {
  //     list.forEach((element) => {
  //       this.global_viewer.entities.getById(element.id).show = true;
  //     });
  //   }
  // }

  // public flyToNoFlyZone(zoneName: string) {
  //   this.global_viewer.entities.values.forEach((element: any) => {
  //     if (element.name == zoneName) {
  //       this.global_viewer.zoomTo(element);
  //     }
  //     if (element.name == zoneName) {
  //       this.global_viewer.zoomTo(element);
  //     }
  //   });
  // }
}
