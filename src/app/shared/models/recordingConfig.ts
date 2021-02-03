/*

 * Copyright (c) 2004-2020 by Protect Together, Inc.

 * All Rights Reserved

 * Protect Together Confidential

 */
export class RecordingConfigModel {
	protected session: string;
	protected name: string;
	protected outputMode: string;
	protected hasAudio: boolean;
	protected hasVideo: boolean;
	protected recordingId: string;

	constructor(outputMode? : string, hasAudio? : boolean, hasVideo? : boolean) {
		this.outputMode = outputMode || "INDIVIDUAL";
		this.hasAudio = hasAudio || true;
		this.hasVideo =hasVideo || true;
	}

	public getSessionId(): string {
		return this.session;
	}

	public getName(): string {
		return this.name;
	}

	public getOutputMode(): string {
		return this.outputMode;
	}

	public gethasAudio(): boolean {
		return this.hasAudio;
	}

	public gethasVideo(): boolean {
		return this.hasVideo;
	}

	public getrecordingId(): string {
		return this.recordingId;
	}

	public setSession(sessionId: string) {
		return this.session = sessionId;
	}
	public setName(name: string) {
		return this.name = name;
	}
	public setOutputMode(outputMode: string) {
		return this.outputMode = outputMode;
	}
	public setHasAudio(hasAudio: boolean) {
		return this.hasAudio = hasAudio;
	}
	public setHasVideo(hasVideo: boolean) {
		return this.hasVideo = hasVideo;
	}
	
	public setRecordingId(recordingId: string) {
		return this.recordingId = recordingId;
	}
}