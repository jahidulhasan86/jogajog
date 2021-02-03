import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TeamTogetherComponent } from './team-together.component';

describe('TeamTogetherComponent', () => {
  let component: TeamTogetherComponent;
  let fixture: ComponentFixture<TeamTogetherComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TeamTogetherComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TeamTogetherComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
