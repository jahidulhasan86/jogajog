import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { GlobalValue } from 'src/app/global';
import { COMMA, ENTER, SPACE } from '@angular/cdk/keycodes';
import { MatChipInputEvent, MatChipList } from '@angular/material/chips';
import { FormGroup, FormControl, FormBuilder, FormArray } from '@angular/forms';
import { MultiCompanyService } from '../../shared/services/multi-company/multi-company.service'
import { templateJitUrl } from '@angular/compiler';
import Swal from 'sweetalert2';

export interface Member {
  email: string;
}

@Component({
  selector: 'app-add-members',
  templateUrl: './add-members.component.html',
  styleUrls: ['./add-members.component.scss']
})
export class AddMembersComponent implements OnInit {
  @ViewChild('chipList') chipList: MatChipList;


  // name chips
  visible = true;
  selectable = true;
  removable = true;
  addOnBlur = true;
  readonly separatorKeysCodes: number[] = [ENTER, COMMA, SPACE];

  // data
  members: Member[] = []

  globalValue: any;
  constructor(public dialogRef: MatDialogRef<AddMembersComponent>, private dialog: MatDialog, private multi_company_service: MultiCompanyService) {

    this.globalValue = GlobalValue;
  }

  ngOnInit() {

  }
  add(event: MatChipInputEvent): void {
    const input = event.input;
    const value = event.value;

    // Add member
    // Add our fruit
    if ((value || '').trim()) {
      this.members.push({ email: value.trim() });
    }

    // Reset the input value
    if (input) {
      input.value = '';
    }
  }

  remove(member: Member) {
    const index = this.members.indexOf(member);

    if (index >= 0) {
      this.members.splice(index, 1);
    }
  }

  close() {
    this.dialogRef.close()
  }

  inviteEmployee() {
    console.log(this.members);
    let temp_ara = []
    this.members.forEach(member => {
      temp_ara.push(member.email)
    })
    this.multi_company_service.inviteEmployee(temp_ara).subscribe((result) => {
      console.log(result)
      if (result.status == 'ok') {
        this.dialogRef.close()
        Swal.fire({
          icon: 'success',
          title: 'Invited successfully',
          timer: 3000
        })
      } else {
        Swal.fire({
          icon: 'warning',
          title: 'Error while inviting members',
          timer: 3000
        })
      }
    })
  }
}
