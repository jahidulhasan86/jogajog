import { Component, OnInit, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styleUrls: []
})
export class PagesComponent implements OnInit, AfterViewInit {

  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.languageTabSelector()
    }, 1);
  }
  
  languageTabSelector() {
		const selected_lang = document.getElementById((!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'en') ? 'enID' : 'bnID') as HTMLInputElement
		if (selected_lang) selected_lang.click()
	}

}
