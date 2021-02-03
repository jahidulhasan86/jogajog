import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatRoomBoxComponent } from './chat-room-box.component';

describe('ChatRoomBoxComponent', () => {
  let component: ChatRoomBoxComponent;
  let fixture: ComponentFixture<ChatRoomBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChatRoomBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChatRoomBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
