import { Component, OnInit, Input, SimpleChanges, EventEmitter, Output } from '@angular/core';
import { MultiCompanyService } from 'src/app/shared/services/multi-company/multi-company.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-company-invitation-list',
  templateUrl: './company-invitation-list.component.html',
  styleUrls: ['./company-invitation-list.component.scss']
})
export class CompanyInvitationListComponent implements OnInit {

  @Input() notificationsList: any
  @Output() cInvAcceptedEEmitter = new EventEmitter<any>();
  notifications = []
  constructor(private multicompanyService: MultiCompanyService) { }
  ngOnChanges(changes: SimpleChanges) {
    this.notifications = changes.notificationsList.currentValue
  }
  ngOnInit(): void {
  }
  acceptCompanyInvitation(companyInvitation) {
    console.log("companyInvite",companyInvitation)
    this.multicompanyService.acceptCompanyInvitation(companyInvitation).subscribe((result) => {
      if (result.status == 'ok') {
        console.log('companyInvitResult',result)
        for (let i = 0; i < this.notifications.length; i++) {
          if (this.notifications[i].notify_type_id === companyInvitation.notify_type_id) {
            this.notifications.splice(i, 1)
          }
        }
        this.cInvAcceptedEEmitter.emit(true)
        this.errorSuccessMsgHandler(result,companyInvitation)
      }
    }, err => {
      console.log(err)
      this.errorSuccessMsgHandler(err,companyInvitation)
    })
  }
  declineCompanyInvitation(companyInvitation) {
    this.multicompanyService.declineCompanyInvitation(companyInvitation).subscribe((result) => {
      if (result.status == 'ok') {
        console.log(result)
      }
    }, err => {
      console.log(err)
      this.errorSuccessMsgHandler(err,companyInvitation)
    })
  }
  errorSuccessMsgHandler(result,companyInvitation) {
    if (result.status == 'ok') {
      Swal.fire({
        icon: 'success',
        text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? companyInvitation.data.company_name  +' কোম্পানিতে আমন্ত্রণ গৃহীত হয়েছে' : 'Invitation Accepted to join ' + companyInvitation.data.company_name ,
        timer: 2000
      });
    } else {
      Swal.fire({
        icon: 'warning',
        text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'আমন্ত্রণ গ্রহণ করা হয়নি' : 'Failed to accept invitation',
        timer: 2000
      });
    }
  }
}
