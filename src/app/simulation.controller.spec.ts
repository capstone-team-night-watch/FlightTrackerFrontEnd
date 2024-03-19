import { TestBed } from '@angular/core/testing';

import { CesiumSimulationController } from './simulation.controller';
import { HttpClientModule } from '@angular/common/http';
import { AppModule } from './app.module';

describe('CesiumSimulationController', () => {
  let controller: CesiumSimulationController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
    });
    controller = TestBed.inject(CesiumSimulationController);
  });

  it('should be created', () => {
    expect(controller).toBeTruthy();
  });
});
