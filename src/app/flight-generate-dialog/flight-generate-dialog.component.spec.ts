import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FlightGenerateDialog } from './flight-generate-dialog.component';
import { AppModule } from '../app.module';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

describe('FlightGenerateDialog', () => {
  let component: FlightGenerateDialog;
  let fixture: ComponentFixture<FlightGenerateDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FlightGenerateDialog],
      imports: [AppModule],
      providers: [
        {
          provide: MatDialogRef,
          useValue: {},
        },
        { provide: MAT_DIALOG_DATA, useValue: {} },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(FlightGenerateDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create instance', () => {
    expect(component).toBeTruthy();
  });
});
