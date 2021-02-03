import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../material.module';
import { FormsModule } from '@angular/forms';
import { CompanyInvitationListComponent } from 'src/app/dashboard/company-invitation-list/company-invitation-list.component';
import { RoomJoinRequestComponent } from 'src/app/dashboard/room-join-request-list/room-join-request.component';
import { LangTranslateModule } from '../../lang-translate/lang-translate.module';



@NgModule({
  declarations: [CompanyInvitationListComponent,RoomJoinRequestComponent],
  imports: [
    CommonModule,
    MaterialModule,
    FormsModule,
    LangTranslateModule,
  ],
  exports:[
    CompanyInvitationListComponent,
    RoomJoinRequestComponent
  ],
  providers:[
    // AccountService
  ]
})
export class NotificationsModule { }
