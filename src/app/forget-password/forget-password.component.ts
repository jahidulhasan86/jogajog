import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Component, Inject, OnInit, ViewEncapsulation, EventEmitter, Output} from '@angular/core';

import {FormBuilder, Validators, FormGroup} from "@angular/forms";
import { isThisSecond } from 'date-fns';
import { GlobalValue } from '../global';

@Component({
    selector: 'app-forget-pass',
    templateUrl: './forget-password.component.html',
    //styleUrls: ['./course-dialog.component.css']
})
export class ForgetPasswordComponent implements OnInit {
    submitted = false;
    emailRequired = false;
    emailInvalid = false;
    email:any;
    globalValue: any;
   
    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<ForgetPasswordComponent>) {
        /* this.form = fb.group({
            name: ['', Validators.required],
            email: ['', Validators.required],
            mobile_number: ['', Validators.required],
            
        }); */

        this.globalValue = GlobalValue;

    }

    ngOnInit() {
        
    }
    

    save() {
    
    if(!this.email) return;
      
      this.dialogRef.close(this.email);
        
    }

    close() {
        this.dialogRef.close();
    }
    closeDialog(eventFireFrom?) {
		this.dialogRef.close();
		
	}

    
    
}