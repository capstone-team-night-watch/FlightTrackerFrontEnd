import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlightTrackerDashboardComponent } from './flight-tracker-dashboard.component';

describe('FlightTrackerDashboardComponent', () => {
  let component: FlightTrackerDashboardComponent;
  let fixture: ComponentFixture<FlightTrackerDashboardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FlightTrackerDashboardComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FlightTrackerDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
