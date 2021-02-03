import { Component, OnInit } from '@angular/core';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { MultiCompanyService } from '../../../shared/services/multi-company/multi-company.service';
import { RoomBoxService } from '../../../shared/services/room-box/room-box.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { MatDialog, MatDialogRef,MAT_DIALOG_DATA} from '@angular/material/dialog';
import { GlobalValue } from '../../../global'
import { Inject } from '@angular/core';
export interface userObj {
  name: string;
}

@Component({
  selector: 'app-invite-room',
  templateUrl: './invitation-room.component.html',
  styleUrls: ['./invitation-room.component.scss']
})


export class InvitationRoomComponent implements OnInit {
  constructor(private spinner: NgxSpinnerService, 
	public dialogRef: MatDialogRef<InvitationRoomComponent>, private dialog: MatDialog,
	@Inject(MAT_DIALOG_DATA) public data: any) {
		this.roomPayload = data.dataKey;

}
option: any;
roomPayload: any;
  ngOnInit(): void {
	
  }
  accept(): void {
	this.option = 'accept';
	this.dialogRef.close(this.option);

  }
  reject(): void {
	this.option = 'reject';
	this.dialogRef.close(this.option);
  }
  cancel(): void {
	this.option = null;
	this.dialogRef.close(null);
  }
  

  
}


