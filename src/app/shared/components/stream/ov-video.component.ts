import { Component, Input, ViewChild, ElementRef, AfterViewInit, Output, EventEmitter } from '@angular/core';
import { StreamManager } from 'openvidu-browser';
import { VideoType } from '../../types/video-type';

@Component({
	selector: 'ov-video',
	template: `
		<video
			class="videoOn"
			[style.display]="_streamManager?.stream?.videoActive ? 'block' : 'none'"
			#videoElement
			[attr.id]="streamManager && _streamManager.stream ? 'video-' + _streamManager.stream.streamId : 'video-undefined'"
			[muted]="mutedSound"
		></video>
		<video
			class="videoOff"
			[style.display]="!_streamManager?.stream?.videoActive ? 'block' : 'none'"
			[style.height]="itsCallFromRoomConfig ? 'fit-content' : '100%'"
			[style.object-fit]="itsCallFromRoomConfig ? 'contain' : !_streamManager?.remote ? 'none' : _streamManager?.stream?.connection?.is_stream_available ? 'none' : 'contain'"
			[style.border]="itsCallFromRoomConfig ? 'none' : '2px solid #f4c91f'"
			[style.background]="itsCallFromRoomConfig ? 'black' : 'none'"
			[poster]="itsCallFromRoomConfig ? '' : !_streamManager?.remote ? '../../../../assets/images/noVideoUser.png' : _streamManager?.stream?.connection?.is_stream_available ? '../../../../assets/images/noVideoUser.png' : '../../../../assets/images/Internet-distruption.png'"
		></video>
	`,
	styleUrls: ['./stream.component.css']
})
export class OpenViduVideoComponent implements AfterViewInit {
	@Input() mutedSound: boolean;
	@Input() itsCallFromRoomConfig: boolean;
	@Output() toggleVideoSizeEvent = new EventEmitter<any>();

	_streamManager: StreamManager;

	_videoElement: ElementRef;

	ngAfterViewInit() {
		setTimeout(() => {
			if (this._streamManager && this._videoElement) {
				this._streamManager.addVideoElement(this._videoElement.nativeElement);
			}
		});
	}

	@ViewChild('videoElement')
	set videoElement(element: ElementRef) {
		this._videoElement = element;
	}

	@Input()
	set streamManager(streamManager: StreamManager) {
		setTimeout(() => {
			this._streamManager = streamManager;
			if (!!this._videoElement && this._streamManager) {
				if (this._streamManager.stream.typeOfVideo === VideoType.SCREEN) {
					this._videoElement.nativeElement.style.objectFit = 'contain';
					this._videoElement.nativeElement.style.background = '#272727';
					this.enableVideoSizeBig();
				} else {
					this._videoElement.nativeElement.style.objectFit = 'cover';
				}
				this._streamManager.addVideoElement(this._videoElement.nativeElement);
			}
		});
	}

	enableVideoSizeBig() {
		// Doing video size bigger.
		// Timeout because of connectionId is null and icon does not change
		setTimeout(() => {
			this.toggleVideoSizeEvent.emit(true);
		}, 590);
	}
}