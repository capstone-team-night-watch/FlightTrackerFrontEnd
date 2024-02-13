import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RectangleNoFlyZoneComponent } from './rectangle-no-fly-zone.component';
import { AppModule } from 'src/app/app.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('RectangleNoFlyZoneComponent', () => {
  let component: RectangleNoFlyZoneComponent;
  let fixture: ComponentFixture<RectangleNoFlyZoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RectangleNoFlyZoneComponent ],
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

    fixture = TestBed.createComponent(RectangleNoFlyZoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
