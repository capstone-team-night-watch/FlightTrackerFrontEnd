import { Cartesian3 } from "cesium";
import { Airport } from "../socket-events/flight-tracking";

export type AirportNode = {
    airportObject: Airport;
    coords: number[];
    depth: number;
    leftNode: AirportNode | undefined;
    rightNode: AirportNode | undefined;
};