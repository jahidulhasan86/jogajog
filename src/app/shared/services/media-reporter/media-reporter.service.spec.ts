import { TestBed } from '@angular/core/testing';

import { MediaReporterService } from './media-reporter.service';

describe('MediaReporterService', () => {
  let service: MediaReporterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaReporterService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
