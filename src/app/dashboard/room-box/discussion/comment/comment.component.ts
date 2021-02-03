import { Component, EventEmitter, Input, Output, OnInit, ViewChild, ViewContainerRef, ComponentFactoryResolver } from '@angular/core';

//import { Comment, User, UserService } from '../core';
import {DicussionDetails} from '../discussion.component'
import {DiscussionService} from '../../../../shared/services/discussion/discussion.service'
import { saveAs } from 'file-saver';
import Swal from 'sweetalert2';

const constDownloadFile = require('../../../../../assets/images/Download.png').default;
@Component({
  selector: 'app-comment',
  templateUrl: './comment.component.html',
  styleUrls: ['./comment.component.scss']
})
export class CommentComponent implements OnInit {
  _data : any;
  comment: DicussionDetails;
  discussionId : number;
  reply: boolean;
  componentRef:any;
  filePresent = false;
  imagePresent = false;
  videoPresent = false;
  file: any;
  downloadFile: any;
  @Output() sendCommnetHist = new EventEmitter<any>();
  @ViewChild('dynamicLoadComponent',{read: ViewContainerRef}) entry:ViewContainerRef;
  currentUser: any;
    constructor(
       private resolver: ComponentFactoryResolver,
       private discussionService: DiscussionService
		
  ) {
   this.downloadFile = constDownloadFile;
   this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
    }
  add(){
   this.reply = true; 
  }
  @Input()
  public set data(data:any) 
  {
    // console.log(data);
    this._data = data;
    // console.log('cd',this._data);
    this.showFiles();
  }

  ngOnInit() {
   
  }

  commentDelete(){
    Swal.fire({
      title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? "আপনি কি এই কমেন্টটি মুছতে চান ?" : "Do you want to delete this comment?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: "rgb(244, 173, 32)",
      cancelButtonColor: "#d33",
      confirmButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? "হ্যাঁ" : 'Yes, delete it!',
      cancelButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? "না" : "No",
      
    }).then(result => {
        if(result.value){
        this.deleteComment()
        } 
    });
  }

  deleteComment(){
    // console.log(this._data)
    this.discussionService.deleteComment(this._data).subscribe(result => {
      console.log('commentdelres',result)
        Swal.fire({
          title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? "সফলভাবে কমেন্ট মুছে ফেলা হয়েছে" : "Comment deleted successfully.",
          icon: "success",
          timer: 2000,
        });
        this.sendCommnetHist.emit(true)  
            
    }, err => {
      console.log(err)
      Swal.fire({
        icon: 'warning',
        title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'something went wrong!',
        timer: 2000
      })
    })
  }
  addReply() {
    this.entry.clear();
    const factory = this.resolver.resolveComponentFactory(CommentComponent);
    this.componentRef = this.entry.createComponent(factory); 
  }

  showFiles(){
    if(this._data.files && this._data.files.length>0){
      this.filePresent = true;
       this.file = this._data.files[0];
       this.file.partialName = this.file.originalname;
       if(this.file.partialName.length >20){
        let partialName =  this.showPartialText(this.file.partialName,15,'..');
        this.file.partialName = partialName;

       }else{
         this.file.partialName = this.file.originalname;
       }
      if(this.file.mimetype != "text/plain"){
        if(this.file.mimetype.startsWith('image')){
          this.imagePresent = true;
          this.videoPresent = false;
        }else if(this.file.mimetype.startsWith('video')){
          this.imagePresent = false;
          this.videoPresent = true;
        }
        
      }
    }  
  }

  goToLink(){
    window.open(this.file.url, "_blank");
  }

  download(){
    const fileName = this.file.originalname;
    saveAs(this.file.url, fileName);
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

}