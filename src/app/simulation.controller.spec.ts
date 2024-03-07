import { TestBed } from '@angular/core/testing';

import { SimulationController } from './simulation.controller';
import { HttpClientModule } from '@angular/common/http';
import { AppModule } from './app.module';

describe('ViewController', () => {
  let controller: SimulationController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
    });
    controller = TestBed.inject(SimulationController);
  });

  it('should be created', () => {
    expect(controller).toBeTruthy();
  });
});
