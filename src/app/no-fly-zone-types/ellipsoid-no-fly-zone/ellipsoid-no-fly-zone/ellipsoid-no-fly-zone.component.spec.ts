import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EllipsoidNoFlyZoneComponent } from './ellipsoid-no-fly-zone.component';
import { AppModule } from 'src/app/app.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('EllipsoidNoFlyZoneComponent', () => {
  let component: EllipsoidNoFlyZoneComponent;
  let fixture: ComponentFixture<EllipsoidNoFlyZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EllipsoidNoFlyZoneComponent ],
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
    })
    .compileComponents();

    fixture = TestBed.createComponent(EllipsoidNoFlyZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
