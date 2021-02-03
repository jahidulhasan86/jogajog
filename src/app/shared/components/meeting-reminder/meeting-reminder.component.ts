import { Component, OnInit, Inject } from '@angular/core';
import { GlobalValue } from '../../../global';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MeetingService } from '../../services/meeting/meeting.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-meeting-reminder',
  templateUrl: './meeting-reminder.component.html',
  styleUrls: ['./meeting-reminder.component.scss']
})
export class MeetingReminderComponent implements OnInit {
  emails = []
  submittedData = []
  globalValue: any;
  selectAll = false;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any, public dialogRef: MatDialogRef<MeetingReminderComponent>, private dialog: MatDialog, private meetingService: MeetingService) {
    this.globalValue = GlobalValue;
  }

  ngOnInit(): void {
    this.emails = this.data
    console.log(this.emails)
  }

  closeDialog() {
    this.dialogRef.close()
  }

  OnChange(checked, data) {
    let index = this.submittedData.indexOf(data);
    if (index === -1) {
      this.submittedData.push(data)
    } else {
      this.submittedData.splice(index, 1)
    }

    if (this.submittedData.length == this.emails.length) this.selectAll = true
    else this.selectAll = false
    console.log(data, this.submittedData)
  }

  updateCheck() {
    if (this.selectAll === true) {
      this.emails.map((email) => {
        email.checked = true;
        let index = this.submittedData.indexOf(email);
        if (index === -1) {
          this.submittedData.push(email)
        }
      });
    } else {
      this.emails.map((email) => {
        email.checked = false;
      });
      this.submittedData = []
    }
    console.log(this.submittedData)
  }

  notify() {
    let users = []
    this.submittedData.forEach((x) => {
      if(!!x){
        delete x.user_name
        delete x.checked
        users.push(x)
      }
    })
    this.meetingService.notify(users).subscribe((result) => {
      if (result) {
        console.log(result)
        Swal.fire({
          title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'সফলভাবে রিমাইন্ডার পাঠানো হয়েছে' : 'Reminder send successfully',
          icon: 'success',
          padding: '1em',
          timer: 2000,
        });
        this.closeDialog()
      }
    }, err => {
      console.log(err)
    })
  }

  message(){
		Swal.fire({
			title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'অনুগ্রহপূর্বক ইমেইল বাছাই করুন' : 'Please select email',
			icon: 'info',
			padding: '1em',
			timer: 2000,
		});
	}
}
