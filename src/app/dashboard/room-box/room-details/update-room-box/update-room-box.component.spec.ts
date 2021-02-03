import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { UpdateRoomBoxComponent } from './update-room-box.component';

describe('UpdateRoomBoxComponent', () => {
  let component: UpdateRoomBoxComponent;
  let fixture: ComponentFixture<UpdateRoomBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ UpdateRoomBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(UpdateRoomBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
