import { Entity } from "cesium"
import { NoFlyZoneInfo } from "../socket-events/no-fly-zone-tracking"

export type NoFlyZoneEntity = {
    info: NoFlyZoneInfo,
    cesiumEntity: Entity,
} 