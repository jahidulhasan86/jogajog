import { TestBed } from '@angular/core/testing';

import { MultiCompanyService } from './multi-company.service';

describe('MultiCompanyService', () => {
  let service: MultiCompanyService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MultiCompanyService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
