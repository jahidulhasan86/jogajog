import { TestBed } from '@angular/core/testing';

import { RoomBoxService } from './room-box.service';

describe('RoomBoxService', () => {
  let service: RoomBoxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoomBoxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
