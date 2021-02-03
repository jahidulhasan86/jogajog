import { BrowserModule } from '@angular/platform-browser';
import { RecaptchaModule } from 'angular-google-recaptcha';
import { NgxSpinnerModule } from 'ngx-spinner';
import { NgModule, Injector } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

// import { MatBadgeModule } from '@angular/material/badge';
// import { MatButtonModule } from '@angular/material/button';
// import { MatCardModule } from '@angular/material/card';
// import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
// import { MatDialogModule } from '@angular/material/dialog';
// import { MatFormFieldModule } from '@angular/material/form-field';
// import { MatGridListModule } from '@angular/material/grid-list';
// import { MatInputModule } from '@angular/material/input';
// import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
// import { MatSelectModule } from '@angular/material/select';
// import { MatSidenavModule } from '@angular/material/sidenav';
// import { MatSliderModule } from '@angular/material/slider';
// import { MatToolbarModule } from '@angular/material/toolbar';
// import { MatTooltipModule } from '@angular/material/tooltip';
// import { MatSnackBarModule } from '@angular/material/snack-bar';
// import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AppRoutingModule } from './app-routing.module';
import { HttpClientModule } from '@angular/common/http';
import { createCustomElement } from '@angular/elements';
import { ElementZoneStrategyFactory } from 'elements-zone-strategy';
import { NgxLinkifyjsModule } from 'ngx-linkifyjs';
import { FlexLayoutModule } from '@angular/flex-layout';
// import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
// import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';
// import { MatDatepickerModule } from '@angular/material/datepicker';
import { OwlModule } from 'ngx-owl-carousel';
// import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { AngularFireDatabaseModule } from '@angular/fire/database';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { AngularFireModule } from '@angular/fire';
// import {MatCheckboxModule} from '@angular/material/checkbox';
import { MaterialModule } from './shared/material.module';
// Pipes
import { LinkifyPipe } from './shared/pipes/linkfy';
import {
	HasChatPipe,
	HasAudioPipe,
	HasVideoPipe,
	IsAutoPublishPipe,
	HasScreenSharingPipe,
	HasFullscreenPipe,
	HasLayoutSpeakingPipe,
	HasExitPipe
} from './shared/pipes/ovSettings.pipe';
import { TooltipListPipe } from './shared/pipes/tooltipList.pipe';
import {NoopAnimationsModule} from '@angular/platform-browser/animations';
import {FilterPipeModule } from 'ngx-filter-pipe';
// Services
import { NetworkService } from './shared/services/network/network.service';
import { OpenViduSessionService } from './shared/services/openvidu-session/openvidu-session.service';
import { UtilsService } from './shared/services/utils/utils.service';
import { DevicesService } from './shared/services/devices/devices.service';
import { RemoteUsersService } from './shared/services/remote-users/remote-users.service';
import { ChatService } from './shared/services/chat/chat.service';
import { LoggerService } from './shared/services/logger/logger.service';
import { NotificationService } from './shared/services/notifications/notification.service';
import { StorageService } from './shared/services/storage/storage.service';
import { AuthGuard } from './auth/auth.guard';
import { BfcpFloorService } from './shared/services/bfcp-floor/bfcp-floor.service';
import { XmppChatService } from './shared/services/xmpp-chat/xmpp-chat.service';
import { AdminDashboardService } from './shared/services/admin-dashboard/admin-dashboard.service';
import { ReportServicesService } from './shared/services/reports/report-services.service';

// Components
import { StreamComponent } from './shared/components/stream/stream.component';
import { ChatComponent } from './shared/components/chat/chat.component';
import { OpenViduVideoComponent } from './shared/components/stream/ov-video.component';
import { DialogErrorComponent } from './shared/components/dialog-error/dialog-error.component';
import { ToolbarComponent } from './shared/components/toolbar/toolbar.component';
import { ToolbarLogoComponent } from './shared/components/toolbar/logo.component';
import { RoomConfigComponent } from './shared/components/room-config/room-config.component';
import { WebComponentComponent } from './web-component/web-component.component';
import { VideoRoomComponent } from './video-room/video-room.component';
import { HomeComponent } from './home/home.component';
import { AppComponent } from './app.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { RoomControllerComponent } from './shared/components/room-controller/room-controller.component';
import { HeaderComponent } from './shared/components/header/header.component';
import { BannerComponent } from './shared/components/banner/banner.component';
import { SupportComponent } from './shared/components/support/support.component';
import { HomeContantComponent } from './home-contant/home-contant.component';
import { HostMeetingComponent } from './host-meeting/host-meeting.component';
import { RegisterComponent } from './register/register.component';
import { LoginHeaderComponent } from './login-header/login-header.component';
import { LoginComponent } from './login/login.component';
import { GuestLoginComponent } from './guest-login/guest-login.component';
import { InviteMeetingComponent } from './invite-meeting/invite-meeting.component';
import { environment } from 'src/environments/environment';
import { ChattingComponent } from './chatting/chatting.component';
import { PagesComponent } from './pages/pages.component';
import { SupportServicesComponent } from './pages/support-services/support-services.component';
import { AboutusComponent } from './pages/aboutus/aboutus.component';
import { OurSolutionsComponent } from './pages/our-solutions/our-solutions.component';
import { MeetingInfoComponent } from './meeting-info/meeting-info.component';
import { LangTranslateModule } from './shared/lang-translate/lang-translate.module';
// import { DashboardComponent } from './dashboard/dashboard.component';
// import { MeetingSchedulesComponent } from './dashboard/meeting-schedules/meeting-schedules.component';
import { ParticipantListComponent } from './shared/components/participant-list/participant-list.component';
import { LoginBySocialModule } from './shared/login-by-social-module/login-by-social.module';
import { LearnTogetherComponent } from './learn-together/learn-together.component';
import { PlansPricingComponent } from './pages/plans-pricing/plans-pricing.component';
import { PaymentSuccessComponent } from './shared/components/payment/payment-success/payment-success.component';
import { PaymentFailedComponent } from './shared/components/payment/payment-failed/payment-failed.component';
import { TeamTogetherComponent } from './team-together/team-together.component';
import { FaqComponent } from './pages/faq/faq.component';
import { UserGuideComponent } from './pages/user-guide/user-guide.component';
import { LearntogetherSinglepageComponent } from './pages/learntogether-singlepage/learntogether-singlepage.component';
import { CalendarModule, DateAdapter } from 'angular-calendar';
import { adapterFactory } from 'angular-calendar/date-adapters/date-fns';
import { CustomMailComponent } from './custom-mail/custom-mail.component';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import { RoomBoxService } from './shared/services/room-box/room-box.service';
import { MatIconModule } from '@angular/material/icon';
import { WhyJagajagComponent } from './pages/why-jagajag/why-jagajag.component';
import { CreateNewDiscussionDialogComponent } from './dashboard/room-box/discussion/create-new-discussion/create-new-discussion.component';
import { MediaReporterService } from '../app/shared/services/media-reporter/media-reporter.service';
import { PlaybackComponent } from "./playback/playback.component";
import { RecordingComponent } from './dashboard/recording/recording.component';
import { MediaServerAdminService } from '../app/shared/services/media-server-admin/media-server-admin.service';
import {ForgetPasswordComponent} from '../app/forget-password/forget-password.component';
import {ResetPasswordComponent} from '../app/reset-password/reset-password.component';
import { MeetingReminderComponent } from './shared/components/meeting-reminder/meeting-reminder.component';
import { CompanyInvitationListComponent } from './dashboard/company-invitation-list/company-invitation-list.component';
import { RoomJoinRequestComponent } from './dashboard/room-join-request-list/room-join-request.component';
import { NotificationsModule } from './shared/modules/notifications/notifications.module';

@NgModule({
	declarations: [
		AppComponent,
		VideoRoomComponent,
		HomeComponent,
		StreamComponent,
		ChatComponent,
		OpenViduVideoComponent,
		DialogErrorComponent,
		RoomConfigComponent,
		WebComponentComponent,
		ToolbarComponent,
		ToolbarLogoComponent,
		LinkifyPipe,
		HasChatPipe,
		HasAudioPipe,
		HasVideoPipe,
		IsAutoPublishPipe,
		HasScreenSharingPipe,
		HasFullscreenPipe,
		HasLayoutSpeakingPipe,
		HasExitPipe,
		TooltipListPipe,
		FooterComponent,
		RoomControllerComponent,
		HeaderComponent,
		BannerComponent,
		HomeContantComponent,
		LoginComponent,
		GuestLoginComponent,
		LoginHeaderComponent,
		HostMeetingComponent,
		RegisterComponent,
		InviteMeetingComponent,
		ChattingComponent,
		PagesComponent,
		SupportComponent,
		SupportServicesComponent,
		AboutusComponent,
		OurSolutionsComponent,
		MeetingInfoComponent,
		// DashboardComponent,
		// MeetingSchedulesComponent,
		ParticipantListComponent,
		PaymentSuccessComponent,
		PaymentFailedComponent,
		PlansPricingComponent,
		LearnTogetherComponent,
		TeamTogetherComponent,
		FaqComponent,
		UserGuideComponent,
		LearntogetherSinglepageComponent,
		CustomMailComponent,		
		WhyJagajagComponent,
		CreateNewDiscussionDialogComponent,
		PlaybackComponent,
		RecordingComponent,
		ForgetPasswordComponent,
		ResetPasswordComponent,
		MeetingReminderComponent,
		// CompanyInvitationListComponent,
		// RoomJoinRequestComponent
	],
	imports: [
		FormsModule,
		ReactiveFormsModule,
		BrowserModule,
		BrowserAnimationsModule,
		MaterialModule,
		MatIconModule,
		NgxSpinnerModule,
		// MatButtonModule,
		// MatCardModule,
		// MatToolbarModule,
		// MatIconModule,
		// MatInputModule,
		// MatFormFieldModule,
		// MatDialogModule,
		// MatTooltipModule,
		// MatBadgeModule,
		// MatGridListModule,
		// MatSelectModule,
		// MatOptionModule,
		// MatProgressSpinnerModule,
		// MatSliderModule,
		// MatSidenavModule,
		// MatSnackBarModule,
		// MatProgressBarModule,
		AppRoutingModule,
		HttpClientModule,
		FlexLayoutModule,
		// MatDatepickerModule,
		// MatNativeDateModule,
		OwlModule,
		// NgxMaterialTimepickerModule,
		// MatCheckboxModule,
		NgxLinkifyjsModule.forRoot(),
		AngularFireDatabaseModule,
		AngularFireAuthModule,
		AngularFireMessagingModule,
		AngularFireModule,
		AngularFireModule.initializeApp(environment.firebase),
		NoopAnimationsModule,
		LangTranslateModule,
		LoginBySocialModule,
		RecaptchaModule.forRoot({
			siteKey: '6Lchvq0ZAAAAAHdUEm2-tOVzwJc28t6wU8GQq_RO',
		}),
		CalendarModule.forRoot({ provide: DateAdapter, useFactory: adapterFactory }),
		FilterPipeModule,
		MatAutocompleteModule,
		NotificationsModule
	],
	entryComponents: [
		DialogErrorComponent,
		WebComponentComponent,
		LoginComponent,
		GuestLoginComponent,
		LoginHeaderComponent,
		HostMeetingComponent,
		InviteMeetingComponent,
		RegisterComponent,
		MeetingInfoComponent,
		CreateNewDiscussionDialogComponent,
		ForgetPasswordComponent,
		MeetingReminderComponent
	],
	providers: [
		NetworkService,
		OpenViduSessionService,
		UtilsService,
		RemoteUsersService,
		DevicesService,
		LoggerService,
		ChatService,
		NotificationService,
		StorageService,
		AuthGuard,
		BfcpFloorService,
		RegisterComponent,
		XmppChatService,
		AdminDashboardService,
		ReportServicesService,
		RoomBoxService,
		MediaReporterService,
		MediaServerAdminService
	],
	bootstrap: [AppComponent]
})
export class AppModule {
	constructor(private injector: Injector) {
		const strategyFactory = new ElementZoneStrategyFactory(WebComponentComponent, this.injector);
		const element = createCustomElement(WebComponentComponent, { injector: this.injector, strategyFactory });
		customElements.define('openvidu-webcomponent', element);
	}

	ngDoBootstrap() {}
}
