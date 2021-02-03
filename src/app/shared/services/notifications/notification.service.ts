import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar } from '@angular/material/snack-bar';

@Injectable({
	providedIn: 'root'
})
export class NotificationService {
	constructor(private snackBar: MatSnackBar) {}

	newMessage(nickname: string, callback?) {
		const alert = this.launchNotification(nickname + ' sent a message', 'OPEN', 'messageSnackbar', 3000);
		alert.onAction().subscribe(() => {
			callback();
		});
	}

	xamppNewMessage(nickname: string, callback?) {
		const alert = this.launchNotification(nickname + ' sent a message', '', 'messageSnackbar', 1500);
		alert.onAction().subscribe(() => {
			callback();
		});
	}

	globalNotificationShow(message: string, duration?, callback?) {
		if (!duration) {
			duration = 2000;
		}
		const alert = this.launchNotification(message, 'Ok', 'messageSnackbar', duration);
		alert.onAction().subscribe(() => {
			callback();
		});
	}
	private launchNotification(message: string, action: string, className: string, durationTimeMs: number): MatSnackBarRef<SimpleSnackBar> {
		return this.snackBar.open(message, action, {
			duration: durationTimeMs,
			verticalPosition: 'top',
			horizontalPosition: 'end',
			panelClass: className
		});
	}
}
