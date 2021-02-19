import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MultiCompanyService } from '../../../../shared/services/multi-company/multi-company.service';
import { RoomBoxService } from '../../../../shared/services/room-box/room-box.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import { GlobalValue } from '../../../../global';
import { AccountService } from 'src/app/shared/services/account/account.service';
import { ContactService } from 'src/app/shared/services/contact/contact.service';

@Component({
  selector: 'app-update-room-box',
  templateUrl: './update-room-box.component.html',
  styleUrls: ['./update-room-box.component.scss']
})
export class UpdateRoomBoxComponent implements OnInit {
  userData: any[];
  participantData: any[];
  deleteUsers: any[];
  roomBoxName: string;
  globalValue: any;
  bnEnLanguageCheck: any;
  constructor(@Inject(MAT_DIALOG_DATA) public data: any, private spinner: NgxSpinnerService,
    private multiCompanyService: MultiCompanyService, private roomBoxService: RoomBoxService,
    private dialogRef: MatDialogRef<UpdateRoomBoxComponent>,
    private accountService: AccountService,
    private contactService: ContactService,
  ) { }

  ngOnInit(): void {
    this.roomBoxName = this.data.selectedRoom.conference_name;
    this.participantData = this.data.selectedRoom.users;
    this.data.delUser = [];
    this.data.checkedUser = [];
    if (this.data.target === 'participants') {
      if (!this.multiCompanyService.defaultCompany()) {
        this._getCompanyUsers()
      } else {
        this.getContacts()
      }
    }
    this.globalValue = GlobalValue;
    this.accountService.getLanguage().subscribe((result) => {
      this.bnEnLanguageCheck = result;
    });
  }

  getContacts() {
    this.spinner.show()
    const currentUser = JSON.parse(localStorage.getItem('sessionUser'));
    this.contactService.getContacts().subscribe((result) => {
      if (result) {
        this.userData = [];
        this.spinner.hide();
        $('#dashboardSideBar').css('z-index', '1000');
        this.updateUserModelGenerator(result)
      }
    }, err => {
      this.spinner.hide();
      console.log(err)
    });
  }

  updateUserModelGenerator(contacts) {
    const roomUser = this.operation(this.participantData, contacts, true)
    const notRoomUser = this.operation(contacts, this.participantData)
    this.data.checkedUser = roomUser
    this.userData = [...roomUser, ...notRoomUser]
  }

  _getCompanyUsers() {
    $('#dashboardSideBar').css('z-index', '0');
    this.spinner.show();
    const currentUser = JSON.parse(localStorage.getItem('sessionUser'));
    this.multiCompanyService.getCompanyEmployee().subscribe(x => {
      this.spinner.hide();
      $('#dashboardSideBar').css('z-index', '1000');
      if (x.code === 200) {
        this.userData = [];
        if (x.resultset) {
          if (x.resultset.length > 0) {
            x.resultset.map(user => {
              if (!user.profile_pic) {
                user.profile_pic = '';
              }
              if (!user.contact || user.contact === 'N/A') {
                user.contact = '';
              }
              user.isChecked = false;
              if (user.email !== currentUser.email) {
                delete user.metadata;
                delete user.app_id;
                delete user.app_name;
                delete user.company_id;
                delete user.company_name;
                delete user.created;
                delete user.position;
                delete user.role;
                delete user.role_id;
                delete user.updated;
                // delete x.contact;
                // delete x.profile_pic;
                // delete x.email;
                delete user.isChecked;
                this.userData.push(user);
              }
            });
            this.userData.filter(cUser => {
              this.data.selectedRoom.users.map(y => {
                if (cUser.user_id === y.user_id) {
                  this.data.checkedUser.push(y);
                  cUser.isChecked = true;
                }
              });
            })
          }
        } else {
          Swal.fire({
            // icon: 'info',
            title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'সিলেক্টেড কোম্পানির জন্য কোন সদস্য পাওয়া যায়নি ' : 'No Member Found For Selected Company.',
            timer: 3000,
            showConfirmButton: false
          })
        }
      } else {
        Swal.fire({
          icon: 'error',
          title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
          timer: 3000,
          showConfirmButton: false
        })
      }
    });
  }

  OnChange(event, data) {
    console.log(data)
    const self = this;
    if (event) {
      if (this.userData) {
        var index = this.userData.indexOf(data.email);
        if (index === -1) {
          // delete data.isChecked;
          this.participantData.push(data);
          self.data.checkedUser.map(function (x) {
            if (x.email === data.email) {
              self.data.delUser.splice(self.data.delUser.findIndex(function (i) {
                return i === x.email;
              }), 1);
            }
          });

        }
      }
      else {
        delete data.isChecked;
        this.participantData.push(data);
      }
    }
    else {
      const target = this.participantData.findIndex(dex => {
        return dex.user_id === data.user_id;
      });
      this.participantData.splice(target, 1);

      this.data.checkedUser.map(function (x) {
        if (x.email === data.email) {
          self.data.delUser.push(data);
        }
      });
    }

    console.log(this.participantData)
    console.log('deleteUserList....', this.data.delUser)
    console.log('deleteUserLength:' + this.data.delUser.length)

  }

  async _updateRoomBox() {
    let isNameUpdate = false;
    let isParticipantUpdate = false;
    let inviteByContacts = []
    if (this.data.target === 'name') {
      if (this.data.selectedRoom.conference_name !== this.roomBoxName) {
        $('#dashboardSideBar').css('z-index', '0');
        this.spinner.show();
        this.roomBoxService._updateConferenceName(this.data.selectedRoom.id, this.roomBoxName).subscribe((x: any) => {
          if (x.result) {
            $('#dashboardSideBar').css('z-index', '1000');
            this.spinner.hide();
            isNameUpdate = true;
            this.data.selectedRoom.conference_name = this.roomBoxName;
            this.dialogRef.close();
            Swal.fire({
              icon: 'success',
              title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'রুম আপডেট সফল হয়েছে' : 'Room Name Updated Successfully.',
              timer: 3000,
              showConfirmButton: false
            });
            // setTimeout(x=> {window.location.reload(); }, 2900);
          } else {
            $('#dashboardSideBar').css('z-index', '1000');
            this.spinner.hide();
            isNameUpdate = false;
            Swal.fire({
              icon: 'error',
              title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
              timer: 3000,
              showConfirmButton: false
            });
          }

        });
      } else {
        isNameUpdate = false;

        Swal.fire({
          // icon: 'info',
          title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কোন পরিবর্তন পাওয়া যায় নি' : 'No Changes Found!',
          timer: 3000,
          showConfirmButton: false
        });
      }
    } else if (this.data.target === 'participants') {
      if (this.participantData.length >= 1) {
        this.participantData.filter(x => delete x.isChecked);
        $('#dashboardSideBar').css('z-index', '0');
        this.spinner.show();
        if (this.data.delUser.length == 0) {
          if (this.multiCompanyService.defaultCompany()) {
            inviteByContacts = this.invteRoomByContactModelGenerator()
            if (inviteByContacts.length > 0) {
              const inviteByContactResponse = await this.inviteRoomByContact({ conference_name: this.data.selectedRoom.conference_name, id: this.data.selectedRoom.conferance_id }, inviteByContacts)
              console.log('invite by contact response', inviteByContactResponse)
            }
          }
          const addUserToExistingConResponse: any = await this.addUserToExistingConference()
          console.log('add user to existing conference response', addUserToExistingConResponse)
          if (addUserToExistingConResponse.status == 'ok') {
            $('#dashboardSideBar').css('z-index', '1000');
            this.spinner.hide();
            isParticipantUpdate = true;
            this.dialogRef.close();
            Swal.fire({
              icon: 'success',
              title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'রুমের অংশগ্রহণকারী সফলভাবে আপডেট করা হয়েছে' : 'Room Participant(s) Updated Successfully.',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            $('#dashboardSideBar').css('z-index', '1000');
            this.spinner.hide();
            isParticipantUpdate = false;
            Swal.fire({
              icon: 'error',
              title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
              timer: 3000,
              showConfirmButton: false
            });
          }
        } else {
          if (this.multiCompanyService.defaultCompany()) {
            inviteByContacts = this.invteRoomByContactModelGenerator()
            if (inviteByContacts.length > 0) {
             const inviteByContactResponse = await this.inviteRoomByContact({ conference_name: this.data.selectedRoom.conference_name, id: this.data.selectedRoom.conferance_id }, inviteByContacts)
             console.log('invite by contact response', inviteByContactResponse)
            }
          }
          const deleteUserResponse = await this._deleteRoomBoxParticipant()
          console.log('delete user response', deleteUserResponse)
          this.data.selectedRoom.conference_name = this.roomBoxName;
          const addUserToExistingConResponse: any = await this.addUserToExistingConference()
          console.log('add user to existing conference response', addUserToExistingConResponse)
          if (addUserToExistingConResponse.status == 'ok') {
            $('#dashboardSideBar').css('z-index', '1000');
            this.spinner.hide();
            isParticipantUpdate = true;
            this.dialogRef.close();
            Swal.fire({
              icon: 'success',
              title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'রুমের অংশগ্রহণকারী সফলভাবে আপডেট করা হয়েছে' : 'Room Participant(s) Updated Successfully.',
              timer: 3000,
              showConfirmButton: false
            });
          } else {
            $('#dashboardSideBar').css('z-index', '1000');
            this.spinner.hide();
            isParticipantUpdate = false;
            Swal.fire({
              icon: 'error',
              title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'কিছু ভুল হয়েছে!' : 'Something Went Wrong!',
              timer: 3000,
              showConfirmButton: false
            });
          }
        }
      } else {
        Swal.fire({
          // icon: 'info',
          title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'অনুগ্রহপূর্বক অংশগ্রহণকারী সিলেক্ট করুন' : 'Please Select Participant(s).',
          timer: 3000,
          showConfirmButton: false
        });
        return;
      }
    }
  }

  async _deleteRoomBoxParticipant() {
    try {
      return await this.roomBoxService._deleteUsersFromExistingConference(this.data.selectedRoom.id, this.data.delUser).toPromise()
    } catch (error) {
      return error
    }
  }

  async addUserToExistingConference() {
    try {
      return await this.roomBoxService._addUsersToExistingConference(this.data.selectedRoom.id, this.participantData).toPromise()
    } catch (error) {
      return error
    }
  }

  async inviteRoomByContact(conferenceInfo, participantModel) {
    try {
      return this.roomBoxService.inviteRoom(conferenceInfo, participantModel).toPromise()
    } catch (error) {
      return error
    }
  }

  invteRoomByContactModelGenerator() {
    let contacts = []
    for (var i = 0; i < this.participantData.length; i++) {
      if (this.participantData[i].id !== undefined) {
        contacts.push(this.participantData[i])
        this.participantData.splice(i, 1);
        i--;
      }
    }
    console.log(contacts, this.participantData)
    return contacts
  }

  operation(list1, list2, isUnion?) {
    var result = [];

    for (var i = 0; i < list1.length; i++) {
      var item1 = list1[i],
        found = false;
      for (var j = 0; j < list2.length && !found; j++) {
        found = item1.email === list2[j].email;
      }
      if (found === !!isUnion) { // isUnion is coerced to boolean
        if (isUnion === undefined) {
          Object.assign(item1, { isChecked: false, room_user: false })
        } else {
          Object.assign(item1, { isChecked: true, room_user: true })
        }
        result.push(item1);
      }
    }
    return result;
  }
}


