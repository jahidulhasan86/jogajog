import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HomeContantComponent } from './home-contant.component';

describe('HomeContantComponent', () => {
  let component: HomeContantComponent;
  let fixture: ComponentFixture<HomeContantComponent>;

  beforeEach(async(() => {
	TestBed.configureTestingModule({
		declarations: [ HomeContantComponent ]
	})
	.compileComponents();
  }));

  beforeEach(() => {
	fixture = TestBed.createComponent(HomeContantComponent);
	component = fixture.componentInstance;
	fixture.detectChanges();
  });

  it('should create', () => {
	expect(component).toBeTruthy();
  });
});
