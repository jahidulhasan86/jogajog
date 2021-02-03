import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { DashboardComponent } from './dashboard.component';
import { MeetingSchedulesComponent } from './admin/meeting-schedules/meeting-schedules.component';
import { ContactsComponent } from './contacts/contacts.component';
import { DashboardHomeComponent } from './dashboard-home/dashboard-home.component';
import { AdminComponent } from './admin/admin.component';
import { ReportsComponent } from './admin/reports/reports.component';
import { CompanyMembersComponent } from './company-members/company-members.component';
import { RoomBoxComponent } from './room-box/room-box.component';
import { RoomDetailsComponent } from './room-box/room-details/room-details.component';
import { CreateRoomComponent } from './room-box/create-room/create-room.component';
import { ErrorReportComponent } from './admin/reports/error-report/error-report.component';

import { RecordingComponent } from './recording/recording.component';
import { MediaServerEventsComponent } from './admin/reports/media-server-events/media-server-events.component';

const routes: Routes = [
	{
		path: '',
		component: DashboardComponent,
		children: [
			{ path: '', redirectTo: 'home' },
			{ path: 'home', component: DashboardHomeComponent },
			{ path: 'schedule', component: MeetingSchedulesComponent },
			{ path: 'contacts', component: ContactsComponent },
			{ path: 'admin', component: AdminComponent },
			{ path: 'report', component: ReportsComponent },
			{ path: 'report/media-server', component: ErrorReportComponent },
			{ path: 'report/media-server-events', component: MediaServerEventsComponent },
			{ path: 'company-members', component: CompanyMembersComponent },
			{ path: 'room-box', component: RoomBoxComponent },
			{ path: 'room-box/details/:id', component: RoomDetailsComponent },
			{ path: 'room-box/create', component: CreateRoomComponent },
			{ path: 'recording', component: RecordingComponent },
			{ path: 'room-box/details', component: RoomDetailsComponent }
		]
	}
];

@NgModule({
	imports: [RouterModule.forChild(routes)],
	exports: [RouterModule]
})
export class DashboardRoutingModule {}
