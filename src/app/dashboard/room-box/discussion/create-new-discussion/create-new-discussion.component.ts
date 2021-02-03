import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialogRef } from '@angular/material/dialog';

import {DiscussionService} from '../../../../shared/services/discussion/discussion.service'
import { XmppChatService } from '../../../../shared/services/xmpp-chat/xmpp-chat.service';
import { GlobalValue } from '../../../../global'
import { AccountService } from 'src/app/shared/services/account/account.service';
import { RoomBoxService } from 'src/app/shared/services/room-box/room-box.service';


@Component({
  selector: 'app-create-new-discussion',
  templateUrl: './create-new-discussion.component.html',
  styleUrls: ['./create-new-discussion.component.scss']
})
export class CreateNewDiscussionDialogComponent implements OnInit {
  @Input() data;
  discussionId : number; 
  discussion = {
    id: null,
    message_body: null,
    room_id:null,
    room_name: null,
    status: null,
    subject: null,
    type: null,
    email : null,
    discussion_type : 'thread',
    users: []
  } 
  globalValue: any;
  bnEnLanguageCheck: any;

  constructor(
       private discussionService: DiscussionService, private spinner: NgxSpinnerService,
       public dialogRef: MatDialogRef<CreateNewDiscussionDialogComponent>,
       private xmppChatService: XmppChatService,
       private accountService: AccountService,
       private roomBoxService: RoomBoxService
		
  ) {
     
    }
  

  ngOnInit() {
    console.log('CreateNewDiscussionDialogComponent');
    this.globalValue = GlobalValue;
		this.accountService.getLanguage().subscribe((result) => {
			this.bnEnLanguageCheck = result;
    });
    this.roomBoxService.roomUsersObserver.subscribe(x=>{
      this.discussion.users =x; 
    })
  }

  create()
  {
    if(!this.discussion.message_body || this.discussion.message_body == '' || !this.discussion.subject || this.discussion.subject == '')
      {
        Swal.fire({
        icon: 'error',
        title: 'No data is found in Thread Title or in Description.',
        timer: 3000,
        showConfirmButton: false
      });
      return
    }

    this.spinner.show()
    if(this.discussion.email)
    {
      this.discussion.discussion_type = 'email'
      //this.discussion.users = []
       /* let emails = this.discussion.email.split(',')
       emails.forEach(e=>{
        this.discussion.users.push({
          email : e
        })
       }) */
    }
    this.discussion.room_id = this.xmppChatService.selectedGroup.id
    this.discussion.room_name = this.xmppChatService.selectedGroup.conference_name
    

    this.discussionService.addNewDiscussion(this.discussion)
      .subscribe(x=>{
        console.log('addNewDiscussion response')
        console.log(x)
        if(x.result)
        {
          if(this.file_names != '') this.saveAttachments(x.result)
          this.closeDialog()
          this.discussionService.getByRoomId(x.result.room_id).subscribe()         
        }
        else{
          Swal.fire({            
            icon: 'error',
            title: 'Thread is not saved. Please try again.',
            showConfirmButton: false
          });
        }
        this.spinner.hide()    
      })

      this.spinner.hide()
    
  }
  saveAttachments(model)
  {
    for (let i = 0; i < this.filesArray.length; i++) {
      
      this.xmppChatService.audioVideoUpload(this.filesArray[i], this.filesArray[i].fileUploadIdentifiedId, null, 
            {resource_id : model.id, resource_type : 'discussion', reference_id : model.room_id, reference_type : 'room'})
            .subscribe(result => {
              if (result.status != 'ok') {
                Swal.fire({
                  title: 'Error in ' + this.filesArray[i].name + ': ' + result.message.en,
                  icon: 'error'
                });
                
              }
            }, err => {
              console.log("from new upload method", err)             
              
              Swal.fire({
                title: "Uploading failed, Please try again",
                icon: 'error'
              });
            })
      }
  }

	closeDialog() {
		this.dialogRef.close();
  }
  
  reset()
  {
    Object.keys(this.discussion).forEach(key => this.discussion[key] = null);
    this.discussion.users = []
    this.discussion.discussion_type = 'thread'    
    this.filesArray = []
    this.file_names = ''
  }
  
  
  uploadProgress = false;
  filesArray = []
  file_names = ''

  @Output() onChange: EventEmitter<File> = new EventEmitter<File>()

  addFile()
  {
    document.getElementById('file_picker_shared').click()
  }
  getFiles(e) {
    
    this.filesArray = e.target.files;
    if (this.filesArray.length > 0) {
      this.file_names = ''

      for (let i = 0; i < this.filesArray.length; i++) {
        this.file_names += this.filesArray[i].name + '; '
        this.uploadProgress = true;
        var fileType = this.filesArray[i].type.substring(0, this.filesArray[i].type.indexOf("/"));
        var fileUploadIdentifiedId;
        if (fileType == 'application') {
          fileType = 'file'
        }
      if(!fileType) {
        Swal.fire({
          title: "Please select only supported files.",
          icon: 'warning'
        });
        return;
      }
        // =================================

        var randomId = Math.floor(Math.random() * 100)
        fileUploadIdentifiedId =  'randomId_' + this.filesArray[i].lastModified + randomId;
        this.filesArray[i].fileUploadIdentifiedId = fileUploadIdentifiedId;        

        let reader = new FileReader;
        reader.onload = (e: any) => {
          var timestamp = new Date().getTime();
          var d = new Date(timestamp);          
          this.onChange.emit(this.filesArray[i]);          
        };
        reader.readAsDataURL(this.filesArray[i]);

      }
    }
  }

}

