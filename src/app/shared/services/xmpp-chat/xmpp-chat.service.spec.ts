import { TestBed } from '@angular/core/testing';

import { XmppChatService } from './xmpp-chat.service';

describe('XmppChatService', () => {
  let service: XmppChatService;

  beforeEach(() => {
	TestBed.configureTestingModule({});
	service = TestBed.inject(XmppChatService);
  });

  it('should be created', () => {
	expect(service).toBeTruthy();
  });
});
