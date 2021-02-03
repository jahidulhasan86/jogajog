import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearnTogetherComponent } from './learn-together.component';

describe('LearnTogetherComponent', () => {
  let component: LearnTogetherComponent;
  let fixture: ComponentFixture<LearnTogetherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearnTogetherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearnTogetherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
