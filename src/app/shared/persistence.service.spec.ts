import { TestBed } from '@angular/core/testing';

import { PersistenceService } from './persistence.service';
import { HttpClientModule } from '@angular/common/http';

describe('PersistenceService', () => {
  let service: PersistenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientModule],
    });
    service = TestBed.inject(PersistenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
