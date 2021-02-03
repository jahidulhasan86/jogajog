import { Component, EventEmitter, Input, Output, OnInit, AfterContentInit, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core';
//import { Component, EventEmitter, Input, Output, OnInit, ViewEncapsulation } from '@angular/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { Discussion } from '../discussion.component';
import { DicussionDetails } from '../discussion.component';
// import { Comment, User, UserService } from '../core';
import { DiscussionService } from '../../../../shared/services/discussion/discussion.service';
import { XmppChatService } from '../../../../shared/services/xmpp-chat/xmpp-chat.service';
import Swal from 'sweetalert2';
import { resetFakeAsyncZone } from '@angular/core/testing';
const constDownloadFile = require('../../../../../assets/images//Download.png').default;
import { saveAs } from 'file-saver';
import { MessagingService } from '../../../../shared/services/messaging/messaging.service';

@Component({
    selector: 'app-discussion-details',
    templateUrl: './discussion.details.component.html',
    styleUrls: ['./discussion.details.component.scss'],
    // encapsulation : ViewEncapsulation.Native
})
export class DiscussionDetailsComponent implements OnInit {
    @Input() id;

    discussions: any;
    @Input() index;
    discussionId: number;
    //discussionId: number;
    formattedText: string;
    currentIndex: any;
    nextIndex: any;
    previousIndex: any;
    discussion: Discussion;
    comment: DicussionDetails;
    selectedDiscussion: any;
    replyModel: string;
    attachment = false;
    totalFiles: string;
    downloadFile: any;
    @Output() dataSend = new EventEmitter<any>();
    

    constructor(
        private discussionService: DiscussionService,
        private xmppChatService: XmppChatService,
        private spinner: NgxSpinnerService,
        public messagingService: MessagingService

    ) {
	
        this.downloadFile = constDownloadFile;
    }
   

    ngOnInit() {
        this.replyModel = '';
        this.discussionService.isDiscussionDetailsSelectedObserver.subscribe(x => {

        });
        this.discussionService.selectedDiscussionObserver.subscribe(x => {
            x.message_body = x.message_body.replace(/(\r\n|\n)/g, '<br/>'),
                this.selectedDiscussion = x;
            this.selectedDiscussion.reply = [];
            this.getDiscussionByRootDiscussionId(true);
            console.log('selected discussion: ' + x);
        });

        this.discussionService.discussionsObserver.subscribe(x => {
            this.discussions = x;

        });

        this.discussionService.currentIndexObserver.subscribe(x => {
            this.currentIndex = x;

        });

        this.messagingService.currentMessageCast.subscribe((result) => {
			if (!!result) {
				this.pushNotification(result)
			}
		})
    }


   
    pushNotification(result) {
		let payload = result.data.payload ? JSON.parse(result.data.payload) : null
		if (result.data.type == 'discussion') {
			this.getDiscussionByRootDiscussionId(true);
                
		} 
	}

    reply_model = {
        subject: null,
        users: null,
        message_body: null,
        parent_id: null,
        root_discussion_id: null

    };

    goToNext() {
        this.currentIndex = this.currentIndex + 1;
        if (this.currentIndex == this.discussions.length - 1) return;
        this.selectedDiscussion = this.discussions[this.currentIndex];
        this.getDiscussionByRootDiscussionId(true);
    }
    goToPrev() {
        if (this.currentIndex == 0) return;
        this.currentIndex = this.currentIndex - 1;
        this.selectedDiscussion = this.discussions[this.currentIndex];
        this.getDiscussionByRootDiscussionId(true);

    }

    addComment() {
        if (!this.reply_model.message_body || this.reply_model.message_body == '')
            return

        this.reply_model.subject = this.selectedDiscussion.subject,
            this.reply_model.users = this.selectedDiscussion.users,

            this.reply_model.parent_id = this.selectedDiscussion.root_discussion_id,
            this.reply_model.root_discussion_id = this.selectedDiscussion.root_discussion_id


        console.log('add comment')
        console.log(this.reply_model);
        $('#dashboardSideBar').css('z-index', '0');
        this.spinner.show();
        this.discussionService.addReply(this.reply_model)
            .subscribe(x => {
                console.log('reply response')
                console.log(x)
                if (x.result) {
                    this.spinner.hide();
                    $('#dashboardSideBar').css('z-index', '1000');
                    if (this.filesArray.length > 0) {
                        if (this.file_names !== '') { this.saveAttachments(x.result); }
                        this.reply_model.message_body = '';
                        this.reset();
                    } else {
                        this.selectedDiscussion.reply.push(x.result);
                        this.reply_model.message_body = '';
                        this.reset();
                    }


                }
                else {
                    this.spinner.hide();
                    $('#dashboardSideBar').css('z-index', '1000');
                    Swal.fire({
                        icon: 'error',
                        title: 'Reply cannot send. Please try again.',
                        showConfirmButton: false
                    });
                }
            })
    }

    reset() {
        Object.keys(this.reply_model).forEach(key => this.reply_model[key] = null);
        this.filesArray = []
        this.file_names = ''

    }

    refreshComment(e){
       if(e){
           this.getDiscussionByRootDiscussionId(e)
       }
    }
    getDiscussionByRootDiscussionId(showLoader) {
        if (showLoader) {
            $('#dashboardSideBar').css('z-index', '0');
            this.spinner.show();
        }
        this.discussionService.getByRootDiscussionId(this.selectedDiscussion.root_discussion_id).subscribe((result) => {
            this.spinner.hide();
            console.log('getallcommentsbyrootid',result)
            $('#dashboardSideBar').css('z-index', '1000');
            this.selectedDiscussion.reply = [];
            if (result.result && result.result.children) {
                result.result.children.filter(x => {
                    return x.message_body.replace(/(\r\n|\n)/g, '<br/>');
                });
                // result.result.children = result.result.children.replace(/(\r\n|\n)/g, '<br/>');
                this.selectedDiscussion.reply = result.result.children;
             
            }
            if (result.result) {
                if (result.result.files && result.result.files.length > 0) {
                    this.attachment = true;
                    this.selectedDiscussion.files = result.result.files;
                    this.totalFiles = this.selectedDiscussion.files.length; + ' ' + 'attachments';
                    this.selectedDiscussion.files.forEach(element => {
                        if (element.originalname.length < 21) {
                            element.partialName = element.originalname;
                        } else {
                            let partialName = this.showPartialText(element.originalname, 21, '..');
                            element.partialName = partialName;
                        }

                    });
                }
            }



        });

    }

  editDiscussion(discussion){

  }

  deleteDiscussion(discussion)
{

}
    showPartialText(str, length, ending) {
        if (length === null) {
            length = 15;
        }
        if (ending === null) {
            ending = '..';
        }
        if (str.length > length) {
            return str.substring(0, length - ending.length) + ending;
        } else {
            return str;
        }
    }

    _backtoDiscussionList() {
        this.discussionService.isDiscussionDetailsSelected$.next(false);
        this.dataSend.emit(true);
    }
    saveAttachments(model) {
        for (let i = 0; i < this.filesArray.length; i++) {

            this.xmppChatService.audioVideoUpload(this.filesArray[i], this.filesArray[i].fileUploadIdentifiedId, null,
                { resource_id: model.id, resource_type: 'discussion', reference_id: this.xmppChatService.selectedGroup.id, reference_type: 'room' })
                .subscribe(result => {
                    if (result.status != 'ok') {
                        Swal.fire({
                            title: 'Error in ' + this.filesArray[i].name + ': ' + result.message.en,
                            icon: 'error'
                        });

                    } else {
                        this.getDiscussionByRootDiscussionId(false);
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


    uploadProgress = false;
    filesArray = []
    file_names = ''

    @Output() onChange: EventEmitter<File> = new EventEmitter<File>()

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
                if (!fileType) {
                    Swal.fire({
                        title: "Please select only supported files.",
                        icon: 'warning'
                    });
                    return;
                }
                // =================================

                var randomId = Math.floor(Math.random() * 100)
                fileUploadIdentifiedId = 'randomId_' + this.filesArray[i].lastModified + randomId;
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

    _handleTextAreaSize(field) {
        field.style.height = 'inherit';
        const computed = window.getComputedStyle(field);
        const height = parseInt(computed.getPropertyValue('border-top-width'), 10)
            + parseInt(computed.getPropertyValue('padding-top'), 10)
            + field.scrollHeight
            + parseInt(computed.getPropertyValue('padding-bottom'), 10)
            + parseInt(computed.getPropertyValue('border-bottom-width'), 10);
        field.style.height = height + 'px';
    }
    sendComment(event) {
        const self = this;
        if (event.keyCode === 13 && event.ctrlKey) {
            $('textarea#commentBox').val(function (i, val) {
                // return self.reply_model.message_body = val + '\n';
                return val + '\n';
            });
        } else if (event.keyCode === 13 && !event.ctrlKey) {
            // self.reply_model.message_body = self.formattedText;
            this.addComment();
        }
    }
    download(file) {
        const fileName = file.originalname;
        saveAs(file.url, fileName);

    }
    goToLink(file) {
        window.open(file.url, "_blank");
    }



}
