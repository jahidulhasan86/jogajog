import { Component, OnInit, ViewChild } from '@angular/core';
//import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort,MatSortable ,Sort} from '@angular/material/sort';
import { ContactService } from '../../shared/services/contact/contact.service';
import {MatDialog, MatDialogConfig} from '@angular/material/dialog';
import{ContactAddComponent} from './contact.add.component'
import { MatPaginator } from '@angular/material/paginator';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-contacts',
  templateUrl: './contacts.component.html',
  styleUrls: ['./contacts.component.scss']
})
export class ContactsComponent implements OnInit {
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  contacts:Contact[];
  contactNumbers = [];
  constructor(private contactService: ContactService, private dialog: MatDialog, private spinner: NgxSpinnerService,) { }
  dataSource: MatTableDataSource<Contact>;
  @ViewChild(MatSort) sort: MatSort;
  
  ngOnInit(): void {
    let contacts = [];
    this.dataSource = new MatTableDataSource<Contact>(contacts); 
    this.getContacts();
  /*  this.contacts = [
    {  name: 'Md. Jahidul Hasan', email: 'jahidulhasan86@gmail.com', mobile_number: '01716236606' },
    {  name: 'Md. Jahidul Hasan', email: 'jahidulhasan86@gmail.com', mobile_number: '01716236606' },
    {  name: 'Md. Jahidul Hasan', email: 'jahidulhasan86@gmail.com', mobile_number: '01716236606' },
    {  name: 'Md. Jahidul Hasan', email: 'jahidulhasan86@gmail.com', mobile_number: '01716236606' },
    {  name: 'Md. Jahidul Hasan', email: 'jahidulhasan86@gmail.com', mobile_number: '01716236606' },
  ]; */
  }

  openDialog() {

    const dialogConfig = new MatDialogConfig();

    dialogConfig.disableClose = true;
    dialogConfig.autoFocus = true;
    let dialogRef = this.dialog.open(ContactAddComponent,{
      width: '640px',disableClose: true} );
    //constant dialogRef =this.dialog.open(ContactAddComponent, dialogConfig);
    const subscribeDialog = dialogRef.componentInstance.saveContact.subscribe((data) => {
      console.log('dialog data', data);
      //i can see 'hello' from MatDialo
      this.contactService.addContact(data.name,data.email,data.mobile_number).subscribe((result) => {
        console.log(data);
         this.getContacts(); 
			
			});
      //this.contacts.push(data);
      dialogRef.close();
     
    });

dialogRef.afterClosed().subscribe(result => {      
  subscribeDialog.unsubscribe();
});

}
getContacts(){
  this.spinner.show()
  this.contactService.getContacts().subscribe((result) => {
    this.spinner.hide()
   this.contactNumbers = result;
   console.log('contactsNum:',this.contactNumbers)
    this.dataSource = new MatTableDataSource<Contact>(result);
    // this.dataSource.paginator = this.paginator;
    
  });
}
sortContact(sort: Sort) {
 /*  const data = this.foods.slice();
  if (!sort.active || sort.direction === '') {
     this.sortedFood = data;
     return;
  } */
/*   this.sortedFood = data.sort((a, b) => {
     const isAsc = sort.direction === 'asc';
     switch (sort.active) {
        case 'name': return compare(a.name, b.name, isAsc);
        case 'calories': return compare(a.calories, b.calories, isAsc);
        case 'fat': return compare(a.fat, b.fat, isAsc);
        case 'carbs': return compare(a.carbs, b.carbs, isAsc);
        case 'protein': return compare(a.protein, b.protein, isAsc);
        default: return 0;
     } 
  }); */
  this.dataSource.sort.sort(<MatSortable>({ id: 'name', start: 'asc' })); 
  this.dataSource.data.sort((a: any, b: any) => {
    if (a.name < b.name) {
        return -1;
    } else if (a.name > b.name) {
        return 1;
    } else {
        return 0;
    }
}); 

}
}
export class Contact {
  name: string;
  //position: number;
  email: string;
  mobile_number: string;
  type: string;

  constructor( name?: string,  email?: string, type?: string){
    this.name = name;
    this.email = email;
    this.type = type;

  }
}

