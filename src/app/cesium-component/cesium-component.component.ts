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
} from 'cesium';
import { NoFlyZone } from 'src/lib/simulation-entities/no-fly-zone';
import { CircularNoFlyZone, NoFlyZoneInfo, PolygonNoFlyZone } from 'src/lib/socket-events/no-fly-zone-tracking';
import { ThemeService } from '../shared/theme.service';
import { FlightInformation } from 'src/lib/socket-events/flight-tracking';
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

  focus(entity: DeepReadonly<Entity>): void {
    const entityPosition = entity?.position?.getValue(this.viewer.clock.currentTime);

    if (entityPosition === undefined) {
      console.error('Failed to navigate to entity because entity has no position');
      return;
    }

    const entityPositionCartesian = Cartographic.fromCartesian(entityPosition);

    this.viewer.camera.flyTo({
      destination: Cartesian3.fromRadians(
        entityPositionCartesian.longitude,
        entityPositionCartesian.latitude,
        2_000_000
      ),
    });
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
    return this.viewer.entities.add({
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
  }

  public CreatePolygonNoFlyZone(noFlyZone: PolygonNoFlyZone): Entity {
    const coordinates = noFlyZone.vertices.map((vertice) => {
      return Cartesian3.fromDegrees(vertice.longitude, vertice.latitude, 0);
    });

    return this.viewer.entities.add({
      parent: undefined,
      name: noFlyZone.id, // String name
      polygon: {
        hierarchy: coordinates,
        outlineColor: Color.BLACK,
        material: Color.fromCssColorString(this.theme.noFlyZoneColor),

        height: noFlyZone.altitude,
        heightReference: HeightReference.RELATIVE_TO_GROUND,
        extrudedHeight: 0.0,
        extrudedHeightReference: HeightReference.CLAMP_TO_GROUND,
      },
    });
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

    return this.viewer.entities.add({
      name: '',
      // parent: this.viewer.entities.getById('Flight ICAO: ' + ICAOIn),
      polyline: {
        width: 1,
        positions: points,
        clampToGround: true,
        material: Color.fromCssColorString(this.theme.pathColor),
      },
    });
  }
}
