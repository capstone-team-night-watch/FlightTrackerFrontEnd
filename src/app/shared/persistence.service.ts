import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';
import { UIError } from 'src/lib/error';
import { FlightInformation } from 'src/lib/socket-events/flight-tracking';
import { NoFlyZoneInfo } from 'src/lib/socket-events/no-fly-zone-tracking';
import { Url } from 'src/lib/utils/url';

@Injectable({
  providedIn: 'root',
})
export class PersistenceService {
  private httpClient: HttpClient;

  constructor(httpClient: HttpClient) {
    this.httpClient = httpClient;
  }

  /**
   * Fetches the full list of active no fly zone from the consumer
   */
  public async getAllNoFlyZone(): Promise<NoFlyZoneInfo[]> {
    try {
      return await lastValueFrom(this.httpClient.get<NoFlyZoneInfo[]>(Url.consumer()));
    } catch (error) {
      throw new UIError('Failed to get no fly zones');
    }
  }

  /**
   * Fetches the full list of active  flight from the consumer
   */
  public async getAllActiveFlight(): Promise<FlightInformation[]> {
    try {
      return await lastValueFrom(this.httpClient.get<FlightInformation[]>(Url.consumer()));
    } catch (error) {
      throw new UIError('Failed to get the list of actively tracked flight');
    }
  }
}
