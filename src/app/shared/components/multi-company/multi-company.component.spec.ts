import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MultiCompanyComponent } from './multi-company.component';

describe('MultiCompanyComponent', () => {
  let component: MultiCompanyComponent;
  let fixture: ComponentFixture<MultiCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MultiCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MultiCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
