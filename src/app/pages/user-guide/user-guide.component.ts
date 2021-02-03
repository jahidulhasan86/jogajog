import { Component, OnInit } from '@angular/core';
import { GlobalValue } from 'src/app/global';
@Component({
  selector: 'app-user-guide',
  templateUrl: './user-guide.component.html',
  styleUrls: ['./user-guide.component.scss']
})


export class UserGuideComponent implements OnInit {
  globalValue: any;
  constructor() { }

  ngOnInit(): void {
    this.globalValue = GlobalValue;
  }

  ngAfterViewInit(){
    setTimeout(() => {
      $('html,body').animate({
        scrollTop: $(".header-area").offset().top
      }, 'fast');
      }, 200);
    }
}
