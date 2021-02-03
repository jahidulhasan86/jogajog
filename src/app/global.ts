/*

 * Copyright (c) 2004-2020 by Protect Together Inc.

 * All Rights Reserved

 * Protect Together Inc Confidential

 */

/* 
 
Applicaiton configuration file.  
 
*/

'use strict';

//  const localizationType: string = 'en'; // Jagajag =====> https://jagajag.com/#/

const localizationType: string = 'bn'; // Jogajog ====> https://www.jogajog.com.bd/#/

 const isStaging = true

// const isStaging = false

const http = 'http://';

const https = 'https://';

const sheba_ServerDomain = !isStaging ? 'hub.sensor.buzz/' : 'api.jogajog.com.bd/';

const aws_ServerDomain = 'api.jagajag.com/';

const aws_bfcpServerDomain = 'bfcp.jagajag.com/';

const aws_chatServerDomain = 'ejabberd.jagajag.com/';

const media_report_ServerDomain = 'report.jagajag.com/';

const unzipper_ServerDomain = "bd.mediaserver.jagajag.com/unzipper/";

const serverUrl = localizationType === 'en' ? https + aws_ServerDomain : https + sheba_ServerDomain;

export const GlobalValue = {
	payment_api_url:
		localizationType === 'en' ? https + aws_ServerDomain + 'mediconnect/api/v1' : https + sheba_ServerDomain + 'mediconnect/api/v1',

	alert_skool_url:
		localizationType === 'en' ? https + aws_ServerDomain + 'alertskool/api/v1' : https + sheba_ServerDomain + 'alertskool/api/v1',

	tasktracker_Service_Url:
		localizationType === 'en' ? https + aws_ServerDomain + 'task-tracker/api/v1' : https + sheba_ServerDomain + 'task-tracker/api/v1',

	Recording_Service_Url:
		localizationType === 'en' ? https + aws_ServerDomain + 'media-reporter/api' : https + sheba_ServerDomain + 'media-reporter/api',

	alert_circel_Service_Url:
		localizationType === 'en' ? https + aws_ServerDomain + 'iuser/api/v1' : https + sheba_ServerDomain + 'iuser/api/v1',

	video_hub_Service_Url:
		localizationType === 'en' ? https + aws_ServerDomain + 'vsb/api/v1' : https + sheba_ServerDomain + 'vsb/api/v1',

	media_report_Service_Url:
		localizationType === 'en' ? https + media_report_ServerDomain + 'media-reporter/api/v1/' : !isStaging ? https + sheba_ServerDomain + 'media-reporter/api/v1' : 'https://report.jogajog.com.bd/media-reporter/api',

	notification_url:
		localizationType === 'en' ? https + aws_ServerDomain + 'notifier/api/v1' : https + sheba_ServerDomain + 'notifier/api/v1',

	profilePhotoUrl:
		localizationType === 'en' ? https + aws_ServerDomain : https + sheba_ServerDomain,

	chatServiceURL:
		localizationType === 'en' ? https + aws_ServerDomain + 'chat/api/v1' : '' + https + sheba_ServerDomain + 'chat/api/v1',

	chatwss:
		localizationType === 'en' ? 'wss://' + aws_chatServerDomain + 'chatserver/websocket/' : !isStaging ? 'wss://' + sheba_ServerDomain + 'chatserver/websocket/' : 'wss://ejabberd.jogajog.com.bd/chatserver/websocket/',

	geofenceServiceUrl:
		localizationType === 'en' ? https + aws_ServerDomain + 'geo-fence/api/v1' : https + sheba_ServerDomain + 'geo-fence/api/v1',

	locationGetUrl:
		localizationType === 'en' ? https + aws_ServerDomain + 'location/receiveLocationData' : https + sheba_ServerDomain + 'location/receiveLocationData',

	locationPostUrl:
		localizationType === 'en' ? https + aws_ServerDomain + 'location/saveLocationData' : https + sheba_ServerDomain + 'location/saveLocationData',

	vxmlServiceUrl:
		localizationType === 'en' ? 'http://52.221.3.83/api/v1' : 'https://dialengine.sensor.buzz/api/v1',

	broadcastMessage_BaseUrl:
		localizationType === 'en' ? https + aws_ServerDomain + 'broadcaster/api/v1' : https + sheba_ServerDomain + 'broadcaster/api/v1',

	airlineFlightList_Url:
		localizationType === 'en' ? 'https://aviation-edge.com/v2/public/timetable?key=a7eb2b-555949&iataCode=DOH' : 'https://aviation-edge.com/v2/public/timetable?key=a7eb2b-555949&iataCode=DOH',

	dialEngine_url:
		localizationType === 'en' ? 'dialengine.sensor.buzz' : 'dialengine.sensor.buzz',

	dialEngineSocket_url:
		localizationType === 'en' ? 'wss://dialengine.sensor.buzz:8082' : 'wss://dialengine.sensor.buzz:8082',

	jazzware_Service_Url:
		localizationType === 'en' ? 'http://192.168.102.233:3100/api/v1' : 'https://messageout.sensor.buzz/api/v1',

	floor_websocket_Url:
		localizationType === 'en' ? 'wss://' + aws_bfcpServerDomain + 'bfcp' : !isStaging ? 'wss://' + sheba_ServerDomain + 'bfcp' : 'wss://bfcp.jogajog.com.bd/bfcp',

	openvidu_server_Url:
		localizationType === 'en' ? 'https://bd.mediaserver.jagajag.com' : 'https://bd.mediaserver.jagajag.com',

	openvidu_server_secret:
		localizationType === 'en' ? 'SSB_2019' : 'SSB_2019',

	freeswitch_service_url:
		localizationType === 'en' ? https + aws_ServerDomain + 'freeswitch/api/v1' : https + sheba_ServerDomain + 'freeswitch/api/v1',

	unzipper_BaseUrl:
		https + unzipper_ServerDomain + "unzipper/",

	media_admin_websocket_Url:
		localizationType === 'en' ? 'wss://' + sheba_ServerDomain + 'bfcp-stage-admin' : 'wss://' + sheba_ServerDomain + 'bfcp-stage-admin',

	app_id:
		localizationType === 'en' ? '34033870-802c-4349-b8a6-d48212d7c507' : '34033870-802c-4349-b8a6-d48212d7c507',

	app_name:
		localizationType === 'en' ? 'Jagajag' : 'Jogajog',

	company_id:
		localizationType === 'en' ? '78430815-ddfc-415e-9c5c-d10185da8d77' : '5e146eab-3d84-421b-8748-e0563daf5c24', // Jagajag, Jogajog

	company_name:
		localizationType === 'en' ? 'Jagajag' : 'Jogajog',

	footer_text_display:
		localizationType === 'en' ? 'Protect Together Inc.' : 'Bengal Mobile QA Solution',

	app_name_display:
		localizationType === 'en' ? 'Jagajag' : 'Jogajog',

	title_name:
		localizationType === 'en' ? 'Jagajag' : 'Jogajog',

	app_logo:
		localizationType === 'en' ? 'assets/images/logoEn.png' : 'assets/images/logoBn.png',

	host:
		localizationType === 'en' ? 'airconnect.sensor.buzz' : 'airconnect.sensor.buzz',

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

	bfcp_floor_limit_normalMode: 50,

	bfcp_floor_limit_ptvMode: 2,

	bfcp_default_floor_limit_forCreateFloor: 8, // limit_granted_floor

	bfcp_default_maximum_particepents: 8,

	ptv_mode_requestFloor_timer: 60, // in seconds

	android_app_play_store_link:
		localizationType === 'en' ? 'https://play.google.com/store/apps/details?id=com.protect2gether.jagajag' : 'https://play.google.com/store/apps/details?id=com.protect2gether.jogajog',

	currentBuild: localizationType
};

export let online_status_display = {
	online: 'Available',
	away: 'Away',
	busy: 'Do not disturb',
	invisible: 'Invisible'
};

export let online_status_xmpp = {
	online: 'chat',
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

// all are Aspect Ratio = 4:3
export let video_resulation = {
	'240p': {
		resulation: '352 x 240',
		frameRate: 24
	},
	'360p': {
		resulation: '480 x 360',
		frameRate: 24
	},
	'480p': {
		resulation: '640 x 480',
		frameRate: 24
	},
	'720p': {
		resulation: '1280 x 720',
		frameRate: 30
	},
	'1080p': {
		resulation: '1920 x 1080',
		frameRate: 30
	},
	'2160p': {
		resulation: '3860 x 2160',
		frameRate: 30
	}
};
