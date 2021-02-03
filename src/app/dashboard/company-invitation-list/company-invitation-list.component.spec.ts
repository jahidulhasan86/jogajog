import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyInvitationListComponent } from './company-invitation-list.component';

describe('CompanyInvitationListComponent', () => {
  let component: CompanyInvitationListComponent;
  let fixture: ComponentFixture<CompanyInvitationListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompanyInvitationListComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompanyInvitationListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
