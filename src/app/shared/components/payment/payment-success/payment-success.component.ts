import { Component, OnInit, Inject } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.component.html',
  styleUrls: ['./payment-success.component.scss']
})
export class PaymentSuccessComponent implements OnInit {
  private dialogRef: MatDialogRef<PaymentSuccessDialogComponent, any>;
  constructor(public dialog: MatDialog, private router: Router) { }

  ngOnInit(): void {
    this.paymentSuccessDialog('');
  }

  paymentSuccessDialog(data) {
    const dialogRef = this.dialog.open(PaymentSuccessDialogComponent, {
      disableClose: true,
      width: '50%',
      data: {
        destinationRoute: data
      }
    });
  }

}

@Component({
  templateUrl: './modal-payment-success.html',
})
export class PaymentSuccessDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PaymentSuccessDialogComponent>, private router: Router) {

  }
  ngOnInit(): void {

  }
  closeDialog(): void {
    this.dialogRef.close();
    this.router.navigate(['/dashboard/home']);
  }
}
