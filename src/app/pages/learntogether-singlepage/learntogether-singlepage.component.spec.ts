import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LearntogetherSinglepageComponent } from './learntogether-singlepage.component';

describe('LearntogetherSinglepageComponent', () => {
  let component: LearntogetherSinglepageComponent;
  let fixture: ComponentFixture<LearntogetherSinglepageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LearntogetherSinglepageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LearntogetherSinglepageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
