import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { VideoRoomComponent } from './video-room/video-room.component';
import { GuestLoginComponent } from './guest-login/guest-login.component';
import { AuthGuard } from './auth/auth.guard';
import { PagesComponent } from './pages/pages.component';
import { SupportServicesComponent } from './pages/support-services/support-services.component';
import { AboutusComponent } from './pages/aboutus/aboutus.component';
import { OurSolutionsComponent } from './pages/our-solutions/our-solutions.component';
import { PlansPricingComponent } from './pages/plans-pricing/plans-pricing.component';
// import { DashboardComponent } from './dashboard/dashboard.component';
// import { MeetingSchedulesComponent } from './dashboard/meeting-schedules/meeting-schedules.component';
import {WhyJagajagComponent} from './pages/why-jagajag/why-jagajag.component';
import { PaymentSuccessComponent } from './shared/components/payment/payment-success/payment-success.component';
import { PaymentFailedComponent } from './shared/components/payment/payment-failed/payment-failed.component';
import { LearnTogetherComponent } from './learn-together/learn-together.component';
import { TeamTogetherComponent } from './team-together/team-together.component';
import { FaqComponent } from './pages/faq/faq.component';
import { UserGuideComponent } from './pages/user-guide/user-guide.component';
import { LearntogetherSinglepageComponent } from './pages/learntogether-singlepage/learntogether-singlepage.component';
import { PlaybackComponent } from './playback/playback.component';
import { RecordingComponent } from './dashboard/recording/recording.component';
import { ResetPasswordComponent } from './reset-password/reset-password.component';
const routes: Routes = [
	{ path: '', component: HomeComponent },
	{
		path: '',
		component: PagesComponent,
		children: [
			{ path: 'support-services', component: SupportServicesComponent },
			{ path: 'contactus', component: AboutusComponent },
			{ path: 'our-solutions', component: OurSolutionsComponent },
			{ path: 'plan-pricing', component: PlansPricingComponent },
			{ path: 'payment-success', component: PaymentSuccessComponent },
			{ path: 'payment-failed', component: PaymentFailedComponent },
			{ path: 'FAQ', component: FaqComponent },
			{ path: 'user-guide', component: UserGuideComponent },
			{path: 'learnTogether', component: LearntogetherSinglepageComponent},
			{ path: 'teamTogether', component: TeamTogetherComponent },
			{ path: 'why-jagajag', component: WhyJagajagComponent },
			{ path: 'reset-password', component: ResetPasswordComponent },
		
		]
	},
	{
		path: 'solutions', component: HomeComponent
	},
	{
		path: 'meeting',
		component: VideoRoomComponent,
		canActivate: [AuthGuard],
		pathMatch: 'full',
		data: {
			loginOpen: true
		}
	},
	{
		path: 'meeting/:token/:is_req_password',
		component: VideoRoomComponent,
		canActivate: [AuthGuard],
		pathMatch: 'full',
		data: {
			loginOpen: true
		}
	},
	{
		path: 'meeting/:token/:is_req_password/:isRequiredRegistration',
		component: VideoRoomComponent,
		canActivate: [AuthGuard],
		pathMatch: 'full',
		data: {
			loginOpen: true
		}
	},
	{
		path: 'dashboard',
		canActivate: [AuthGuard],
		loadChildren: () => import('./dashboard/dashboard.module').then((m) => m.DashboardModule)
		// component: DashboardComponent,
		// children: [
		// 	{ path: 'meetingtest', component: MeetingSchedulesComponent },
		// 	{ path: '', redirectTo: '', pathMatch: 'full' }
		// ]
	},
	{ path: 'playback', component: PlaybackComponent},
	// { path: 'recording', component: RecordingComponent, pathMatch: 'full' },
	
	{ path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
	imports: [RouterModule.forRoot(routes, { useHash: true, onSameUrlNavigation: 'reload', anchorScrolling: 'enabled' })],
	exports: [RouterModule]
})
export class AppRoutingModule {}
