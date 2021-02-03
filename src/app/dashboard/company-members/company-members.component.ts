import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MultiCompanyService } from 'src/app/shared/services/multi-company/multi-company.service';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { AddMembersComponent } from 'src/app/dashboard/add-members/add-members.component';

@Component({
  selector: 'app-company-members',
  templateUrl: './company-members.component.html',
  styleUrls: ['./company-members.component.scss']
})
export class CompanyMembersComponent implements OnInit {

  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort) sort: MatSort;
  displayedColumns: string[] = ['position', 'user_name', 'email', 'contact'];
  dataSource: MatTableDataSource<Employee>;
  currentUser: any;
  constructor(private multiCompanyService: MultiCompanyService, public dialog: MatDialog) { }

  ngOnInit(): void {
    this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
    this.getCompanyEmployee()
  }

  getCompanyEmployee(){
    this.multiCompanyService.getCompanyEmployee().subscribe((result) => {
      if(result.status == 'ok'){
        console.log(result)
        this.dataSource = new MatTableDataSource<Employee>(result.resultset);
        this.dataSource.paginator = this.paginator;
        this.dataSource.sort = this.sort;
      }
    }, err => {
      this.dataSource = new MatTableDataSource<Employee>([]);
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;
      console.log(err)
    })
  }

  openAddContactWindow(){
    const dialogRef = this.dialog.open(AddMembersComponent, {
      width: '35%'
    });
  }

}

export interface Employee {
  user_name: string;
  position: number;
  email: string;
  contact: string;
}

// const ELEMENT_DATA: Contact[] = [
//   { position: 1, name: 'Md. Jahidul Hasan', email: 'jahidulhasan86@gmail.com', mobile_number: '01716236606' },
//   { position: 2, name: 'Md. Jahidul Hasan', email: 'jahidulhasan86@gmail.com', mobile_number: '01716236606' },
//   { position: 3, name: 'Md. Jahidul Hasan', email: 'jahidulhasan86@gmail.com', mobile_number: '01716236606' },
//   { position: 4, name: 'Md. Jahidul Hasan', email: 'jahidulhasan86@gmail.com', mobile_number: '01716236606' },
//   { position: 5, name: 'Md. Jahidul Hasan', email: 'jahidulhasan86@gmail.com', mobile_number: '01716236606' },
// ];
