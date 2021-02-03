import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from '../shared/validators/custom-validators';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import { Router, ActivatedRoute } from '@angular/router';
import {AccountService} from '../shared/services/account/account.service';
import Swal from 'sweetalert2';
import { GlobalValue } from '../global';
@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent {
  public frmSignup: FormGroup;
  token:string;
  globalValue: any;
  constructor(private fb: FormBuilder, 
     private route: ActivatedRoute, private accountService: AccountService,private router: Router) {
    this.frmSignup = this.createSignupForm();
    // this.globalValue = GlobalValue;
  }

  createSignupForm(): FormGroup {
    return this.fb.group(
      {
       
        password: [
          null,
          Validators.compose([
            Validators.required,
            // check whether the entered password has a number
            /* CustomValidators.patternValidator(/\d/, {
              hasNumber: true
            }), */
            // check whether the entered password has upper case letter
            /* CustomValidators.patternValidator(/[A-Z]/, {
              hasCapitalCase: true
            }), */
            // check whether the entered password has a lower case letter
            /* CustomValidators.patternValidator(/[a-z]/, {
              hasSmallCase: true
            }), */
            // check whether the entered password has a special character
            /* CustomValidators.patternValidator(
              /[ !@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
              {
                hasSpecialCharacters: true
              }
            ), */
            Validators.minLength(5)
          ])
        ],
        confirmPassword: [null, Validators.compose([Validators.required])]
      },
      {
        // check whether our password and confirm password match
        validator: CustomValidators.passwordMatchValidator
      }
    );
  }

  submit() {
    // do signup or something
    if(!this.frmSignup.valid) return;
    if(!this.token) return; 
    this.accountService.resetPassword({password:this.frmSignup.controls.password.value},this.token).
    subscribe(result=>{
      if(result.status=='ok'){

        Swal.fire({
          // : 'info',
          title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'সফলভাবে পাসওয়ার্ড রিসেট হয়েছে' : 'Succcessfully reset password',
          timer: 2000,
          showConfirmButton: false
          });
        this.router.navigate(['#/']);
      }else{
        Swal.fire({
          icon : 'warning',
          title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'পাসওয়ার্ড রিসেট ব্যর্থ হয়েছে' : 'Failed to reset password',
          timer: 2000,
          showConfirmButton: false
          });
       // this.router.navigate(['#/']);
      }
      
    });

    console.log(this.frmSignup.value);
  }

  ngOnInit() {
    this.globalValue = GlobalValue;
		this.route.queryParams.subscribe((result) => {
			if (!!result.token) {
          this.token = result.token;
      }
          });
        }			
  				//	this.registerDialog(decodedToken)
				
				
}
