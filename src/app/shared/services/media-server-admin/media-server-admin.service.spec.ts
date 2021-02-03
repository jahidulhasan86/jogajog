import { TestBed } from '@angular/core/testing';

import { MediaServerAdminService } from './media-server-admin.service';

describe('MediaServerAdminService', () => {
  let service: MediaServerAdminService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(MediaServerAdminService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
