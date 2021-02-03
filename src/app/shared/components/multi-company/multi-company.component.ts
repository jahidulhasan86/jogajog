import { Component, OnInit, Inject } from '@angular/core';
import { MultiCompanyService } from '../../services/multi-company/multi-company.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { GlobalValue } from '../../../global';
import { MeetingService } from '../../services/meeting/meeting.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-multi-company',
  templateUrl: './multi-company.component.html',
  styleUrls: ['./multi-company.component.scss']
})
export class MultiCompanyComponent implements OnInit {
  companies: any;
  selectedValue: string = JSON.parse(localStorage.getItem('sessionUser')).company_id;
  globalValue: any;
  company_name: any;

  constructor(public dialogRef: MatDialogRef<MultiCompanyComponent>, private multicompanyService: MultiCompanyService, private meetingService: MeetingService, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.globalValue = GlobalValue
    this.companies = this.data
  }

  ngOnInit(): void {
    this.multicompanyService.getCompanyInformation().subscribe((result) => {
      if (!!result) {
        this.company_name = result.company_name
      }
    })
  }

  switchCompany() {
    this.multicompanyService.saveUserSession(this.selectedValue).subscribe((result) => {
      if (result.status == 'ok') {
        console.log(result)
        this.getCompanyInfo(result.result.company_id)
        this.getNotifications()
        this.getUpcommingMeetingList()
       setTimeout(() => {
        this.closeDialog()
        this.errorSuccessMsgHandler(result)
       }, 500);
      }
    }, err => {
      console.log(err)
      this.errorSuccessMsgHandler(err)
    })
  }

  closeDialog() {
    this.dialogRef.close()
  }

  getCompanyInfo(id) {
    this.multicompanyService.getCompanyInfo(id).subscribe((result) => {
      if (result.status == 'ok') {
        console.log(result)
        this.company_name = result.result.company_name
      }
    }, err => {
      console.log(err)
    })
  }

  getNotifications() {
		this.multicompanyService.getNotifications().subscribe((result) => {
			if (result.status == 'ok') {
				console.log(result)
			}
		}, err => {
			console.log(err)
		})
	}

  getUpcommingMeetingList() {
    const days = '10';
    this.meetingService.getUpcomingMeetingInfoForMe(days).subscribe(
      (result) => {
        if (result.status === 'ok') {
          console.log('upcoming meeting', result);
        } else {
        }
      },
      (err) => {
        console.log('error upcoming meeting', err);
        this.meetingService.getUpcomingMeetingList$.next([]);
      }
    );
  }

  errorSuccessMsgHandler(result) {
    if (result.status == 'ok') {
      Swal.fire({
        icon: 'success',
        text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'সফলভাবে '+ this.company_name + ' তে কোম্পানি পরিবর্তন হয়েছে' : 'Company switched successfully to '+ this.company_name,
        timer: 2000
      });
    } else {
      Swal.fire({
        icon: 'warning',
        text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কোম্পানি পরিবর্তন ব্যর্থ হয়েছে' : 'Failed to switch company', 
        timer: 2000
      });
    }
  }
}


