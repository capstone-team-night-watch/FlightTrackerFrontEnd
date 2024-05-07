import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import {
  Math,
  Cartesian3,
  Color,
  Plane,
  Viewer,
  HeightReference,
  Ion,
  IonResource,
  Entity,
  Cartographic,
  CatmullRomSpline,
  HeadingPitchRoll,
  Transforms,
  HeadingPitchRange,
  BillboardGraphics,
  Property,
  ConstantProperty,
  LabelGraphics,
  VerticalOrigin,
  HorizontalOrigin,
  Cartesian2,
  UrlTemplateImageryProvider,
  ImageryLayer,
  Ray,
  BoundingSphere,
  IntersectionTests,
  Intersections2D,
} from 'cesium';
import { NoFlyZoneEntity } from 'src/lib/simulation-entities/no-fly-zone';
import { CircularNoFlyZone, NoFlyZoneInfo, PolygonNoFlyZone } from 'src/lib/socket-events/no-fly-zone-tracking';
import { ThemeService } from '../shared/theme.service';
import { Airport, FlightInformation } from 'src/lib/socket-events/flight-tracking';
import { DeepReadonly } from 'src/lib/utils/types';
import { GeographicCoordinates2D } from 'src/lib/simulation-entities/coordinattes';
import { parseLatLong } from 'src/lib/utils/Coordinates';
import { RenderedFlight } from 'src/lib/simulation-entities/plane';
import { DynamicPlanePosition } from 'src/lib/simulation-entities/PlanePosition';
import { AirportNode } from 'src/lib/simulation-entities/airport-node';

@Component({
  selector: 'app-cesium-component',
  templateUrl: './cesium-component.component.html',
  styleUrls: ['./cesium-component.component.css'],
})
export class CesiumComponentComponent implements OnInit, AfterViewInit {
  private viewer: Viewer;
  @ViewChild('cesiumContainer') cesiumContainer: ElementRef;

  airports: AirportNode;
  circleTFRs: CircularNoFlyZone[] = [];
  polygonTFRs: PolygonNoFlyZone[] = [];

  constructor(private theme: ThemeService) {}

  async updateFlightLocation(flightObject: RenderedFlight, flight: FlightInformation): Promise<void> {
    // TODO: Update this so that it updates the flight location instead of deleting and recreating it
    const entity = flightObject.plane;

    const position = entity.position as DynamicPlanePosition;

    position.setCoordinates(flight.location);
  }

  async updateFlightPath(flightObject: RenderedFlight, flight: FlightInformation): Promise<void> {
    // TODO: Update this so that it updates the flight location instead of deleting and recreating it
    this.viewer.entities.remove(flightObject.planePath);

    const newPath = this.drawPath(parseLatLong(flight.checkPoints), flight.flightId);

    newPath.parent = flightObject.plane;

    flightObject.planePath = newPath;
  }

  async updateAlternateFlightPath(flightObject: RenderedFlight, flight: FlightInformation): Promise<void> {
    if (flightObject.alternatePath != undefined) {
      this.viewer.entities.remove(flightObject.alternatePath);
    }

    const airportCandidates = this.getClosestAirport(flight);
    const bestAirport = this.getClosestValidAirport(flight, airportCandidates)
    if (bestAirport != undefined) {
      const newPath = this.drawAlternatePath(flight, bestAirport);
      newPath.parent = flightObject.plane;
      flightObject.alternatePath = newPath;
    }
  }

  focus(redonlyEntity: DeepReadonly<Entity>): void {
    const entity = redonlyEntity as Entity;

    const offset = new HeadingPitchRange(Math.toRadians(0), Math.toRadians(-90), 1_000_000);

    this.viewer.flyTo(entity, { offset });
  }

  RemoveNoFlyZone(zone: NoFlyZoneEntity): void {
    throw new Error('Method not implemented.');
  }

  async ngAfterViewInit(): Promise<void> {
    Ion.defaultAccessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiMmE5MDI5OS03NDMxLTQxZGQtODhiNi0xODEwZTNkMmNjZjciLCJpZCI6MjA5MjA4LCJpYXQiOjE3MTMzMTIwOTV9.GJMyvAoAoFB3bzZpqQqGFVlhqI5BV1JqoJcJM_0R3h8';

    const imageryLayer = new ImageryLayer(
      new UrlTemplateImageryProvider({
        url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}@2x.png',
      })
    );
    
    // Put initialization code for the Cesium viewer here
    this.viewer = new Viewer(this.cesiumContainer.nativeElement, {
      animation: false,
      timeline: false,
      homeButton: false,
      vrButton: false,
      geocoder: false,
      sceneModePicker: false,
      fullscreenButton: false,
      baseLayerPicker: false,
      baseLayer: imageryLayer,
      navigationHelpButton: false,
    });

    // this.viewer.scene.a
    this.viewer.resolutionScale = 1.6;
    this.viewer.scene.backgroundColor = new Color(0, 0, 0, 0);

    this.viewer.scene.skyBox.destroy();
    // @ts-ignore
    this.viewer.scene.skyBox = undefined;

    this.viewer.scene.backgroundColor = Color.BLACK.clone();

    this.viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(-99.9018, 41.4925, 5_000_000.0),
    });
  }

  ngOnInit(): void {}

  RemovePlane(plane: Plane): void {
    throw new Error('Method not implemented.');
  }

  public async createFlight(flight: FlightInformation): Promise<RenderedFlight> {
    let newFlight = await this.drawPlane(flight);

    if (!flight.checkPoints.length) {
      flight.checkPoints = [
        flight.source.coordinates.latitude,
        flight.source.coordinates.longitude,
        flight.destination.coordinates.latitude,
        flight.destination.coordinates.longitude,
      ];
    }

    let path = this.drawPath(parseLatLong(flight.checkPoints), flight.flightId);

    path.parent = newFlight;

    return { plane: newFlight, planePath: path };
  }

  public async drawPlane(flight: FlightInformation, tfrName?: string): Promise<Entity> {
    let newPosition = new DynamicPlanePosition(flight.location);

    const pUri = await IonResource.fromAssetId(2541282);

    const pitch = 0;
    const roll = 0;

    const heading = Math.toRadians(flight.heading);
    const hpr = new HeadingPitchRoll(heading, pitch, roll);
    const orientation = Transforms.headingPitchRollQuaternion(newPosition.getCoordinates(), hpr);

    let airplane = {
      id: flight.flightId,
      name: flight.flightId,
      position: newPosition,
      orientation: orientation,
      model: {
        uri: pUri,
        minimumPixelSize: 128,
        maximumScale: 15_000,
      },
    } satisfies Entity.ConstructorOptions;

    const planeEntity = this.viewer.entities.add(airplane);

    planeEntity.label = new LabelGraphics({
      text: flight.flightId,
      scale: 0.4,
      verticalOrigin: VerticalOrigin.TOP,
      horizontalOrigin: HorizontalOrigin.RIGHT,
      pixelOffset: Cartesian2.fromElements(20, -57),
    });

    let tfrDescriptor = "This flight is not currently in collision with any no-fly-zone";
	
    if (tfrName != undefined) {
      tfrDescriptor = "This flight is currently in collision with " + tfrName;
    }

    let descriptionProperty = new ConstantProperty();
    descriptionProperty.setValue(`
    <b>This is flight ${flight.flightId}</b><br>
    Heading from ${flight.source?.name} to ${flight.destination?.name}<br>
    ${tfrDescriptor}<br>
    latitude: ${flight.location.latitude}<br>
    longitude: ${flight.location.longitude}<br>
    altitude: ${flight.location.altitude * 100}<br>
    heading: ${flight.heading}<br>
    ground speed: ${flight.groundSpeed} kn
    `);
    planeEntity.description = descriptionProperty;

    this.eraseWarnings(planeEntity);

    return planeEntity;
  }

  public attachEarlyWarning(entity: Entity) {
    entity.billboard = new BillboardGraphics({
      image: 'assets/images/EarlyWarningLabel.png',
      verticalOrigin: VerticalOrigin.BOTTOM,
      pixelOffset: Cartesian2.fromElements(0, 35),
      width: 57,
      height: 15,
    });
  }

  public attachWarning(entity: Entity) {
    entity.billboard = new BillboardGraphics({
      image: 'assets/images/WarningLabel.png',
      verticalOrigin: VerticalOrigin.BOTTOM,
      pixelOffset: Cartesian2.fromElements(0, 35),
      width: 57,
      height: 15,
    });
  }

  public eraseWarnings(entity: Entity) {
    entity.billboard = undefined;
  }

  public CreateNoFlyZone(noFlyZone: NoFlyZoneInfo): Entity {
    if (noFlyZone.type === 'POLYGON') {
      return this.CreatePolygonNoFlyZone(noFlyZone);
    } else {
      return this.CreateCircularNoFlyZone(noFlyZone);
    }
  }

  public CreateCircularNoFlyZone(noFlyZone: CircularNoFlyZone): Entity {
    let newZone = this.viewer.entities.add({
      parent: undefined,
      name: noFlyZone.id,
      position: Cartesian3.fromDegrees(noFlyZone.center.longitude, noFlyZone.center.latitude, noFlyZone.altitude),

      ellipse: {
        semiMinorAxis: noFlyZone.radius,
        semiMajorAxis: noFlyZone.radius,
        material: Color.fromCssColorString(this.theme.noFlyZoneColor),

        extrudedHeight: 0.0,
        height: noFlyZone.altitude,
        heightReference: HeightReference.RELATIVE_TO_GROUND,
        extrudedHeightReference: HeightReference.CLAMP_TO_GROUND,
      },
    });

    let descriptionProperty = new ConstantProperty();
    descriptionProperty.setValue(`
    <b>This is the ${noFlyZone.type}-type no-fly-zone ${noFlyZone.id}</b><br>
    NOTAM #: ${noFlyZone.notamNumber}<br>
    altitude: ${noFlyZone.altitude}<br>
    time created: ${noFlyZone.createdAt}
    `);
    newZone.description = descriptionProperty;

    this.circleTFRs.unshift(noFlyZone);
    return newZone;
  }

  public CreatePolygonNoFlyZone(noFlyZone: PolygonNoFlyZone): Entity {
    const coordinates = noFlyZone.vertices.map((vertice) => {
      return Cartesian3.fromDegrees(vertice.longitude, vertice.latitude, 0);
    });

    let newZone = this.viewer.entities.add({
      parent: undefined,
      name: noFlyZone.id, // String name
      polygon: {
        hierarchy: coordinates,
        outlineColor: Color.BLACK,
        material: Color.fromCssColorString(this.theme.noFlyZoneColor),

        extrudedHeight: 0.0,
        height: noFlyZone.altitude,
        heightReference: HeightReference.RELATIVE_TO_GROUND,
        extrudedHeightReference: HeightReference.CLAMP_TO_GROUND,
      },
    });

    let descriptionProperty = new ConstantProperty();
    descriptionProperty.setValue(`
    <b>This is the ${noFlyZone.type}-type no-fly-zone ${noFlyZone.id}</b><br>
    NOTAM #: ${noFlyZone.notamNumber}<br>
    altitude: ${noFlyZone.altitude}<br>
    time created: ${noFlyZone.createdAt}
    `);
    newZone.description = descriptionProperty;

    this.polygonTFRs.unshift(noFlyZone);
    return newZone;
  }

  public createAirport(airportIn: Airport): AirportNode {
    let newAirport = this.viewer.entities.add({
      parent: undefined,
      name: airportIn.name,
      position: Cartesian3.fromDegrees(airportIn.coordinates.longitude, airportIn.coordinates.latitude, 0),

      ellipse: {
        semiMinorAxis: 5000.0,
        semiMajorAxis: 5000.0,
        material: Color.fromCssColorString(this.theme.airportColor).withAlpha(0.8),
      },
    });

    newAirport.label = new LabelGraphics({
      text: airportIn.icaoCode,
      scale: 0.4,
    });

    let descriptionProperty = new ConstantProperty();
    descriptionProperty.setValue(`
    <b>This is ${airportIn.name}, ICAO: ${airportIn.icaoCode}</b><br>
    latitude: ${airportIn.coordinates.latitude}<br>
    longitude: ${airportIn.coordinates.longitude}
    `);
    newAirport.description = descriptionProperty;

    let newAirportNode: AirportNode = {
      airportObject: airportIn,
      coords: Cartesian3.packArray([
        Cartesian3.fromDegrees(airportIn.coordinates.longitude, airportIn.coordinates.latitude, 0),
      ]),
      depth: 0,
      leftNode: undefined,
      rightNode: undefined,
    };

    if (this.airports != undefined) {
      let depth = 0;
      let currentNode = this.airports;
      while (true) {
        if (newAirportNode.coords[depth % 3] < currentNode.coords[depth % 3]) {
          if (currentNode.leftNode == undefined) {
            currentNode.leftNode = newAirportNode;
            newAirportNode.depth = depth + 1;
            break;
          } else {
            currentNode = currentNode.leftNode;
            depth++;
          }
        } else {
          if (currentNode.rightNode == undefined) {
            currentNode.rightNode = newAirportNode;
            newAirportNode.depth = depth + 1;
            break;
          } else {
            currentNode = currentNode.rightNode;
            depth++;
          }
        }
      }
    } else {
      this.airports = newAirportNode;
    }

    return newAirportNode;
  }

  public getClosestAirport(flightInformation: FlightInformation, nodeIn?: AirportNode): AirportNode[] {
    const amountOfAirports = 4;

    if (nodeIn == undefined) {
      nodeIn = this.airports;
    }

    if (nodeIn == undefined) {
      return [{
        airportObject: {
          name: 'NULL',
          icaoCode: 'NULL',
          coordinates: {
            latitude: flightInformation.location.latitude,
            longitude: flightInformation.location.longitude,
          },
        },
        coords: Cartesian3.packArray([
          Cartesian3.fromDegrees(flightInformation.location.longitude, flightInformation.location.latitude, 0),
        ]),
        depth: 0,
        leftNode: undefined,
        rightNode: undefined,
      }];
    }

    let returnNodes: AirportNode[] = [nodeIn];
    let returnDistances: number[] = [Cartesian3.distanceSquared(
      Cartesian3.fromDegrees(flightInformation.location.longitude, flightInformation.location.latitude),
      Cartesian3.unpack(nodeIn.coords))];
    let flightCoords: number[] = Cartesian3.packArray([
      Cartesian3.fromDegrees(flightInformation.location.longitude, flightInformation.location.latitude),
    ]);
    let candidate: AirportNode | undefined;
    let alternate: AirportNode | undefined;

    if (flightCoords[nodeIn.depth % 3] < nodeIn.coords[nodeIn.depth % 3]) {
      if (nodeIn.leftNode != undefined) {
        candidate = nodeIn.leftNode;
      }
      if (nodeIn.rightNode != undefined) {
        alternate = nodeIn.rightNode;
      }
    } else {
      if (nodeIn.rightNode != undefined) {
        candidate = nodeIn.rightNode;
      }
      if (nodeIn.leftNode != undefined) {
        alternate = nodeIn.leftNode;
      }
    }

    if (candidate != undefined) {
      let candidateNodes: AirportNode[] = this.getClosestAirport(flightInformation, candidate);
      let candidateDistances: number[] = [];
      for (let i = 0; i < candidateNodes.length; i++) {
        candidateDistances[i] = Cartesian3.distanceSquared(
          Cartesian3.fromDegrees(flightInformation.location.longitude, flightInformation.location.latitude),
          Cartesian3.unpack(candidateNodes[i].coords));
      }

      for (let i = 0; i < candidateNodes.length; i++) {
        for (let j = 0; j <= returnNodes.length; j++) {
          if (candidateDistances[i] < returnDistances[Math.clamp(j,0,amountOfAirports-1)] || j == returnNodes.length) {
            returnNodes.splice(j,0,candidateNodes[i]);
            returnDistances.splice(j,0,candidateDistances[i]);
            if (returnNodes.length > amountOfAirports) {
              returnNodes.pop();
              returnDistances.pop();
            }
            break;
          }
        }
      }
    }

    let flightCoordsArray: number[] = [];
    Cartesian3.pack(
      Cartesian3.fromDegrees(flightInformation.location.longitude, flightInformation.location.latitude),
      flightCoordsArray
    );

    let nodeCoordsArray: number[] = [];
    Cartesian3.pack(
      Cartesian3.fromDegrees(
        nodeIn.airportObject.coordinates.longitude,
        nodeIn.airportObject.coordinates.latitude
      ),
      nodeCoordsArray
    );

    let flightCoordsDimension: number[] = flightCoordsArray.slice();
    let nodeCoordsDimension: number[] = nodeCoordsArray.slice();
    let alternateNodes: AirportNode[] = [];
    let alternateDistances: number[] = [];

    for (let i = 0; i < 3; i++) {
      if (i != nodeIn.depth % 3) {
        flightCoordsDimension[i] = 0;
        nodeCoordsDimension[i] = 0;
      }
    }

    let radiusCheck = Cartesian3.distanceSquared(
      Cartesian3.unpack(flightCoordsDimension),
      Cartesian3.unpack(nodeCoordsDimension)
    );

    if (radiusCheck <= returnDistances[returnDistances.length - 1] && alternate != undefined) {
      alternateNodes = this.getClosestAirport(flightInformation, alternate);
    }

    for (let i = 0; i < alternateNodes.length; i++) {
      alternateDistances[i] = Cartesian3.distanceSquared(
        Cartesian3.fromDegrees(flightInformation.location.longitude, flightInformation.location.latitude),
        Cartesian3.unpack(alternateNodes[i].coords));
    }

    for (let i = 0; i < alternateNodes.length; i++) {
      for (let j = 0; j <= returnNodes.length; j++) {
        if (alternateDistances[i] < returnDistances[Math.clamp(j,0,amountOfAirports-1)] || j == returnNodes.length) {
          returnNodes.splice(j,0,alternateNodes[i]);
          returnDistances.splice(j,0,alternateDistances[i]);
          if (returnNodes.length > amountOfAirports) {
            returnNodes.pop();
            returnDistances.pop();
          }
          break;
        }
      }
    }

    return returnNodes;
  }

  public checkCircularCollision(lineStart: Cartesian2, lineEnd: Cartesian2, circleIn: CircularNoFlyZone): boolean{
    let circleCenter = new Cartesian2(circleIn.center.latitude, circleIn.center.longitude);
    let lineDirection = new Cartesian2;
    let pointDirection = new Cartesian2;
    let clampDot: number;
    let adjustedLength = new Cartesian2;
    let finalPosition = new Cartesian2;

    Cartesian2.subtract(lineEnd, lineStart, lineDirection);
    Cartesian2.subtract(circleCenter, lineStart, pointDirection);
    clampDot = Math.clamp(Cartesian2.dot(pointDirection, lineDirection) / Cartesian2.dot(lineDirection, lineDirection),0,1);
    Cartesian2.multiplyByScalar(lineDirection, clampDot, adjustedLength);
    Cartesian2.add(lineStart, adjustedLength, finalPosition);

    if (Cartesian3.distance(Cartesian3.fromDegrees(circleIn.center.longitude,
      circleIn.center.latitude), Cartesian3.fromDegrees(finalPosition.y, finalPosition.x))
      <= circleIn.radius) {
      console.log(Cartesian3.distance(Cartesian3.fromDegrees(circleIn.center.longitude,
        circleIn.center.latitude), Cartesian3.fromDegrees(finalPosition.y, finalPosition.x)) + " shorter than " + circleIn.radius);

      return true;
    }
    return false;
  }

  public checkPolygonCollision(lineStart: Cartesian2, lineEnd: Cartesian2, polygonIn: PolygonNoFlyZone): boolean {
    let collisionResult: Cartesian2 | undefined;
    for (let i = 1; i <= polygonIn.vertices.length; i++) {
      collisionResult = Intersections2D.computeLineSegmentLineSegmentIntersection(lineStart.x, lineStart.y, lineEnd.x, lineEnd.y,
        polygonIn.vertices[i - 1].latitude, polygonIn.vertices[i - 1].longitude,
        polygonIn.vertices[i % polygonIn.vertices.length].latitude, polygonIn.vertices[i % polygonIn.vertices.length].longitude
      );

      if (collisionResult != undefined) {
        return true;
      }
    }
    
    return false;
  }

  public getClosestValidAirport(flightInformation: FlightInformation, candidateNodes: AirportNode[]): Airport | undefined {
    let startPoint: Cartesian2 = { x: flightInformation.location.latitude, y: flightInformation.location.longitude } as Cartesian2;
    let endPoint: Cartesian2;
    let successFlag: boolean = true;

    for (let i = 0; i < candidateNodes.length; i++) {
      endPoint = { x: candidateNodes[i].airportObject.coordinates.latitude, y: candidateNodes[i].airportObject.coordinates.longitude } as Cartesian2;
      successFlag = true;
      for (let j = 0; j < this.circleTFRs.length; j++) {
        if (this.checkCircularCollision(startPoint, endPoint, this.circleTFRs[j])) {
          successFlag = false;
          for (let k = 0; k < flightInformation.flightCollisions.length; k++) {
            if (flightInformation.flightCollisions[k].noFlyZone == this.circleTFRs[j].id) {
              successFlag = true;
              break;
            }
          }
        }
      }
      for (let j = 0; j < this.polygonTFRs.length; j++) {
        if (this.checkPolygonCollision(startPoint, endPoint, this.polygonTFRs[j])) {
          successFlag = false;
          for (let k = 0; k < flightInformation.flightCollisions.length; k++) {
            if (flightInformation.flightCollisions[k].noFlyZone == this.polygonTFRs[j].id) {
              successFlag = true;
              break;
            }
          }
        }
      }
      if (successFlag) {
        return candidateNodes[i].airportObject;
      }
    }

    return undefined;
  }

  public drawPath(checkpoints: GeographicCoordinates2D[], name: string): Entity {
    const times = checkpoints.map((_, index) => index / (checkpoints.length - 1));

    const spline = new CatmullRomSpline({
      times: times,
      points: checkpoints.map((checkpoint) => Cartesian3.fromDegrees(checkpoint.longitude, checkpoint.latitude, 0)),
    });

    const points = [];

    for (let i = 0.0; i < 1.0; i += 0.01) {
      points.push(spline.evaluate(i));
    }

    let newLine = this.viewer.entities.add({
      name: name + ' predicted flight path',
      parent: this.viewer.entities.getById(name),
      polyline: {
        width: 1,
        positions: points,
        clampToGround: true,
        material: Color.fromCssColorString(this.theme.pathColor),
      },
    });

    let descriptionProperty = new ConstantProperty();
    descriptionProperty.setValue(`
    <b>This is the predicted flight path of ${name}</b><br>
    origin latitude: ${checkpoints[0].latitude}<br>
    origin longitude: ${checkpoints[0].longitude}<br>
    destination latitude: ${checkpoints[checkpoints.length - 1].latitude}<br>
    destination longitude: ${checkpoints[checkpoints.length - 1].longitude}
    `);
    newLine.description = descriptionProperty;

    return newLine;
  }

  public removePath(entity: Entity) {
    this.viewer.entities.remove(entity);
  }

  public drawAlternatePath(flight: FlightInformation, targetAirport: Airport): Entity {
    let planeCoords = Cartesian3.fromDegrees(flight.location.longitude, flight.location.latitude, 0);
    let airportCoords = Cartesian3.fromDegrees(
      targetAirport.coordinates.longitude,
      targetAirport.coordinates.latitude,
      0
    );

    let newAlt = this.viewer.entities.add({
      name: flight.flightId + ' alternate flight path',
      parent: this.viewer.entities.getById(flight.flightId),
      polyline: {
        width: 1,
        positions: [planeCoords, airportCoords],
        clampToGround: true,
        material: Color.fromCssColorString(this.theme.alternatePathColor),
      },
    });

    let descriptionProperty = new ConstantProperty();
    descriptionProperty.setValue(`
    <b>This is the alternate flight path of ${flight.flightId}</b><br>
    origin latitude: ${flight.location.latitude}<br>
    origin longitude: ${flight.location.longitude}<br>
    destination airport: ${targetAirport.name}<br>
    destination latitude: ${targetAirport.coordinates.latitude}<br>
    destination longitude: ${targetAirport.coordinates.longitude}
    `);
    newAlt.description = descriptionProperty;

    return newAlt;
  }

  //For some reason known only to God, and maybe Komlan,
  //my Math object does not have an abs or sqrt method, among others.
  //
  //This is me giving up.
  public mathAbs(numIn: number): number {
    if (numIn < 0) {
      return -numIn;
    }
    return numIn;
  }

  public drawTrackedPath(flight: FlightInformation, trackedCoords: GeographicCoordinates2D[]) {
    let startCutIndex;
    let startCutManhattanDistance;
    let endCutIndex;
    let endCutManhattanDistance;

    let checkPoints = parseLatLong(flight.checkPoints);

    for (let i = 0; i < checkPoints.length; i++) {
      let newStartManhattan =
        this.mathAbs(trackedCoords[0].latitude - checkPoints[i].latitude) +
        this.mathAbs(trackedCoords[0].longitude - checkPoints[i].longitude);

      let newEndManhattan =
        this.mathAbs(trackedCoords[trackedCoords.length - 1].latitude - checkPoints[i].latitude) +
        this.mathAbs(trackedCoords[trackedCoords.length - 1].longitude - checkPoints[i].longitude);

      console.log('Start Manhattan: ' + newStartManhattan + ' | End Manhattan: ' + newEndManhattan);

      if (startCutManhattanDistance == undefined || newStartManhattan < startCutManhattanDistance) {
        startCutManhattanDistance = newStartManhattan;
        startCutIndex = i;
      }

      if (endCutManhattanDistance == undefined || newEndManhattan < endCutManhattanDistance) {
        endCutManhattanDistance = newEndManhattan;
        endCutIndex = Math.clamp(i + 1, 0, flight.checkPoints.length - 1);
      }
    }

    let startSlice = checkPoints.slice(0, startCutIndex);
    let endSlice = checkPoints.slice(endCutIndex);
    let concatArray = startSlice.concat(trackedCoords, endSlice);
    let finalArray = concatArray.map((coordinate) =>
      Cartesian3.fromDegrees(coordinate.longitude, coordinate.latitude, 0)
    );

    const times = finalArray.map((_, index) => index / (finalArray.length - 1));

    const spline = new CatmullRomSpline({
      times: times,
      points: finalArray,
    });

    const points = [];

    for (let i = 0.0; i < 1.0; i += 0.01) {
      points.push(spline.evaluate(i));
    }

    let newTrackedLine = this.viewer.entities.add({
      name: flight.flightId + ' partially tracked flight path',
      parent: this.viewer.entities.getById(flight.flightId),
      polyline: {
        width: 1,
        positions: points,
        clampToGround: true,
        material: Color.fromCssColorString(this.theme.pathColor),
      },
    });

    let descriptionProperty = new ConstantProperty();
    descriptionProperty.setValue(`
    <b>This is the partially-tracked flight path of ${flight.flightId}</b><br>
    first tracked coordinates: ${trackedCoords[0].latitude}, ${trackedCoords[0].longitude}<br>
    latest tracked coordinates: ${trackedCoords[trackedCoords.length - 1].latitude}, ${
      trackedCoords[trackedCoords.length - 1].longitude
    }
    `);
    newTrackedLine.description = descriptionProperty;

    for (let i = 0; i < finalArray.length; i++) {
      console.log('Coordinate Set ' + i + ': ' + finalArray[i].x + ', ' + finalArray[i].y);
    }

    return newTrackedLine;
  }

  public getViewer() {
    return this.viewer;
  }
}
