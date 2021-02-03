import { ChatService } from '../../../shared/services/chat/chat.service';
import { Component, OnInit, OnDestroy, Output, EventEmitter, IterableDiffers, } from '@angular/core';
import { Subscription } from 'rxjs';
import { NgxSpinnerService } from 'ngx-spinner';
import { saveAs } from 'file-saver';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import * as $ from 'jquery';
import Swal from 'sweetalert2';
import { XmppChatService } from '../../../shared/services/xmpp-chat/xmpp-chat.service';
import { L } from '@angular/cdk/keycodes';
const constImageFile = require('../../../../assets/images/image.png').default;
const constDownloadFile = require('../../../../assets/images/Download.png').default;

@Component({
  selector: 'app-resource-room-box',
  templateUrl: './resource-room-box.component.html',
  styleUrls: ['./resource-room-box.component.scss']
})
export class ResourceRoomBoxComponent implements OnInit, OnDestroy {

  @Output() onChange: EventEmitter<File> = new EventEmitter<File>()

  fileList: any = [];
  imgFileList: any = [];
  fileFilter: any = { originalname: '' };
  onSingleConferenceCastSub: Subscription;
  selectedConference: any;
  imgFileUrl: any;
  isProgress: boolean;
  downloadFile: any;
  listItemWidth: any;
  imgSrc = '../../../../assets/images/add icon default.png';
  linkList: any;
  linkFileList: any;
  currentType: any = 'all';

  constructor(private http: HttpClient, public chatService: ChatService,
    private xchatService: XmppChatService,  private spiner: NgxSpinnerService) {
    this.imgFileUrl = constImageFile;
    this.downloadFile = constDownloadFile;
    this.isProgress = false;
  }

  ngOnDestroy() {
    // if (this.onSingleConferenceCastSub)
    //   this.onSingleConferenceCastSub.unsubscribe();
  }

  ngOnInit() {
    // if (confId) this.getFileHistory(confId)
    this.getFileHistory(this.xchatService.selectedGroup.id)
  };


  download(fileInfo) {
    const fileName = fileInfo.originalname
    saveAs(fileInfo.url, fileName);
  }

  viewToNewTab(fileInfo) {
    window.open(fileInfo.url);
  }

  openFileDeletePopup(file){
    Swal.fire({
      // icon: 'info',
      title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? "আপনি কি এই রিসোর্সটি মুছতে চান ?" : "Do you want to delete this resource?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: "rgb(244, 173, 32)",
      cancelButtonColor: "#d33",
      confirmButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? "হ্যাঁ" : 'Yes, delete it!',
      cancelButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? "না" : "No",
      
    }).then(result => {
        if(result.value){
           console.log("deleted file ", file);
           this.xchatService.deleteResource(file).subscribe(result => {
             if(result.status == 'ok'){
              console.log('delelteFileRes',result)
              // delete from image array and file array
              this.fileList.forEach((element ,index)=> {
                if(element.file_id == file.file_id){
                  this.fileList.splice(index, 1);
                }
              });

              this.imgFileList.forEach((element ,index)=> {
                if(element.file_id == file.file_id){
                  this.imgFileList.splice(index, 1);
                }
              });

              this.linkFileList.forEach((element ,index)=> {
                if(element.file_id == file.file_id){
                  this.linkFileList.splice(index, 1);
                }
              });

             
              Swal.fire({
                icon: 'success',
                title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? "সফলভাবে ফাইল  মুছে ফেলা হয়েছে" : 'File deleted successfully',
                timer: 3000
              })
             } else {
              Swal.fire({
                icon: 'warning',
                title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? "কিছু ভুল হয়েছে!" :'Error while deleting file',
                timer: 3000
              })
             }
           });
        } 
    });
  } 
  getFileHistory(id) {
    if (!id) return
    this.isProgress = true;
    $('#dashboardSideBar').css('z-index', '0');
    this.spiner.show();
    this.fileList = []
    this.xchatService.getFileHistory(id).subscribe(result => {
      console.log('getFileHistory',result)
      if (result.status === 'ok') {
        
        this.isProgress = false;
        $('#dashboardSideBar').css('z-index', '1000');
        this.spiner.hide();
        console.log('chat file upload history', result)
        this.fileList = result.resultset
       
        // this.linkList = result.resultset.filter(e => e.resource_type == 'url')
        // console.log('sssssss',this.linkList)
        // console.log('sssssss',this.fileList)
        console.log("get file history files  ", result.resultset)
        this.imgFileList = [];
        this.fileList.forEach(e => {
          if (e.originalname?.length >= 21) {
            e['shortname'] = this.showPartialText(e.originalname, 21, "...")
          } else {
            e['shortname'] = e.originalname
          }
         if(e.resource_type !='url'){
          if (e.mimetype.split('/')[1] === 'png') {
            this.imgFileList.push(e);
            e.mimetype_img = require('../../../../assets/images/PNGIcon.png').default;
          } else if (e.mimetype.split('/')[1] === 'jpeg') {
            this.imgFileList.push(e);
            e.mimetype_img = require('../../../../assets/images/JPGIcon.png').default;
          }
          else if (e.mimetype.split('/')[1] === 'mp3')
            e.mimetype_img = require('../../../../assets/images/MP3Icon.png').default;
          else if (e.mimetype.split('/')[1] === 'pdf')
            e.mimetype_img = require('../../../../assets/images/PDF.png').default;
          else if (e.mimetype === 'text/plain')
            e.mimetype_img = require('../../../../assets/images/TXT.png').default;
          else if (e.mimetype.split('/')[0] === 'video')
            e.mimetype_img = require('../../../../assets/images/Video.png').default;
          // else if (e.mimetype == null) 
          // e.mimetype_img = require('../../../../assets/images/PDF.png').default;
          else e.mimetype_img = require('../../../../assets/images/DocIcon.png').default;
         }
         else {
          e.mimetype_img = require('../../../../assets/images/link.png').default;
          // this.linkFileList.push(e)
          // console.log(this.linkFileList)
         }
        });
        this.linkFileList = this.fileList.filter(e=>e.resource_type === 'url');
        this.fileList = this.fileList.sort((a, b) => a.added_at < b.added_at ? 1 : -1); // sort array by added_at forshow  leatest data on top
        //this.UiModification();

      }
    }, err => {
      this.isProgress = false;
      $('#dashboardSideBar').css('z-index', '1000');
      this.spiner.hide();
      console.log(err)
    })
  }

  showPartialText(str, length, ending) {
    if (length === null) {
      length = 25;
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

  changeTab(type) {
    // alert(document.getElementById("conf_shr").clientWidth)
    console.log(this.fileList)
    this.currentType = type
    console.log(this.currentType)
    if (type === 'images') {
      $(".images").addClass('active in')
      $(".all").removeClass('active in')
      $(".link").removeClass('active in')

    } else if (type === 'all') {
      $(".images").removeClass('active in')
      $(".link").removeClass('active in')
      $(".all").addClass('active in')
    }
    else if (type === 'link'){
      $(".images").removeClass('active in')
      $(".all").removeClass('active in')
      $(".link").addClass('active in')
    }
  }


  selectedGroup

  addFile() {
    this.selectedGroup = this.xchatService.selectedGroup;
  }

  onMouseOut() {
    this.imgSrc = '../../../../assets/images/add icon default.png';
  }
  onMouseOver() {
    this.imgSrc = '../../../../assets/images/add_icon_selected.png';
  }

  showLinkUpload(){
    Swal.fire({
      html:
      '<input id="swal-input1" class="swal2-input" placeholder="Enter your title">' +
      '<input id="swal-input2" class="swal2-input" placeholder="Enter your link">',
      allowOutsideClick: false,
      showCancelButton: true,
      confirmButtonColor: '#F4AD20',
      cancelButtonColor: '#d33',
      padding: '1em',
      preConfirm: function () {
        return new Promise(function (resolve) {
            // Validate input
            if ($('#swal-input1').val() == '' || $('#swal-input2').val() == '') {
                Swal.showValidationMessage((!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'অনুগ্রহপূর্বক উভয় ক্ষেত্র পূরণ করুন' : 'Please fill up  both fields')
                Swal.enableButtons() 
            } else {
                Swal.resetValidationMessage();
                resolve([
                    $('#swal-input1').val(),
                    $('#swal-input2').val()
                ]);
            }
        })
    },
			confirmButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'হ্যাঁ' : 'Yes',
			cancelButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'না' : 'No, Thanks'
       
  }).then((result) => {
      if (result.value) {
        let title = $('#swal-input1').val()
        let url=  $('#swal-input2').val()
        let Link = {
           'title' : title,
           'url': url
         }
         console.log("Result: " + result.value,'Linkk',Link);
          this.shareLink(Link)
      }
  });
  }
  shareLink(link){
    // console.log(this.Link)উভয় ক্ষেত্র পূরণ করুন
    this.selectedGroup = this.xchatService.selectedGroup;
    var toUser = {
      user_name: this.selectedGroup.isgroup === true ? this.selectedGroup.user_id : this.selectedGroup.user_name,
      user_id: this.selectedGroup.user_id
    }
    this.xchatService.linkUpload(link, toUser)
    .subscribe(result => {
      if(result.status == 'ok'){
      console.log('linkshared',result)
      $('#dashboardSideBar').css('z-index', '1000');
        Swal.fire({
          title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? "সফলভাবে লিঙ্ক যোগ করা হয়েছে" : "Link added successfully.",
          icon: "success",
          timer: 2000,
        });
          let confId = this.xchatService.selectedGroup.id;
                if (confId) this.getFileHistory(confId)
                setTimeout(() => {
                  this.changeTab(this.currentType)
                }, 1000);
      }      
    }, err => {
      this.isProgress = false;
      $('#dashboardSideBar').css('z-index', '1000');
      Swal.fire({
        icon: 'warning',
        title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'লিঙ্ক যোগ করা ব্যর্থ হয়েছে, অনুগ্রহপূর্বক আবার চেষ্টা করুন' : 'Link adding failed, Please try again',
        timer: 2000
      })
    })

  }
  uploadProgress = false;

  getFiles(e) {
    
    // console.log('getfiles')
    // console.log(this.selectedGroup)
    // // document.getElementById('attachment').click();
    var filesArray = e.target.files;
    let uploadingFileQueue = [];

    let names
    if (filesArray.length > 0) {

      for (let i = 0; i < filesArray.length; i++) {
        names += filesArray[i].name + '\n'
        this.uploadProgress = true;
        var fileType = filesArray[i].type.substring(0, filesArray[i].type.indexOf("/"));
        var fileUploadIdentifiedId;
        if (fileType === 'application') {
          fileType = 'file'
        }
        // =================================

        var randomId = Math.floor(Math.random() * 100)
        fileUploadIdentifiedId = 'randomId_' + filesArray[i].lastModified + randomId;
        filesArray[i].fileUploadIdentifiedId = fileUploadIdentifiedId;

        this.selectedGroup = this.xchatService.selectedGroup;
        var toUser = {
          user_name: this.selectedGroup.isgroup === true ? this.selectedGroup.user_id : this.selectedGroup.user_name,
          user_id: this.selectedGroup.user_id
        }

        let reader = new FileReader;
        reader.onload = (e: any) => {
          var timestamp = new Date().getTime();
          var d = new Date(timestamp);
          var pushMSG = {
            "from": "",//"me",
            "msg": e.target.result,
            "align": "right",
            "image_url": "",
            "stamp": d.toLocaleString(undefined, {
              day: 'numeric',
              month: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
            'thumbnail': e.target.result,
            "isFile": true,
            "fileType": fileType,
            "id": filesArray[i].fileUploadIdentifiedId,
            "isLoader": true,
            'fileShortName': filesArray[i].name,
          
            // sendingFailedText : this.isConnected ? true : false,
            sendingFailedText: true,
          }
          // this.chatService.chats.push(pushMSG);
          // this.chatService.chatListAdd(this.chatService.chats);

          this.onChange.emit(filesArray[i]);
        };
        reader.readAsDataURL(filesArray[i]);


        // =================================
        // upload file from here
        if (fileType) {
          this.isProgress = true;
          $('#dashboardSideBar').css('z-index', '0');
          this.spiner.show();
          // Swal({
          //   title: "Are you sure you want to add the following file(s)?\n\n " + names,
          //   type: 'warning'
          // });
          //for new upload process (Http/Https)
          this.xchatService.audioVideoUpload(filesArray[i], fileUploadIdentifiedId, toUser)
            .subscribe(result => {
              this.isProgress = false;
              $('#dashboardSideBar').css('z-index', '1000');
              this.spiner.hide();
              if (result.status === 'ok') { 
                Swal.fire({
                  title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? "সফলভাবে ফাইল আপলোড হয়েছে" : "File successfully uploaded.",
                  icon: "success",
                  timer: 3000,
                });
                let confId = this.xchatService.selectedGroup.id;
                if (confId) this.getFileHistory(confId)
                setTimeout(() => {
                  this.changeTab(this.currentType)
                }, 1000);

              }
            }, err => {
              this.isProgress = false;
              $('#dashboardSideBar').css('z-index', '1000');
              this.spiner.hide();
              console.log("from new upload method", err)
              Swal.fire({
                icon: 'warning',
                title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'আপলোড সফল হয়নি, অনুগ্রহপূর্বক আবার চেষ্টা করুন' : 'Uploading failed, Please try again',
                timer: 3000
              })
            })
        } else {
          // for Old Upload process (Slot request with Xammp) , only image and file
          Swal.fire({
            icon: 'warning',
            title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'এই ফাইল এর সাপোর্ট নেই' : 'File are not supported.',
            timer: 3000
          })
        }

      }
    }
  }
}

