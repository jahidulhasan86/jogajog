import { TestBed } from '@angular/core/testing';

import { PaymentCoreService } from './payment-core.service';

describe('PaymentCoreService', () => {
  let service: PaymentCoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PaymentCoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
