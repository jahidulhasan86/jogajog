import { HttpClient } from '@angular/common/http';
import { MultiTranslateHttpLoader } from 'ngx-translate-multi-http-loader';

import isElectron from "is-electron";

// import {} from '../../../assets/translate/'
// AoT requires an exported function for factories

export function HttpLoaderFactory(http: HttpClient) {
	
	var isElectronRunning = isElectron();
	let _dir : any
	if(isElectronRunning) _dir = __dirname
	else _dir = '../../..'

	return new MultiTranslateHttpLoader(http, [
			{ prefix: _dir + '/assets/translate/shared/components/header/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/shared/components/banner/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/register/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/login/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/home-contant/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/shared/components/support/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/shared/components/footer/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/invite-meeting/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/host-meeting/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/shared/components/room-config/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/dashboard/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/dashboard-home/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/meeting-info/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/shared/components/room-controller/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/pages/aboutus/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/pages/plans-pricing/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/pages/faq/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/pages/user-guide/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/pages/support-services/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/pages/why-jagajag/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/room-box/room-box/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/room-box/room-box/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/contacts/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/company-invitation-list/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/room-box/create-room/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/room-box/resource-room-box/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/room-box/room-details/room-details/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/room-box/room-details/update-room-box/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/room-box/discussion/discussion/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/room-box/discussion/create-new-discussion/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/room-box/discussion/discussion-details/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/room-box/discussion/comment/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/meeting-schedules/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/room-box/chat-room-box/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/reset-forget-pass/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/shared/components/meeting-reminder/', suffix: '.json' },
			{ prefix: _dir + '/assets/translate/dashboard/profile/', suffix: '.json' },

		]);
	
}
