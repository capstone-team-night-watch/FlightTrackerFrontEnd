import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public pathColor = 'white';
  public airportColor = 'green';
  public noFlyZoneColor = '#f02b358c';
  public alternatePathColor = 'yellow';

  constructor() {}
}
