import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CesiumShowcaseComponent } from './cesium-showcase-page.component';
import { AppModule } from '../app.module';
import { CesiumService } from '../cesium.service';
import { MatDialog } from '@angular/material/dialog';

describe('CesiumShowCasePageComponent', () => {
  let component: CesiumShowcaseComponent;
  let fixture: ComponentFixture<CesiumShowcaseComponent>;
  let matDialogMock: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    matDialogMock = jasmine.createSpyObj('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [CesiumShowcaseComponent],
      imports: [AppModule],
      providers: [{ provide: MatDialog, useValue: matDialogMock }],
    }).compileComponents();

    fixture = TestBed.createComponent(CesiumShowcaseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create instance', () => {
    expect(component).toBeTruthy();
  });

  it('should get tracked flights', () => {
    component.getTrackedFlights();
    expect(component.tracked_flight_list).toBeTruthy();
    expect(component.are_tracked_visible).toBeTruthy();
  });

  it('should set flight icao search', () => {
    const flightIcao = 'flightABC';
    component.setFlightIcao(flightIcao);
    expect(component.search).toEqual(flightIcao);
  });

  it('should toggle visible flights', () => {
    component.toggleFlightsVisible();
    expect(component.are_flights_visible).toBeFalsy(); // init true by default
  });

  it('should call MatDialog.open when addNoFlyZone is called', () => {
    component.addNoFlyZone();
    expect(matDialogMock.open).toHaveBeenCalled();
    expect(component.are_flights_visible).toBeFalsy();
  });
});
