import { getNoFlyZonesConflictResponse } from './get-no-fly-zones-conflict-response';

describe('GetNoFlyZonesConflictResponse', () => {
  it('should create and instance', () => {
    expect(new getNoFlyZonesConflictResponse('zone name', false)).toBeTruthy();
  });
});
