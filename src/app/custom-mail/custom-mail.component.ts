import { Component, OnInit, Inject } from '@angular/core';
import { GlobalValue } from '../global';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-custom-mail',
  templateUrl: './custom-mail.component.html',
  styleUrls: ['./custom-mail.component.scss']
})
export class CustomMailComponent implements OnInit {
  globalValue: any;
  constructor(public dialogRef: MatDialogRef<CustomMailComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private router: Router) {
    this.globalValue = GlobalValue
  }

  ngOnInit(): void {
    this.data.mmodel.isPreviewMode = false;
    this.data.mmodel.cancelButtonText = (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'আমন্ত্রন বাতিল করুন' : 'Cancel Invitation'
    $('.hideInPreview').css('display', 'block');
    const target = document.getElementById('invitationText');
    const self = this;
    document.addEventListener('input', function (event) {
      const targetArea: any = event;
      if (targetArea.target.nodeName.toLowerCase() !== 'textarea') { return; }
      self._handleTextAreaSize(event.target);
    }, false);
  }

  closeDialog(): void {
    const pData = this.data.parent;
    this.data.mmodel.isCustomMessage = false;
    this.dialogRef.close();
    this.dialogRef.afterClosed().subscribe(result => {
      $('#cCheck').prop('checked', false);
      this.data.mmodel.parent.closeDialog();
      this.data.mmodel.parent.router.navigate(['/dashboard/home']);
    });
  }

  showMessagePreview() {
    this.data.mmodel.isPreviewMode = true;
    const customMessage = $('#invitationText').val();
    this.data.mmodel.customMessageText = customMessage === '' ? this.data.mmodel.messageTitle : customMessage;
    $('.closePreview').css('display', 'block');
    $('.hideInPreview').css('display', 'none');
  }
  closeMessagePreview() {
    this.data.mmodel.isPreviewMode = false;
    this.data.mmodel.isCustomMessage = false;
    $('.closePreview').css('display', 'none');
    $('.hideInPreview').css('display', 'block');
  }
  closeOnDialogSubmit() {
    const customMessage = $('#invitationText').val().toString().trim();
    const emailAddresses = $('#inviteeMail').val().toString().trim();
    this.data.mmodel.parent.inviteMeetingModel.email_list = emailAddresses;
    if (customMessage === '' && emailAddresses) {
      Swal.fire({
        text: 'Are you sure to send invitation without custom message?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes',
        cancelButtonText: 'No'
      }).then((result) => {
        if (result.value) {
          this.data.mmodel.parent.inviteMeetingModel.hasCustomMessage = false;
          this.data.mmodel.parent.inviteMeetingModel.customMessageText = this.data.mmodel.messageTitle;
          this.inviteMeeting();
          // this.dialogRef.close();
        }
      });
    } else if (emailAddresses === '') {
      Swal.fire({
        icon: 'info',
        title: 'Enter email address to send.',
        timer: 3000
      });
      return;
    } else {
      this.data.mmodel.parent.inviteMeetingModel.hasCustomMessage = true;
      this.data.mmodel.parent.inviteMeetingModel.customMessageText = customMessage;
      this.inviteMeeting();
      // this.dialogRef.close();
    }
  }

  copyLink() {
    const copyText = document.getElementById('meetingURL') as HTMLInputElement;
    copyText.select();
    copyText.setSelectionRange(0, 99999);
    document.execCommand('copy');
    this.data.mmodel.notificationService.globalNotificationShow((localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'মিটিং এর লিঙ্ক কপি করা হয়েছে ' : 'Copied Meeting URL');
  }

  inviteMeeting() {
    this.data.mmodel.meetingService.inviteMeeting(this.data.mmodel.parent.inviteMeetingModel).subscribe(
      (result) => {
        if (result.status == 'ok') {
          this.data.mmodel.parent.inviteMeetingModel.email_list = '';
          this.data.mmodel.meetingService.count = 1;
          this.data.mmodel.cancelButtonText = 'Done';
          Swal.fire({
            icon: 'success',
            title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'অংশগ্রহণকারীদের ইমেইল ঠিকানায় আমন্ত্রণ সফলভাবে পাঠান হয়েছে' : 'Invitation successfully sent to participants email',
            timer: 3000
          });
        }
      },
      (err) => {
        console.log(err);
        this.data.mmodel.parent.meetingErrorHandler(err);
      }
    );
  }

  _handleTextAreaSize(field) {
    field.style.height = 'inherit';
    var computed = window.getComputedStyle(field);
    var height = parseInt(computed.getPropertyValue('border-top-width'), 10)
      + parseInt(computed.getPropertyValue('padding-top'), 10)
      + field.scrollHeight
      + parseInt(computed.getPropertyValue('padding-bottom'), 10)
      + parseInt(computed.getPropertyValue('border-bottom-width'), 10);
    field.style.height = height + 'px';
  }

}
