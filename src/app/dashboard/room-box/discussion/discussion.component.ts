import { Component, EventEmitter, Input, Output, OnInit, ViewChild,  ViewContainerRef, ComponentFactoryResolver, OnDestroy, SimpleChanges, OnChanges} from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { DiscussionService } from '../../../shared/services/discussion/discussion.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { MatDialog ,MatDialogConfig} from '@angular/material/dialog';

import { CreateNewDiscussionDialogComponent } from '../discussion/create-new-discussion/create-new-discussion.component';
import { analytics } from 'firebase';
import { DiscussionDetailsComponent } from './discussion-details/discussion.details.component';
import {DiscussionEditComponent} from './edit-popup/discussion.edit';
@Component({
	selector: 'app-discussion',
	templateUrl: './discussion.component.html',
	styleUrls: ['./discussion.component.scss']
})
export class DiscussionComponent implements OnInit, OnDestroy {
	showDetails = false;
    public discussions = [];
    discussion: any;
	public id: string;
	@Input() roomId;
	index: any;
	nextIndex: any;
	previousIndex: any;
	componentRef:any;
	currentUser:any;
	@ViewChild('dynamicLoadComponent',{read: ViewContainerRef}) entry:ViewContainerRef;
	//   dataSource: MatTableDataSource<Discussion>;

	//   @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;

	constructor(
		private discussionService: DiscussionService, private spinner: NgxSpinnerService, private dialog: MatDialog, private resolver: ComponentFactoryResolver,
	) {
		this.showDetails = false;
		this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));

	}
    ngOnDestroy(): void {
        this.discussionService.isDiscussionDetailsSelected$.next(false);
	}
	
	// ngOnChanges(changes: SimpleChanges): void {
	// 	console.log('ccc',changes)
	// 	// if (changes.sendSubject) {
	// 	//   this.ngOnInit();
	// 	//   document.getElementById('std-exam-list').click()
	// 	// }
	//   }

	ngOnInit() {
		this.getDiscussionsOfMainThread();
		console.log('room id is: ' + this.roomId);

        this.discussionService.isDiscussionDetailsSelectedObserver.subscribe(x => {
            this.showDetails = x;
        });

		this.discussionService.getByRoomIdCast.subscribe(x=>{
			if(x && x.resultset) this.discussions = x.resultset
			console.log(this.discussions)
		})
		// this.discussionService.getAllReplyCast.subscribe((result) => {
		// 	if (!!result) {
		// 		console.log('Comments',result)
		// 		this.allComment = result.result.children
		// 		this.commentslength = this.allComment.length
		// 		this.lastComment = this.allComment[this.commentslength-1]
		// 		console.log('lastComment',this.lastComment)
		// 	}
		// })
	}

	dataReceived(event){
	 if(event)
	 this.ngOnInit()
	}
  createNewThread()
  {
    var createNewThreadDialog = this.dialog.open(CreateNewDiscussionDialogComponent, {
      disableClose: false,
      panelClass: 'newThreadDialog',
      minWidth:"650px"
    });
  }
 
 

	navigateDetails(discussion,index) {
		 this.id = discussion.root_discussion_id;
        //  this.showDetails = true;
         this.discussionService.isDiscussionDetailsSelected$.next(true);
		 this.discussionService.selectedDiscussion$.next(discussion);
		 this.discussionService.discussions$.next(this.discussions);
		 this.discussionService.currentIndex$.next(index);
       /*  Swal.fire({
            // icon: 'error',
            title: 'Coming Soon!',
            timer: 3000,
            show ConfirmButton: false
        });*/
	}

	back() {
		this.showDetails = false;
		this.id = null;
	}

	editDiscussion(discussion){
		const dialogConfig = new MatDialogConfig();

		dialogConfig.disableClose = true;
		dialogConfig.autoFocus = true;
		let dialogRef = this.dialog.open(DiscussionEditComponent,{
		  width: '640px',disableClose: true,data: {
			dataKey: discussion
		  }
		} );
		dialogRef.afterClosed().subscribe(result=>{
			if(result){
				let body = {subject: result.subject, message_body: result.message_body, root_discussion_id:result.root_discussion_id, room_id: discussion.room_id};
				this.discussionService.editDiscussion(body).subscribe(result=>{
					Swal.fire({
						icon: 'success',
						text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'সফলভাবে থ্রেড আপডেট হয়েছে' : 'Thread updated successfully',
						timer: 3000
					  });
					
				});	
			}

		});  
			   

	}

	deleteDiscussion(discussion){
		Swal.fire({
			title: '',
			text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'এই প্রসঙ্গের সব ফাইল এবং মন্তব্য মুছে যাবে | আপনি কি নিশ্চিত যে প্রসঙ্গটি মুছে ফেলবেন ?' : 'All the comments and files under the thread will be permanently removed. Are you sure you want to delete?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#F4AD20',
			cancelButtonColor: '#d33',
			confirmButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'হ্যাঁ' : 'Yes',
			cancelButtonText: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'না' : 'No, Thanks'
		}).then((result) => {
			if (result.value) {
				let body = {root_discussion_id: discussion.root_discussion_id};
				this.discussionService.deleteDiscussion(body).subscribe(result=>{
					if(result) {
						Swal.fire({
							icon: 'success',
							text: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'সফলভাবে প্রসঙ্গ ডিলিট হয়েছে' : 'Thread deleted successfully',
							timer: 3000
						  });
						this.ngOnInit();
					}
				});				
	
			}
	});

	}

	getDiscussionsOfMainThread() {
		$('#dashboardSideBar').css('z-index', '0');
		this.spinner.show();
		this.discussions = [];
		this.discussionService.getByRoomId(this.roomId).subscribe((result) => {
			this.spinner.hide();
			$('#dashboardSideBar').css('z-index', '1000');
			if (result.status === 'ok') {
				// this.contacts = result;
				// this.dataSource = new MatTableDataSource<Discussion>(result.resultset);
				// this.dataSource.paginator = this.paginator;
				this.discussions = result.resultset;
				console.log(this.discussions)
			} else {
				this.spinner.hide();
				Swal.fire({
					icon: 'error',
					title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
					timer: 3000
				});
			}
		},
		(err) => {
			this.spinner.hide();
				Swal.fire({
					icon: 'error',
					title:  (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
					timer: 3000
				});
		});
	}

}

export class Discussion {

	/*     title: string;
        topic: string;
        author: string;
        comments: Comment[];  */

	// modeling domain


	root_discussion_id: string;
	company_id: string;
	room_id: string;
	created: Date;
	created_by: string;
	creator: string;
	message_body: string;
	room_name: string;
	status: string;
	subject: string;
	type: string;

	users: User[];

	creator_profile_pic: string;
	creator_email: string;


}

export interface Comment {
	description: string;
	author: string;
	id: number;
	replies: Comment[];

}

export interface User {
	email: string;
	user_id: string;
	user_name: string;

}

export class DicussionDetails {
	id: string;
	parent_id: string;
	root_discussion_id: string;
	subject: string;
	users: User[];
	message_body: string;
	status: string;
	type: string;
	created: Date;
	created_by: string;
	creator: string;
	updated_by: string;
	action_date: Date;
	action_type: string;
	is_main_discussion: boolean;
	files: File[];
	creator_profile_pic: string;
	creator_email: string;

	is_active: boolean;
	children: DicussionDetails[];

}

export class File {

	reference_id: string;
	resource_id: string;
	file_id: string;
	added_at: Date;
	app_id: string;
	company_id: string;
	encoding: string;
	filename: string;
	mimetype: string;
	originalname: string;
	reference_type: string;
	resource_type: string;
	size: number;
	uploaded_by: string;
	url: string;
	partialName?: string;

}
