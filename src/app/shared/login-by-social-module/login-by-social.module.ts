import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SocialLoginModule, AuthServiceConfig } from "angularx-social-login";
import { provideConfig } from './config';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SocialLoginModule
  ],
  providers:[{
    provide: AuthServiceConfig,
    useFactory: provideConfig
  }],
  exports: [SocialLoginModule]
})
export class LoginBySocialModule { }
