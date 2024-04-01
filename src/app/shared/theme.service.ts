import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public pathColor = 'white';
  public alternatePathColor = 'yellow';
  public airportColor = 'green';
  public noFlyZoneColor = '#f02b358c';

  constructor() {}
}
