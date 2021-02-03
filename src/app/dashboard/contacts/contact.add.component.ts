import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {Component, Inject, OnInit, ViewEncapsulation, EventEmitter, Output} from '@angular/core';
import{Contact} from '../contacts/contacts.component'
import {FormBuilder, Validators, FormGroup} from "@angular/forms";
import { isThisSecond } from 'date-fns';

@Component({
    selector: 'contact-add',
    templateUrl: './contact.add.component.html',
    //styleUrls: ['./course-dialog.component.css']
})
export class ContactAddComponent implements OnInit {
    public breakpoint: number;
    form: FormGroup;
    submitted = false;
    emailRequired = false;
    emailInvalid = false;
 
    @Output()
    saveContact: EventEmitter<Contact> = new EventEmitter<Contact>();     

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<ContactAddComponent>) {
        /* this.form = fb.group({
            name: ['', Validators.required],
            email: ['', Validators.required],
            mobile_number: ['', Validators.required],
            
        }); */

         this.form = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
            mobile_number: ['', [Validators.required]],
           
          }); 
            
     

        this.breakpoint = window.innerWidth <= 600 ? 1 : 2;

    }

    ngOnInit() {
      /*   this.form = this.fb.group({
            name: ['', Validators.required],
            email: ['', [Validators.required, Validators.email,Validators.pattern('^[a-z0-9._%+-]+@[a-z0-9.-]+\\.[a-z]{2,4}$')]],
            mobile_number: ['', [Validators.required]],
           
          });  */  
        
        }
    public onResize(event: any): void {
        this.breakpoint = event.target.innerWidth <= 600 ? 1 : 2;
      }

    save() {
        this.emailRequired = false;
        this.emailInvalid = false;
        this.submitted = true;

        // stop here if form is invalid
        if (this.form.invalid) {
            if(this.form.controls.email.invalid){
                if(this.form.controls.email.errors.required){
                    this.emailRequired = true;
                }
                if(this.form.controls.email.errors.email){
                    this.emailInvalid = true;
                }
            }
            return;
        }
       // if(!this.form.valid) console.log('invnaallid');
        //this.form.controls.
      //  console.log(this.form.value);
        this.saveContact.emit(this.form.value);
        //this.dialogRef.close(this.form.value);
    }

    close() {
        this.dialogRef.close();
    }

    get email() { return this.form.get('email'); }
    get f() { return this.form.controls; }
    get name() {return this.form.get('name');}
    
}