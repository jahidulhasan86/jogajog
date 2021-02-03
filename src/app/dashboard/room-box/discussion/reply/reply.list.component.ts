import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import {ArticleListConfig} from '../../../../shared/models/model/article-list-config.model'
//import { Comment, User, UserService } from '../core';
import {Comment} from '../discussion.component'
@Component({
  selector: 'app-reply-list',
  templateUrl: './reply.list.component.html',
  styleUrls: ['./comment.component.scss']
})
export class ReplyListComponent implements OnInit {
  @Input() data;
  comment: Comment;
  discussionId : number;
  reply: boolean;
    constructor(
       
		
  ) {
    this.comment  = {description:'test',author:'maruf',id: 1, replies: [{description:'test',author:'maruf',id: 1, replies:[]},
    {description:'test',author:'maruf',id: 1, replies:[]}]};
       // this.discussionId =this.data.id;
    this.reply = false;

    }
  add(){
   this.reply = true; 
	this.comment.replies.push({description:'test',author:'maruf',id: 1, replies:[]});
  
  }

  ngOnInit() {
    
  }


  

}