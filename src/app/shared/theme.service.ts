import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  public pathColor = 'white';
  public noFlyZoneColor = '#f02b358c';

  constructor() {}
}
