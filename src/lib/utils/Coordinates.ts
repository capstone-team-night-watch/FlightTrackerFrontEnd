import { GeographicCoordinates2D, GeographicCoordinates3D } from '../simulation-entities/coordinattes';

export function parseLatLong(latLongs: number[]): GeographicCoordinates2D[] {
  const result = [];

  for (let i = 0; i < latLongs.length; i += 2) {
    const latitude = latLongs[i];
    const longitude = latLongs[i + 1];

    const cartesian = {
      latitude,
      longitude,
    } satisfies GeographicCoordinates2D;

    result.push(cartesian);
  }

  return result;
}
