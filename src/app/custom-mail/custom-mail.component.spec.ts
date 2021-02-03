import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomMailComponent } from './custom-mail.component';

describe('CustomMailComponent', () => {
  let component: CustomMailComponent;
  let fixture: ComponentFixture<CustomMailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomMailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomMailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
