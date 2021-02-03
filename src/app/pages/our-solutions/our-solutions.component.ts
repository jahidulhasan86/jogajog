import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-our-solutions',
  templateUrl: './our-solutions.component.html',
  styleUrls: []
})
export class OurSolutionsComponent implements OnInit {

  constructor() { }

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
