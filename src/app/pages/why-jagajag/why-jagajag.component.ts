import { Component, OnInit } from '@angular/core';
import { GlobalValue } from '../../global'
import { AccountService } from '../../shared/services/account/account.service';
@Component({
  selector: 'app-why-jagajag',
  templateUrl: './why-jagajag.component.html',
  styleUrls: ['./why-jagajag.component.scss']
})
export class WhyJagajagComponent implements OnInit {
  globalValue: any;
  bnEnLanguageCheck: any;
  constructor(private accountService: AccountService) {
    this.globalValue = GlobalValue;
    this.accountService.getLanguage().subscribe((result) => {
      this.bnEnLanguageCheck = result;
    });
  }

  ngOnInit(): void {
  }

}
