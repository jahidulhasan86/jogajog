import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Component, Inject, OnInit, ViewEncapsulation, EventEmitter, Output} from '@angular/core';

import {FormBuilder, Validators, FormGroup} from "@angular/forms";

@Component({
    selector: 'app-edit-discussion',
    templateUrl: './discussion.editt.html',
    //styleUrls: ['./course-dialog.component.css']
})
export class DiscussionEditComponent implements OnInit {
    
   model: any;  
 
         

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<DiscussionEditComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any
) {
    this.model = data.dataKey;        

    }

    ngOnInit() {
        

    }
    

    save() {
        
        this.dialogRef.close(this.model);
        //this.dialogRef.close(this.form.value);
    }

    close() {
        this.dialogRef.close(null);
    }
}