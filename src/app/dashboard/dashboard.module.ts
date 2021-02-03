import { NgModule, CUSTOM_ELEMENTS_SCHEMA  } from '@angular/core';

import { FormsModule,ReactiveFormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';
import { MaterialModule } from '../shared/material.module';
import { OwlModule } from 'ngx-owl-carousel';
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { MeetingSchedulesComponent } from './admin/meeting-schedules/meeting-schedules.component';
import { ContactsComponent } from './contacts/contacts.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { LangTranslateModule } from '../shared/lang-translate/lang-translate.module';
import { AdminComponent } from './admin/admin.component';
import { ReportsComponent } from './admin/reports/reports.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { DatePipe } from '@angular/common';
import { FilterPipeModule } from 'ngx-filter-pipe';
import { ExportAsModule } from 'ngx-export-as';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { DemoUtilsModule } from './admin/meeting-schedules/schedules-utils/modules';
import { MultiCompanyComponent } from '../shared/components/multi-company/multi-company.component';
import { CompanyMembersComponent } from './company-members/company-members.component';
import { RoomBoxComponent } from './room-box/room-box.component';
import { RoomDetailsComponent } from './room-box/room-details/room-details.component';
import { CreateRoomComponent } from './room-box/create-room/create-room.component';
import { ContactAddComponent} from './contacts/contact.add.component'
// import{ArraySortPipe} from '../shared/pipes/sort.pipe'
import {ArraySortPipe} from '../shared/pipes/sort.pipe';
import {AddMembersComponent} from './add-members/add-members.component';
import { CompanyInvitationListComponent } from './company-invitation-list/company-invitation-list.component';
import { ChatRoomBoxComponent } from './room-box/chat-room-box/chat-room-box.component';
import { ResourceRoomBoxComponent } from './room-box/resource-room-box/resource-room-box.component';
import { UpdateRoomBoxComponent } from './room-box/room-details/update-room-box/update-room-box.component';
import{DiscussionComponent} from './room-box/discussion/discussion.component';
import {DiscussionDetailsComponent} from './room-box/discussion/discussion-details/discussion.details.component';
import {CommentComponent} from './room-box/discussion/comment/comment.component';
import{PublicRoomComponent} from './room-box/public-room/public.room.component';
import {MatCardModule} from '@angular/material/card'; 
import {MatButtonModule} from '@angular/material/button';
// import {NotificationPanelComponent} from  './room-box/notification-panel/notification-panel.component'
import{RoomJoinRequestComponent} from './room-join-request-list/room-join-request.component'
import {RoomBoxMeetingSchedulesComponent} from './room-box/room-box-meeting-schedule/meeting-schedules.component';
import { CreateScheduleComponent } from './room-box/room-box-meeting-schedule/create-schedule/create-schedule.component';
import { InvitationRoomComponent } from './room-box/invitation-room-popup/invitation-room-component'
import { DiscussionEditComponent } from './room-box/discussion/edit-popup/discussion.edit';
import { ErrorReportComponent } from './admin/reports/error-report/error-report.component';
import { ChartsModule } from 'ng2-charts';
import { MediaServerEventsComponent } from './admin/reports/media-server-events/media-server-events.component';
import { ProfileComponent } from './profile/profile.component';
import { PasswordUpdateComponent } from './profile/password-update/password-update.component';
import { NotificationsModule } from '../shared/modules/notifications/notifications.module';
import { RoomRecordingComponent } from './room-box/room-recording/room-recording.component';
// import { SettingsComponent } from './settings/settings.component';

@NgModule({
	declarations: [DashboardComponent, MeetingSchedulesComponent, ContactsComponent, DashboardHomeComponent, AdminComponent, ReportsComponent, MultiCompanyComponent, CompanyMembersComponent,ContactAddComponent,ArraySortPipe,AddMembersComponent, RoomBoxComponent, RoomDetailsComponent,CreateRoomComponent, ChatRoomBoxComponent, ResourceRoomBoxComponent, UpdateRoomBoxComponent,DiscussionComponent,DiscussionDetailsComponent,CommentComponent,PublicRoomComponent, RoomBoxMeetingSchedulesComponent, CreateScheduleComponent,DiscussionEditComponent,InvitationRoomComponent,ErrorReportComponent, MediaServerEventsComponent, ProfileComponent, PasswordUpdateComponent, RoomRecordingComponent],
	//declarations: [DashboardComponent, MeetingSchedulesComponent, ContactsComponent, DashboardHomeComponent, AdminComponent, ReportsComponent, MultiCompanyComponent, CompanyMembersComponent,ContactAddComponent,ArraySortPipe,AddMembersComponent,CompanyInvitationListComponent, RoomBoxComponent, RoomDetailsComponent,CreateRoomComponent, ChatRoomBoxComponent, ResourceRoomBoxComponent, UpdateRoomBoxComponent,DiscussionComponent,DiscussionDetailsComponent,CommentComponent,PublicRoomComponent,RoomJoinRequestComponent, RoomBoxMeetingSchedulesComponent, CreateScheduleComponent, ErrorReportComponent],
	//declarations: [DashboardComponent, MeetingSchedulesComponent, ContactsComponent, DashboardHomeComponent, AdminComponent, ReportsComponent, MultiCompanyComponent, CompanyMembersComponent,ContactAddComponent,ArraySortPipe,AddMembersComponent,CompanyInvitationListComponent, RoomBoxComponent, RoomDetailsComponent,CreateRoomComponent, ChatRoomBoxComponent, ResourceRoomBoxComponent, UpdateRoomBoxComponent,DiscussionComponent,DiscussionDetailsComponent,CommentComponent,PublicRoomComponent,],
	imports: [ChartsModule, CommonModule, DashboardRoutingModule, MaterialModule, OwlModule, LangTranslateModule, NgxSpinnerModule, FormsModule, ReactiveFormsModule, FilterPipeModule, ExportAsModule, MatCardModule, MatButtonModule, NotificationsModule, CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
	//declarations: [DashboardComponent, MeetingSchedulesComponent, ContactsComponent, DashboardHomeComponent, AdminComponent, ReportsComponent, MultiCompanyComponent, CompanyMembersComponent, ],
	//imports: [CommonModule, DashboardRoutingModule, MaterialModule,OwlModule, LangTranslateModule, NgxSpinnerModule, FormsModule, ReactiveFormsModule, FilterPipeModule, ExportAsModule, CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
		DemoUtilsModule],
	schemas: [CUSTOM_ELEMENTS_SCHEMA],
	providers: [DatePipe],
	entryComponents: [ContactAddComponent,PublicRoomComponent,InvitationRoomComponent,DiscussionEditComponent]
	
	
	
})
export class DashboardModule {}
