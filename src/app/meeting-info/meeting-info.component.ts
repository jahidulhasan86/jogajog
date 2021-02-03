import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NotificationService } from '../shared/services/notifications/notification.service';
import ClipboardJS from 'clipboard';
import { GlobalValue } from '../global';

@Component({
	selector: 'app-meeting-info',
	templateUrl: './meeting-info.component.html',
	styleUrls: ['./meeting-info.component.scss']
})
export class MeetingInfoComponent implements OnInit {
	public meetingInfo: any;
	globalValue: any;
	constructor(
		@Inject(MAT_DIALOG_DATA) public data: any,
		public dialogRef: MatDialogRef<MeetingInfoComponent>,
		private dialog: MatDialog,
		public notificationService: NotificationService
	) {
		this.globalValue = GlobalValue;
	}

	ngOnInit(): void {
		this.meetingInfo = this.data.meetingInfo;
		this.initCopyToClipBoard();
		console.log('meeting data', this.data.meetingInfo);
	}

	initCopyToClipBoard() {
		const self = this;
		const clipboard = new ClipboardJS('.copyClipboardIcon');

		clipboard.on('success', function (e) {
			// console.info('Action:', e.action);
			// console.info('Text:', e.text);
			// console.info('Trigger:', e.trigger);

			if (e.action === 'copy') {
				self.notificationService.globalNotificationShow((localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') == 'bn') ? 'ক্লিপবোর্ডে কপি করা হয়েছে' : 'Copied to clipboard');
			}

			e.clearSelection();
		});

		clipboard.on('error', function (e) {
			self.notificationService.globalNotificationShow((!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'ক্লিপবোর্ডে কপি করা যায়নি': 'Error from clipboard');
			// console.error('Action:', e.action);
			// console.error('Trigger:', e.trigger);
		});
	}
	closeDialog() {
		this.dialogRef.close();
	}
}
