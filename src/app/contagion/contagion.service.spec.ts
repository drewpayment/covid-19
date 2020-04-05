import { TestBed } from '@angular/core/testing';

import { ContagionService } from './contagion.service';

describe('ContagionService', () => {
  let service: ContagionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContagionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
