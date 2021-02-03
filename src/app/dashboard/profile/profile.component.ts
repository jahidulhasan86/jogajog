import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GlobalValue } from 'src/app/global';
import { FormBuilder, Validators, FormGroup } from "@angular/forms";
import {AccountService} from '../../shared/services/account/account.service';
import { PasswordUpdateComponent } from '../profile/password-update/password-update.component';

import Swal from 'sweetalert2';

@Component({
  
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ProfileComponent implements OnInit {
  form: FormGroup;
  
  user_info: any;
 
  selected: any ;
  globalValue: any;

  address: string;
  first_name: string;
  last_name:string;
  contact:string;
  password:string;
  date : any;

  show_date: any;
  constructor(public dialogRef: MatDialogRef<ProfileComponent>, private dialog: MatDialog, private fb: FormBuilder, private account_service: AccountService) {
    this.globalValue = GlobalValue;
    this.form = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email, Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
      mobile_number: ['', [Validators.required]],

    });

  }

  ngOnInit(): void {
    this.user_info = JSON.parse(localStorage.getItem('sessionUser'))
    
    this.setLocalInfoIntoProfile();
    
    //this.user_info.date_of_birth ? this.date =  this.user_info.date_of_birth : this.date = this.dateNow

    // console.log("gender: ", this.selected)
    // console.log('birth_date', this.date);
    // console.log("first_name ", this.first_name);
    // console.log("last_name ", this.last_name);
    // console.log('address ', this.address);
    // console.log('contact ', this.contact);
    
  }
  
  setLocalInfoIntoProfile(){
    this.user_info.gender ? this.selected = this.user_info.gender : this.selected ='male'
    this.user_info.address  ? this.address = this.user_info.address : this.address = ''
    this.user_info.first_name  ? this.first_name = this.user_info.first_name : this.first_name = ''
    this.user_info.last_name  ? this.last_name = this.user_info.last_name : this.last_name = ''
    this.user_info.contact  ? this.contact = this.user_info.contact : this.contact = ''
    this.password = this.user_info.password;
    
    if(this.user_info.date_of_birth){
      this.show_date = new Date(this.user_info.date_of_birth).toISOString()
      console.log("iso date ",this.show_date);
    } else {
      this.show_date = new Date().toISOString()
      
    }
    
  }
  updateProfile(){
    
    var obj = {
      'gender' : this.selected,
      'first_name': this.first_name,
      'last_name': this.last_name,
      'address' : this.address,
      'contact':  this.contact,
      'is_public' : true,
      'date_of_birth': this.date
    }
    this.account_service.profileUpdate(obj).subscribe((result) => {
      if (result.status == 'ok') {
        console.log(result)
        this.changeSessionUserValues(result);
        Swal.fire({
          icon: 'success',
          title: 'Profile updated successfully',
          timer: 3000
        })
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Error while updating profile',
          timer: 3000
        })
      }
    });
  }
  close() {
    this.dialogRef.close()
  }

  selectOption(value){
    console.log("gender selected",value)
  }
  enterPlaceholdersValues(){
    
  }

  openPasswordEditor(){
    const dialogRef = this.dialog.open(PasswordUpdateComponent, {
		  data: {password: this.password}
		});
  }

  changeSessionUserValues(result){
    let current_user_info = JSON.parse(localStorage.getItem('sessionUser'));
    
    current_user_info.first_name = result.result.first_name;
    current_user_info.last_name = result.result.last_name;
    current_user_info.address = result.result.address;
    current_user_info.contact = result.result.contact;
    current_user_info.date_of_birth = this.date
    current_user_info.gender = this.selected;

    localStorage.setItem('sessionUser', JSON.stringify(current_user_info));
  }//
  
	datePickerEvent(date) {
		
		
    this.date= new Date(date);
    this.date = this.date.getTime();
    
    
	}

}
