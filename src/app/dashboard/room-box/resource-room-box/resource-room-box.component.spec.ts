import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ResourceRoomBoxComponent } from './resource-room-box.component';

describe('ResourceRoomBoxComponent', () => {
  let component: ResourceRoomBoxComponent;
  let fixture: ComponentFixture<ResourceRoomBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ResourceRoomBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ResourceRoomBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
