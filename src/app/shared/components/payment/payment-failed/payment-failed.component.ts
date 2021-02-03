import { Component, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-failed',
  templateUrl: './payment-failed.component.html',
  styleUrls: ['./payment-failed.component.scss']
})
export class PaymentFailedComponent implements OnInit {

  constructor(public dialog: MatDialog) { }

  ngOnInit(): void {
	 this.paymentFailedDialog('');
  }

  paymentFailedDialog(data) {
		const dialogRef = this.dialog.open(PaymentFailedDialogComponent, {
			disableClose: true,
			width: '50%',
			data: {
				destinationRoute: data
			}
		});
	}

}

@Component({
  templateUrl: './modal-payment-failed.html',
})
export class PaymentFailedDialogComponent implements OnInit {
  constructor(public dialogRef: MatDialogRef<PaymentFailedDialogComponent>, private router: Router) {

  }
  ngOnInit(): void {
  }
  closeDialog(): void {
    this.dialogRef.close();
    this.router.navigate(['/dashboard/home']);
  }
}