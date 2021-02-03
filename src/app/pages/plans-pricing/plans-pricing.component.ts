

import { Component, OnInit, AfterViewInit } from '@angular/core';
import { GlobalValue } from '../../global'

import { AccountService } from '../../shared/services/account/account.service';


@Component({
  selector: 'app-plans-pricing',
  templateUrl: './plans-pricing.component.html',
  styleUrls: ['./plans-pricing.component.scss']
})
export class PlansPricingComponent implements OnInit {
  globalValue: any;
  
  panelOpenState = true;
  isLeftVisible = true;

  collapseInfo = [true, false, false, false, false]

  bnEnLanguageCheck: any;

  constructor(private accountService: AccountService) { 
    this.globalValue = GlobalValue;
    this.accountService.getLanguage().subscribe((result) => {
      this.bnEnLanguageCheck = result;
    });
  }

  ngOnInit(): void {
    this.globalValue = GlobalValue
  }
 
  changeToogle(value){
	// if(this. isLeftVisible == true){
	// 	this.isLeftVisible = false
	// } else {
	// 	this.isLeftVisible = true
	// }
	  this.isLeftVisible = value
  }
  toggleCollapseMenuWithInfo(id){
    

    for(let i =0; i <5; i++){
      if(i == id){
        if(this.collapseInfo[id] == true) {
          this.collapseInfo[id] = false
        } else {
          this.collapseInfo[id] = true;
        }
      }else {
        this.collapseInfo[i] = false
      }
    }
    
  }
}

