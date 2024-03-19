import { TestBed } from '@angular/core/testing';

import { CesiumViewController } from './view.controller';
import { HttpClientModule } from '@angular/common/http';
import { AppModule } from './app.module';

describe('CesiumViewController', () => {
  let controller: CesiumViewController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
    });
    controller = TestBed.inject(CesiumViewController);
  });

  it('should be created', () => {
    expect(controller).toBeTruthy();
  });
});
