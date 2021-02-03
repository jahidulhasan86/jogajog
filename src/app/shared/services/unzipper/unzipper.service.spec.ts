import { TestBed } from '@angular/core/testing';

import { UnzipperService } from './unzipper.service';

describe('UnzipperService', () => {
  let service: UnzipperService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UnzipperService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
