import { TestBed } from '@angular/core/testing';

import { ViewController } from './view.controller';
import { HttpClientModule } from '@angular/common/http';
import { AppModule } from './app.module';

describe('ViewController', () => {
  let controller: ViewController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppModule],
    });
    controller = TestBed.inject(ViewController);
  });

  it('should be created', () => {
    expect(controller).toBeTruthy();
  });
});
