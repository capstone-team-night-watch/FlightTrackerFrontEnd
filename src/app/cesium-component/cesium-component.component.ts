import { AfterViewInit, Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { SimulationRenderer } from 'src/lib/SimulationRenderer';
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
  Cartesian2
} from 'cesium';
import { NoFlyZone } from 'src/lib/simulation-entities/no-fly-zone';
import { CircularNoFlyZone, NoFlyZoneInfo, PolygonNoFlyZone } from 'src/lib/socket-events/no-fly-zone-tracking';
import { ThemeService } from '../shared/theme.service';
import { Airport, FlightInformation } from 'src/lib/socket-events/flight-tracking';
import { DeepReadonly } from 'src/lib/utils/types';
import { GeographicCoordinates2D } from 'src/lib/simulation-entities/coordinattes';

@Component({
  selector: 'app-cesium-component',
  templateUrl: './cesium-component.component.html',
  styleUrls: ['./cesium-component.component.css'],
})

export class CesiumComponentComponent implements OnInit, AfterViewInit, SimulationRenderer {
  private viewer: Viewer;
  @ViewChild('cesiumContainer') cesiumContainer: ElementRef;

  constructor(private theme: ThemeService) {}

  updateFlightLocation(entity: Entity, flight: FlightInformation): void {
    // TODO: Update this so that it updates the flight location instead of deleting and recreating it
    this.viewer.entities.remove(entity);

    const newFlight = this.createFlight(flight);

    Object.assign(entity, newFlight);
  }

  focus(redonlyEntity: DeepReadonly<Entity>): void {
    const entity = redonlyEntity as Entity;

    const offset = new HeadingPitchRange(Math.toRadians(90), Math.toRadians(-90), 1_000_000);

    this.viewer.flyTo(entity, { offset });
  }

  RemoveNoFlyZone(zone: NoFlyZone): void {
    throw new Error('Method not implemented.');
  }

  ngAfterViewInit(): void {
    Ion.defaultAccessToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJjNzIyMjA2MC02ZDY2LTQ1YmUtYjc0Yi05MzFhY2ViZWNkMWUiLCJpZCI6MTIzOTU4LCJpYXQiOjE2NzU4OTY5MzV9.iWKvQ4p-2joQPJ4o3vMeT3HDeBkyKb5ijeA87NEppa4';

    // Put initialization code for the Cesium viewer here
    this.viewer = new Viewer(this.cesiumContainer.nativeElement, {
      animation: false,
      timeline: false,
    });

    this.viewer.resolutionScale = 1.3;
  }

  ngOnInit(): void {}

  initialize() {}

  RemovePlane(plane: Plane): void {
    throw new Error('Method not implemented.');
  }

  public async createFlight(flight: FlightInformation): Promise<Entity> {
    let newPosition = Cartesian3.fromDegrees(
      flight.location.longitude,
      flight.location.latitude,
      flight.location.altitude
    );

    console.log(JSON.stringify(flight.location));

    const pUri = await IonResource.fromAssetId(1662340);

    const pitch = 0;
    const roll = 0;

    const heading = Math.toRadians(flight.heading);
    const hpr = new HeadingPitchRoll(heading, pitch, roll);
    const orientation = Transforms.headingPitchRollQuaternion(newPosition, hpr);

    let airplane = {
      id: flight.flightId,
      name: flight.flightId,
      position: newPosition,
      orientation: orientation,
      model: {
        uri: pUri,
        minimumPixelSize: 128,
        maximumScale: 20_000,
      },
    } satisfies Entity.ConstructorOptions;

    const planeEntity = this.viewer.entities.add(airplane);

    if (flight.checkPoints !== undefined) {
      const path = this.drawPath(flight.checkPoints, flight.flightId);
      path.parent = planeEntity;
    }

    this.viewer.camera.flyTo({
      destination: Cartesian3.fromDegrees(
        flight.location.longitude,
        flight.location.latitude,
        flight.location.altitude + 1_000_000
      ),
    });

    planeEntity.label = new LabelGraphics({
      text: flight.flightId,
      scale: 0.4,
      verticalOrigin: VerticalOrigin.TOP,
      horizontalOrigin: HorizontalOrigin.RIGHT,
      pixelOffset: Cartesian2.fromElements(-15,-10),
    });

    let descriptionProperty = new ConstantProperty();
    descriptionProperty.setValue(`
    <b>This is flight ${flight.flightId}</b><br>
    Heading from ${flight.source.name} to ${flight.destination.name}<br>
    latitude: ${flight.location.latitude}<br>
    longitude: ${flight.location.longitude}<br>
    altitude: ${flight.location.altitude * 100}<br>
    heading: ${flight.heading}<br>
    ground speed: ${flight.groundSpeed} kn
    `);
    planeEntity.description = descriptionProperty;

    return planeEntity;
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
        semiMinorAxis: 300000.0,
        semiMajorAxis: 300000.0,
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

    return newZone;
  }

  public CreatePolygonNoFlyZone(noFlyZone: PolygonNoFlyZone): Entity {
    const coordinates = noFlyZone.vertices.map((vertice) => {
      return Cartesian3.fromDegrees(vertice.longitude, vertice.latitude, 0);
    });

    console.log(coordinates);

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

    return newZone;
  }

  public createAirport(airportIn : Airport): Entity {
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

    return newAirport;
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
    destination latitude: ${checkpoints[checkpoints.length-1].latitude}<br>
    destination longitude: ${checkpoints[checkpoints.length-1].longitude}
    `);
    newLine.description = descriptionProperty;

    return newLine;
  }

  public removePath(entity: Entity) {
    this.viewer.entities.remove(entity);
  }

  public drawAlternatePath(flight: FlightInformation, targetAirport: Airport): Entity {
    let planeCoords = Cartesian3.fromDegrees(flight.location.longitude, flight.location.latitude, 0);
    let airportCoords = Cartesian3.fromDegrees(targetAirport.coordinates.longitude, targetAirport.coordinates.latitude, 0);

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

  public drawTrackedPath(flight: FlightInformation, trackedCoords: GeographicCoordinates2D[]){
    let startCutIndex;
    let startCutManhattanDistance;
    let endCutIndex;
    let endCutManhattanDistance;

    for (let i = 0; i < flight.checkPoints.length; i++) {
      let newStartManhattan = (this.mathAbs(trackedCoords[0].latitude - flight.checkPoints[i].latitude) +
        this.mathAbs(trackedCoords[0].longitude - flight.checkPoints[i].longitude));

      let newEndManhattan = (this.mathAbs(trackedCoords[trackedCoords.length-1].latitude - flight.checkPoints[i].latitude) +
        this.mathAbs(trackedCoords[trackedCoords.length-1].longitude - flight.checkPoints[i].longitude));

      console.log("Start Manhattan: " + newStartManhattan + " | End Manhattan: " + newEndManhattan);

      if (startCutManhattanDistance == undefined ||
        newStartManhattan < startCutManhattanDistance) {
        startCutManhattanDistance = newStartManhattan;
        startCutIndex = i;
      }

      if (endCutManhattanDistance == undefined ||
        newEndManhattan < endCutManhattanDistance) {
        endCutManhattanDistance = newEndManhattan;
        endCutIndex = Math.clamp(i + 1, 0, flight.checkPoints.length - 1);
      }
    }

    let startSlice = flight.checkPoints.slice(0,startCutIndex);
    let endSlice = flight.checkPoints.slice(endCutIndex);
    let concatArray = startSlice.concat(trackedCoords, endSlice);
    let finalArray = concatArray.map((coordinate) => Cartesian3.fromDegrees(coordinate.longitude, coordinate.latitude, 0));

    const times = finalArray.map((_, index) => index / (finalArray.length - 1));

    const spline = new CatmullRomSpline({
      times: times,
      points: finalArray
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
    latest tracked coordinates: ${trackedCoords[trackedCoords.length-1].latitude}, ${trackedCoords[trackedCoords.length-1].longitude}
    `);
    newTrackedLine.description = descriptionProperty;

    for (let i = 0; i < finalArray.length; i++) {
      console.log("Coordinate Set " + i + ": " + finalArray[i].x + ", " + finalArray[i].y);
    }

    return newTrackedLine;
  }

  public getViewer() {
    return this.viewer;
  }
}
