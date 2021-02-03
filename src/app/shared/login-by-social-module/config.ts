import { AuthServiceConfig } from "angularx-social-login";
import { GoogleLoginProvider, FacebookLoginProvider } from "angularx-social-login";
let config = new AuthServiceConfig([
  {
    id: GoogleLoginProvider.PROVIDER_ID,
    provider: new GoogleLoginProvider("655588029249-5ppd7jq7eaafbe3h7iru4r9v5bfksqr2.apps.googleusercontent.com")
  },
  {
    id: FacebookLoginProvider.PROVIDER_ID,
    provider: new FacebookLoginProvider("2625173074399244")
  }
]);

export function provideConfig() {
  return config;
}
