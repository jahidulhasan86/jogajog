import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { WhyJagajagComponent } from './why-jagajag.component';

describe('WhyJagajagComponent', () => {
  let component: WhyJagajagComponent;
  let fixture: ComponentFixture<WhyJagajagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ WhyJagajagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(WhyJagajagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
