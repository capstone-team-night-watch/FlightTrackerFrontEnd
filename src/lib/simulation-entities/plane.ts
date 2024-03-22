import { Entity } from "cesium";
import { FlightInformation } from "../socket-events/flight-tracking";

export type Plane = {
    isTracked: boolean,
    cesiumEntity: Readonly<Entity>,
    flightInformation: FlightInformation,
}