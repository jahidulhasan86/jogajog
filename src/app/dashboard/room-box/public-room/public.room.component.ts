import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Component, Inject, OnInit, ViewEncapsulation, EventEmitter, Output} from '@angular/core';
import { GlobalValue } from 'src/app/global';
import {FormBuilder, Validators, FormGroup} from "@angular/forms";
import Swal from 'sweetalert2';
import { templateJitUrl } from '@angular/compiler';


@Component({
    selector: 'public-room',
    templateUrl: './public.room.compnent.html',
    styleUrls: ['./public.room.component.scss']
})export class PublicRoomComponent implements OnInit {
    public breakpoint: number;
    form: FormGroup;
	selectedRooms:any []= [];
	rooms: [];
  globalValue: any;     

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<PublicRoomComponent>){

		console.log(data);
    this.rooms= data.dataKey;
    this.globalValue = GlobalValue;

    }

    ngOnInit() {
        

    }
    public onResize(event: any): void {
        this.breakpoint = event.target.innerWidth <= 600 ? 1 : 2;
      }

    

    close() {
      this.selectedRooms = null;
        this.dialogRef.close(this.selectedRooms);
	}
	showOptions(event, room){
		let option = event.checked;
		if(option){
    //	this.selectedRooms.push(room);
    /* if(this.selectedRooms){
      Swal.fire({
				// : 'info',
				title:  'You already selected a room. First Unchcek the selected room',
				timer: 3000,
				showConfirmButton: false
				}); */
    
      this.selectedRooms.push(room);
    
    
		}else{
      let index = this.selectedRooms.indexOf(room.id);
      if(index>=0){
       this.selectedRooms.splice(index,1);
      }
      }
		}
  
  add(){

    this.dialogRef.close(this.selectedRooms);
  }

}