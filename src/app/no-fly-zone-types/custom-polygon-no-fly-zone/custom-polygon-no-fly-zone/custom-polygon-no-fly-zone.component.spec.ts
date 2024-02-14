import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPolygonNoFlyZoneComponent } from './custom-polygon-no-fly-zone.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { AppModule } from 'src/app/app.module';

describe('CustomPolygonNoFlyZoneComponent', () => {
  let component: CustomPolygonNoFlyZoneComponent;
  let fixture: ComponentFixture<CustomPolygonNoFlyZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomPolygonNoFlyZoneComponent],
      imports: [AppModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {},
        },
        {
          provide: MAT_DIALOG_DATA,
          useValue: {},
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomPolygonNoFlyZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
