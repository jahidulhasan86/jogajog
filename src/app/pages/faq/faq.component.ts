import { Component, OnInit } from '@angular/core';
import { GlobalValue } from 'src/app/global';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styleUrls: ['./faq.component.scss']
})
export class FaqComponent implements OnInit {
  globalValue: any
  constructor() {
  this.globalValue = GlobalValue
   }

  ngOnInit(): void {
  }
  ngAfterViewInit(){
    setTimeout(() => {
      $('html,body').animate({
        scrollTop: $(".header-area").offset().top
      }, 'fast');
      }, 200);
    }

}
