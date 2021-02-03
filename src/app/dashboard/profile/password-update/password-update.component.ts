import { Component, OnInit,Inject } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import {MAT_DIALOG_DATA} from '@angular/material/dialog';
import Swal from 'sweetalert2';
import {AccountService} from '../../../shared/services/account/account.service';
@Component({
  selector: 'app-password-update',
  templateUrl: './password-update.component.html',
  styleUrls: ['./password-update.component.scss']
})
export class PasswordUpdateComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<PasswordUpdateComponent>, private dialog: MatDialog,@Inject(MAT_DIALOG_DATA) public data:any,private account_service: AccountService) { }

  current_password:string;
  new_password:string;

  confirm_password:string;
  password_validation_message ="";
  ngOnInit(): void {
  }

  close() {
    this.dialogRef.close()
  }

  newPasswordValidator(){
    if(!this.new_password.length) this.password_validation_message = '*Please enter a valid password'
    else if(this.new_password.length <4) this.password_validation_message = "*Password at least 4 characters"
    else this.password_validation_message = ""
  }
  updatePassword(){
    let obj = {
      "password": this.current_password,
      "new_password": this.new_password,
      "retype_password": this.confirm_password
    }

    this.account_service.passwordUpdate(obj).subscribe((result) => {
      if (result.status == 'ok') {
        //console.log(result)
        this.changeSessionUserValues(result);
        Swal.fire({
          icon: 'success',
          title: 'Password updated successfully',
          timer: 3000
        })
        this.close()
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Error while updating password',
          timer: 3000
        })
      }
    });

  }//

  changeSessionUserValues(result){
    let current_user_info = JSON.parse(localStorage.getItem('sessionUser'));
    
    current_user_info.password = this.new_password;

    localStorage.setItem('sessionUser', JSON.stringify(current_user_info));
  }//

}
