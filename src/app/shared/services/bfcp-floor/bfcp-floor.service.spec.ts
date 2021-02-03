import { TestBed } from '@angular/core/testing';

import { BfcpFloorService } from './bfcp-floor.service';

describe('BfcpFloorService', () => {
  let service: BfcpFloorService;

  beforeEach(() => {
	TestBed.configureTestingModule({});
	service = TestBed.inject(BfcpFloorService);
  });

  it('should be created', () => {
	expect(service).toBeTruthy();
  });
});
