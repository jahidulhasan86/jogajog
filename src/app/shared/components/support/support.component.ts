import { Component, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { PaymentCoreService } from '../../services/payment/payment-core.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-support',
  templateUrl: './support.component.html',
  styleUrls: []
})
export class SupportComponent implements OnInit {

  constructor(public dialog: MatDialog, private paymentService: PaymentCoreService, private router: Router) { }

  ngOnInit(): void {
  }

  procedPayment() {
    const overlapping = false;
    const model = {
      appointment_id: '54ea4b59-64c2-4215-8a8e-f187a18d7cb3'
    };
    this.paymentService.processPayment(model, overlapping).subscribe((result) => {
      if (result.status === 'ok') {
              window.location.href = result.result.gatewayURL;
        }
    }, (err) => {
          console.log(err);
          if (err.error.code = 404) {
    
          }
        }
        );
  }
}
