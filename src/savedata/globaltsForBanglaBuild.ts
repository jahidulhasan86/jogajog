// ===== File globals.ts
// Global Config Goes Here
'use strict';

// tslint:disable-next-line: no-inferrable-types
const is_Local_Build: string = 'false'; // "true" = Locally/ "false" = Live"

const http = 'http://';
const https = 'https://';

// if you want to switch you server jst comment/uncomment below 2 line

// let serverDomain = 'api.protect2gether.com/';
const serverDomain = 'hub.sensor.buzz/';

// localizationType: means which build u want to do, Eng/Ban
// const localizationType: string = 'en';
const localizationType: string = 'bn';

const serverUrl = https + serverDomain;
const profilePhotoUpload_ServerUrl = serverDomain === 'hub.sensor.buzz/' ? 'http://103.78.248.70:4002/' : serverUrl;

export const GlobalValue = {
	payment_api_url:  serverUrl + 'mediconnect/api/v1',
	alert_skool_url: is_Local_Build === 'true' ? '' + serverUrl + 'alertskool/api/v1' : '' + serverUrl + 'alertskool/api/v1',

	tasktracker_Service_Url: is_Local_Build === 'true' ? '' + serverUrl + 'task-tracker/api/v1' : '' + serverUrl + 'task-tracker/api/v1',

	Recording_Service_Url: is_Local_Build === 'true' ? 'http://192.168.102.233:4060/api/v1' : '' + serverUrl + 'media-reporter/api',

	smart_city_Service_Url: is_Local_Build === 'true' ? 'http://192.168.102.65:3080/api/v1' : 'http://192.168.102.65:3080/api/v1',

	alert_circel_Service_Url: is_Local_Build === 'true' ? 'http://192.168.102.233:4002/api/v1' : '' + serverUrl + 'iuser/api/v1',

	// video_hub_Service_Url : is_Local_Build == "true" ? "http://192.168.102.233:3600/api/v1" : "http://192.168.102.74:3600/api/v1",
	video_hub_Service_Url: is_Local_Build === 'true' ? 'http://192.168.102.233:3600/api/v1' : '' + serverUrl + 'vsb/api/v1',

	notification_url: is_Local_Build === 'true' ? 'http://192.168.102.232:3520/api/v1' : '' + serverUrl + 'notifier/api/v1',

	profilePhotoUrl: is_Local_Build === 'true' ? 'http://192.168.102.233:4002/' : serverUrl,

	ejabberdServiceUrl: is_Local_Build === 'true' ? 'http://35.161.244.20:3030/' : 'http://35.161.244.20:3030/',

	// mailer_url: is_Local_Build == "true" ? "http://192.168.102.205:4000/api/v1" : "http://192.168.102.205:4000/api/v1",

	chatServiceURL: is_Local_Build === 'true' ? 'http://192.168.102.232:3030/api/v1' : '' + serverUrl + 'chat/api/v1',

	chatwss: is_Local_Build === 'true' ? 'ws://192.168.102.232:5280/websocket/' : 'wss://' + serverDomain + '/chatserver/websocket/',

	geofenceServiceUrl: is_Local_Build === 'true' ? 'http://192.168.102.233:3505/api/v1' : '' + serverUrl + 'geo-fence/api/v1',

	locationGetUrl:
		is_Local_Build === 'true' ? '' + serverUrl + 'location/receiveLocationData' : '' + serverUrl + 'location/receiveLocationData',

	locationPostUrl:
		is_Local_Build === 'true' ? '' + serverUrl + 'location/saveLocationData' : '' + serverUrl + 'location/saveLocationData',

	vxmlServiceUrl: is_Local_Build === 'true' ? 'http://52.221.3.83/api/v1' : 'https://dialengine.sensor.buzz/api/v1',

	googleMapApiKey: is_Local_Build === 'true' ? 'AIzaSyCdRjEKrzYALbcgy8UqardJa0n54Lml3XU' : 'AIzaSyB1L9PaICXQEQxz63Z6e2ECmWuHGpZCRmA',

	broadcastMessage_BaseUrl: is_Local_Build === 'true' ? 'http://192.168.102.233:3529/api/v1' : '' + serverUrl + 'broadcaster/api/v1',

	airlineFlightList_Url:
		is_Local_Build === 'true'
			? 'https://aviation-edge.com/v2/public/timetable?key=a7eb2b-555949&iataCode=DOH'
			: 'https://aviation-edge.com/v2/public/timetable?key=a7eb2b-555949&iataCode=DOH',

	dialEngine_url: is_Local_Build === 'true' ? 'dialengine.sensor.buzz' : 'dialengine.sensor.buzz',

	dialEngineSocket_url: is_Local_Build === 'true' ? 'wss://dialengine.sensor.buzz:8082' : 'wss://dialengine.sensor.buzz:8082',

	jazzware_Service_Url: is_Local_Build === 'true' ? 'http://192.168.102.233:3100/api/v1' : 'https://messageout.sensor.buzz/api/v1',

	floor_websocket_Url: is_Local_Build === 'true' ? 'wss://' + serverDomain + 'bfcp' : 'wss://' + serverDomain + 'bfcp',

	// openvidu_server_Url: is_Local_Build === 'true' ? 'https://52.221.45.167:4443' : 'https://mediaengine.sensor.buzz:4443',
	openvidu_server_Url: is_Local_Build === 'true' ? 'https://52.221.45.167:4443' : 'https://bd.mediaserver.jagajag.com',

	openvidu_server_secret: is_Local_Build === 'true' ? 'SSB_2019' : 'SSB_2019',

	freeswitch_service_url: is_Local_Build === 'true' ? serverUrl + 'freeswitch/api/v1' : serverUrl + 'freeswitch/api/v1',

	// for production
	// app_id :"81e1bf45-fac4-4c07-8c56-a9d62abd9d74" ,  //L2T
	app_id: '34033870-802c-4349-b8a6-d48212d7c507', // "81e1bf45-fac4-4c07-8c56-a9d62abd9d74" ,  //Airline Connect (Technuf build)
	app_name: localizationType === 'en' ? 'Jagajag' : 'Jogajog',
	// app_logo: '' + serverUrl + 'assets/images/ic_launcher.png', // videoChatConnet

	// company_id: 'd17b5d3f-565a-4d5b-8815-e556b7cf90ed', // Default
	company_id: localizationType === 'en' ? '78430815-ddfc-415e-9c5c-d10185da8d77' : '5e146eab-3d84-421b-8748-e0563daf5c24', // Jagajag, Jogajog
	company_name: localizationType === 'en' ? 'Jagajag' : 'Jogajog',

	footer_text_display: localizationType === 'en' ? 'Protect Together Inc.' : 'Bengal Mobile QA Solution',
	app_name_display: localizationType === 'en' ? 'Jagajag' : 'Jogajog',
	title_name: localizationType === 'en' ? 'Jagajag' : 'Jogajog',

	app_logo: localizationType === 'en' ? 'assets/images/logoEn.png' : 'assets/images/logoBn.png',

	// host:"hub.sensor.buzz",
	// host: "api.protect2gether.com",
	host: 'airconnect.sensor.buzz',

	default_company_name: 'Technuf LLC.',
	interval_value: 30000, /////// 1 minute 1 sec = 1000
	server_cick_out_threshold: 1,
	conferenceServerSocket: 'https://videoengine.sensor.buzz',
	recordingServerSocket: '52.43.246.6:9500',
	jsonrpc_version: '2.0',
	recording_base_url: 'http://mediaengine.sensor.buzz/recordings/',
	summary_sensor_data_interval: 600000, //// 10 minut,
	group_tag_settings: ['topic', 'my_group', 'geogroup'], // 'topic', 'my_group', 'geogroup', 'flight', 'radio_group',
	connection_network_threshold: 10, // in seconds,
	bfcp_floor_limit: 50,
	android_app_play_store_link:
		localizationType === 'en'
			? 'https://play.google.com/store/apps/details?id=com.protect2gether.jagajag'
			: 'https://play.google.com/store/apps/details?id=com.protect2gether.jogajog',
	currentBuild: localizationType,
};

export let online_status_display = {
	online: 'Available',
	away: 'Away',
	busy: 'Do not disturb',
	invisible: 'Invisible'
};

export let online_status_xmpp = {
	online: 'chat', /////// https://xmpp.org/rfcs/rfc3921.html  ------2.2.2.1.  Show
	away: 'away',
	busy: 'dnd',
	invisible: 'xa'
};

export let group_type = {
	GROUP_TYPE_GENERAL: 0,
	GROUP_TYPE_PINNED: 1,
	GROUP_TYPE_FLIGHT: 2,
	GROUP_TYPE_GEO: 3
};

export let CommonValue = {
	interval_value: 60000,
	notif_item: [
		{ text: 'Friends', elementRef: null, count: null },
		{ text: 'Conference', elementRef: null, count: null },
		{ text: 'Company Invitation', elementRef: null, count: null }
	],
	temp_req_object: {
		status: 'ok',
		resultset: [
			{
				app_id: '8b8c1ce9-d110-4c3f-939c-eabfe6e049e6',
				notification_id: 'f624ba60-1eca-11e9-92bc-67cc1689d5b9',
				user_id: 'ef2dda0c-580b-4a4b-bca8-6981adf5ddbe',
				data: {
					id: 'f40cd6e0-1eca-11e9-b9de-772b660317a0',
					conference_name: 'Dummy Conference',
					action: 'create',
					conference_type: '2',
					user_name: 'rudra1',
					user_id: 'f6620a16-fe4e-468b-bbc6-f00e63b5b2c9',
					notification_id: 'f624ba60-1eca-11e9-92bc-67cc1689d5b9'
				},
				from: 'f6620a16-fe4e-468b-bbc6-f00e63b5b2c9',
				notify_type: '9',
				is_acknowledge: false,
				is_seen: false,
				service: 'firebase',
				__v: 'f410a775-1eca-11e9-aa44-1f55d3ebba22',
				created_at: '2019-01-23T04:54:23.847Z',
				updated_at: '2019-01-23T04:54:23.847Z'
			},
			{
				app_id: '8b8c1ce9-d110-4c3f-939c-eabfe6e049e6',
				notification_id: 'f624ba60-1eca-11e9-92bc-67cc1689d5b9',
				user_id: 'ef2dda0c-580b-4a4b-bca8-6981adf5ddbe',
				data: {
					id: 'f40cd6e0-1eca-11e9-b9de-772b660317a0',
					conference_name: 'Dummy Conference',
					action: 'create',
					conference_type: '2',
					user_name: 'rudra1',
					user_id: 'f6620a16-fe4e-468b-bbc6-f00e63b5b2c9',
					notification_id: 'f624ba60-1eca-11e9-92bc-67cc1689d5b9'
				},
				from: 'f6620a16-fe4e-468b-bbc6-f00e63b5b2c9',
				notify_type: '9',
				is_acknowledge: false,
				is_seen: false,
				service: 'firebase',
				__v: 'f410a775-1eca-11e9-aa44-1f55d3ebba22',
				created_at: '2019-01-23T04:54:23.847Z',
				updated_at: '2019-01-23T04:54:23.847Z'
			},
			{
				app_id: '8b8c1ce9-d110-4c3f-939c-eabfe6e049e6',
				notification_id: 'f624ba60-1eca-11e9-92bc-67cc1689d5b9',
				user_id: 'ef2dda0c-580b-4a4b-bca8-6981adf5ddbe',
				data: {
					id: 'f40cd6e0-1eca-11e9-b9de-772b660317a0',
					conference_name: 'Dummy Conference',
					action: 'create',
					conference_type: '2',
					user_name: 'rudra1',
					user_id: 'f6620a16-fe4e-468b-bbc6-f00e63b5b2c9',
					notification_id: 'f624ba60-1eca-11e9-92bc-67cc1689d5b9'
				},
				from: 'f6620a16-fe4e-468b-bbc6-f00e63b5b2c9',
				notify_type: '9',
				is_acknowledge: false,
				is_seen: false,
				service: 'firebase',
				__v: 'f410a775-1eca-11e9-aa44-1f55d3ebba22',
				created_at: '2019-01-23T04:54:23.847Z',
				updated_at: '2019-01-23T04:54:23.847Z'
			},
			{
				app_id: '8b8c1ce9-d110-4c3f-939c-eabfe6e049e6',
				notification_id: 'f624ba60-1eca-11e9-92bc-67cc1689d5b9',
				user_id: 'ef2dda0c-580b-4a4b-bca8-6981adf5ddbe',
				data: {
					id: 'f40cd6e0-1eca-11e9-b9de-772b660317a0',
					conference_name: 'Dummy Conference',
					action: 'create',
					conference_type: '2',
					user_name: 'rudra1',
					user_id: 'f6620a16-fe4e-468b-bbc6-f00e63b5b2c9',
					notification_id: 'f624ba60-1eca-11e9-92bc-67cc1689d5b9'
				},
				from: 'f6620a16-fe4e-468b-bbc6-f00e63b5b2c9',
				notify_type: '9',
				is_acknowledge: false,
				is_seen: false,
				service: 'firebase',
				__v: 'f410a775-1eca-11e9-aa44-1f55d3ebba22',
				created_at: '2019-01-23T04:54:23.847Z',
				updated_at: '2019-01-23T04:54:23.847Z'
			},
			{
				app_id: '8b8c1ce9-d110-4c3f-939c-eabfe6e049e6',
				notification_id: '5956ead0-1e31-11e9-88b2-799c1ddf8f2b',
				user_id: '9f6aae65-00b4-4d8b-ab21-ebfb3b8ae331',
				data: {
					user_id: '5d8a87cb-e6ee-45e9-9fb5-74da5636c3fa',
					friends_user_id: '9f6aae65-00b4-4d8b-ab21-ebfb3b8ae331',
					friends_email: '',
					friends_first_name: '',
					friends_last_name: '',
					friends_username: 'rudra3',
					is_request_accept: false,
					user_name: 'rudrat',
					created_by: '5d8a87cb-e6ee-45e9-9fb5-74da5636c3fa',
					id: 'b9dcc595-6041-474f-8bf6-2814fed535bb',
					action: 'request_receive',
					notification_id: '5956ead0-1e31-11e9-88b2-799c1ddf8f2b'
				},
				from: '5d8a87cb-e6ee-45e9-9fb5-74da5636c3fa',
				notify_type: '8',
				is_acknowledge: true,
				is_seen: false,
				service: 'firebase',
				__v: '58f67b52-1e31-11e9-aa44-1f55d3ebba22',
				created_at: '2019-01-22T10:34:50.629Z',
				updated_at: '2019-01-22T10:34:50.629Z'
			},
			{
				app_id: '8b8c1ce9-d110-4c3f-939c-eabfe6e049e6',
				notification_id: '5956ead0-1e31-11e9-88b2-799c1ddf8f2b',
				user_id: '9f6aae65-00b4-4d8b-ab21-ebfb3b8ae331',
				data: {
					user_id: '5d8a87cb-e6ee-45e9-9fb5-74da5636c3fa',
					friends_user_id: '9f6aae65-00b4-4d8b-ab21-ebfb3b8ae331',
					friends_email: '',
					friends_first_name: '',
					friends_last_name: '',
					friends_username: 'rudra3',
					is_request_accept: false,
					user_name: 'rudrat',
					created_by: '5d8a87cb-e6ee-45e9-9fb5-74da5636c3fa',
					id: 'b9dcc595-6041-474f-8bf6-2814fed535bb',
					action: 'request_receive',
					notification_id: '5956ead0-1e31-11e9-88b2-799c1ddf8f2b'
				},
				from: '5d8a87cb-e6ee-45e9-9fb5-74da5636c3fa',
				notify_type: '8',
				is_acknowledge: true,
				is_seen: false,
				service: 'firebase',
				__v: '58f67b52-1e31-11e9-aa44-1f55d3ebba22',
				created_at: '2019-01-22T10:34:50.629Z',
				updated_at: '2019-01-22T10:34:50.629Z'
			},
			{
				app_id: '8b8c1ce9-d110-4c3f-939c-eabfe6e049e6',
				notification_id: '5956ead0-1e31-11e9-88b2-799c1ddf8f2b',
				user_id: '9f6aae65-00b4-4d8b-ab21-ebfb3b8ae331',
				data: {
					user_id: '5d8a87cb-e6ee-45e9-9fb5-74da5636c3fa',
					friends_user_id: '9f6aae65-00b4-4d8b-ab21-ebfb3b8ae331',
					friends_email: '',
					friends_first_name: '',
					friends_last_name: '',
					friends_username: 'rudra3',
					is_request_accept: false,
					user_name: 'rudrat',
					created_by: '5d8a87cb-e6ee-45e9-9fb5-74da5636c3fa',
					id: 'b9dcc595-6041-474f-8bf6-2814fed535bb',
					action: 'request_receive',
					notification_id: '5956ead0-1e31-11e9-88b2-799c1ddf8f2b'
				},
				from: '5d8a87cb-e6ee-45e9-9fb5-74da5636c3fa',
				notify_type: '8',
				is_acknowledge: false,
				is_seen: false,
				service: 'firebase',
				__v: '58f67b52-1e31-11e9-aa44-1f55d3ebba22',
				created_at: '2019-01-22T10:34:50.629Z',
				updated_at: '2019-01-22T10:34:50.629Z'
			},
			{
				app_id: '8b8c1ce9-d110-4c3f-939c-eabfe6e049e6',
				notification_id: '5956ead0-1e31-11e9-88b2-799c1ddf8f2b',
				user_id: '9f6aae65-00b4-4d8b-ab21-ebfb3b8ae331',
				data: {
					user_id: '5d8a87cb-e6ee-45e9-9fb5-74da5636c3fa',
					friends_user_id: '9f6aae65-00b4-4d8b-ab21-ebfb3b8ae331',
					friends_email: '',
					friends_first_name: '',
					friends_last_name: '',
					friends_username: 'rudra3',
					is_request_accept: false,
					user_name: 'rudrat',
					created_by: '5d8a87cb-e6ee-45e9-9fb5-74da5636c3fa',
					id: 'b9dcc595-6041-474f-8bf6-2814fed535bb',
					action: 'request_receive',
					notification_id: '5956ead0-1e31-11e9-88b2-799c1ddf8f2b'
				},
				from: '5d8a87cb-e6ee-45e9-9fb5-74da5636c3fa',
				notify_type: '8',
				is_acknowledge: false,
				is_seen: false,
				service: 'firebase',
				__v: '58f67b52-1e31-11e9-aa44-1f55d3ebba22',
				created_at: '2019-01-22T10:34:50.629Z',
				updated_at: '2019-01-22T10:34:50.629Z'
			}
		]
	}
};
