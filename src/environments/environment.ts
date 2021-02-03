// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  appVersion: require('../../package.json').version + '-dev',
  openvidu_url: '',
  openvidu_secret: '',
  firebase: {
	apiKey: 'AIzaSyCtvCt8NsVw2hPkYiFAPymDEfYGJYfo5l4',
	authDomain: 'videohub-bfb30.firebaseapp.com',
	databaseURL: 'https://videohub-bfb30.firebaseio.com',
	projectId: 'videohub-bfb30',
	storageBucket: 'videohub-bfb30.appspot.com',
	messagingSenderId: '610625990412',
	appId : '34033870-802c-4349-b8a6-d48212d7c507'
  }
};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
