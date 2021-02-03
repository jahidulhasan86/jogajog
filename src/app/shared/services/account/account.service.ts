import { Injectable } from '@angular/core';
// import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { map, catchError, flatMap, mergeMap, toArray, tap, switchMap, concatMap } from 'rxjs/operators';
import { Observable, throwError, Subject, BehaviorSubject, of } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalValue } from '../../../global';
import { AuthService, FacebookLoginProvider, GoogleLoginProvider } from 'angularx-social-login';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
	providedIn: 'root'
})
export class AccountService {
	signInURL = `${GlobalValue.alert_circel_Service_Url}/account/signin`;
	guestTokenURL = `${GlobalValue.alert_circel_Service_Url}/account/guesttoken`;
	getTokenURL = `${GlobalValue.alert_circel_Service_Url}/account/token`;
	signupUrl = `${GlobalValue.alert_circel_Service_Url}/account/signup`;
	signInFbURL = `${GlobalValue.alert_circel_Service_Url}/account/token/provider`
	signOutFbURL = `${GlobalValue.alert_circel_Service_Url}/account/logout/facebook`


	token0AuthURL = GlobalValue.alert_circel_Service_Url + '/oauth/token'
	checkAuthorizedURL = GlobalValue.alert_circel_Service_Url + '/oauth/check-authorized'
	authorizeURL = GlobalValue.alert_circel_Service_Url + '/oauth/authorize'

	updatePasswordURL = GlobalValue.alert_circel_Service_Url + '/user/changePassword'
	updateProfileURL = GlobalValue.alert_circel_Service_Url + '/user/update'
	forgetPasswordUrl  = `${GlobalValue.alert_circel_Service_Url}/account/forgotpassword`
	resetPasswordUrl  = `${GlobalValue.alert_circel_Service_Url}/account/resetpassword/`

	//resetPasswordUrl  = 'http://localhost:4002/api/v1/account/resetpassword'
	currentUser: any = null;
	login_location: any
	isRequiredRegistration: any
	private isUserLoggedIn = new BehaviorSubject<boolean>(false);
	private authUserInfo = new BehaviorSubject<any>('');
	public registerDialogOpen$ = new BehaviorSubject<boolean>(false);
	registerDialogCast = this.registerDialogOpen$.asObservable();
	private languageChanger = new BehaviorSubject<any>('');
	helper: JwtHelperService;

	constructor(private http: HttpClient, private authService: AuthService) {
		this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
	}

	signup(body, overlapping?) {
		console.log('<========Signup Service called========>');
		const overlappingFlag = overlapping ? true : false;
		const headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this.http.post(this.signupUrl + '?overlapping=' + overlappingFlag, body, { headers: headers }).pipe(
			map((x: any) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	forgetPassword(body) {
		console.log('<========Forget Password Service called========>');
		
		const headers = new HttpHeaders().set('Content-Type', 'application/json');
		body.app_name = GlobalValue.app_name;
		return this.http.post(this.forgetPasswordUrl , body, { headers: headers }).pipe(
			map((x: any) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	resetPassword(body,token) {
		console.log('<========Reset Password Service called========>');
		
		const headers = new HttpHeaders().set('Content-Type', 'application/json');
		
		let url = this.resetPasswordUrl+token;
		return this.http.post(url , body, { headers: headers }).pipe(
			map((x: any) => x),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}


	signIn(email: string, password: string): Observable<any> {
		console.log('<========Sign in service called========>');
		const headers = new HttpHeaders().set('Content-Type', 'application/json');
		const body = JSON.stringify({ user_name: email, password: password, app_id: GlobalValue.app_id });
		return this.http.post(this.signInURL, body, { headers: headers }).pipe(
			map((x: Response) => x),
			map((x: any) => x.result),
			concatMap((x) => {
				return of(x).pipe(
					mergeMap((x) => {
						const user_info = x;

						const getTokenBody = {
							app_id: GlobalValue.app_id,
							company_id: x.user_session ? x.user_session.last_company_id != null ? x.user_session.last_company_id : GlobalValue.company_id : GlobalValue.company_id,
							access_token: x.access_token
						};

						console.log('<========Get token service service is called========>');
						return this.http.post(this.getTokenURL, getTokenBody, { headers: headers }).pipe(
							map((x: Response) => x),
							tap((x: any) => {
								const { access_token, app_id, company_id, role, is_company_admin } = x.result;
								Object.assign(user_info, {
									access_token: access_token,
									app_id: app_id,
									company_id: company_id,
									is_company_admin: is_company_admin,
									role: !role ? { role_name: "individual", role_type: "1" } : role,
									password: password
								});
								localStorage.setItem('sessionUser', JSON.stringify(user_info));
								// localStorage.setItem('profile_pic', JSON.stringify(user_info.profile_pic));
								localStorage.setItem('token', JSON.stringify(user_info.access_token));
								this.currentUser = user_info;
								this.userLoginGenerator(!!localStorage.getItem('sessionUser'));
								this.authUserInfo.next(JSON.parse(localStorage.getItem('sessionUser')));
							})
						);
					})
				);
			}),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	guestLogin(email: string, display_name: string): Observable<any> {
		console.log('<========guestLogin service called========>');
		const headers = new HttpHeaders().set('Content-Type', 'application/json');
		const body = JSON.stringify({ email: email, name: display_name, app_id: GlobalValue.app_id, company_id: GlobalValue.company_id });

		return this.http.post(this.guestTokenURL, body, { headers: headers }).pipe(
			map((x: Response) => x),
			tap((x: any) => {
				const { access_token, role, user } = x.result;
				let user_info = user
				Object.assign(user_info, {
					role: role,
					access_token: access_token,
				});

				localStorage.setItem('sessionUser', JSON.stringify(user_info));
				localStorage.setItem('profile_pic', JSON.stringify(user_info.profile_pic));
				localStorage.setItem('token', JSON.stringify(access_token));
				this.currentUser = user_info;
				this.userLoginGenerator(!!localStorage.getItem('sessionUser'));
				this.authUserInfo.next(JSON.parse(localStorage.getItem('sessionUser')));

			}),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	signOut() {
		this.currentUser = null;

		this.authService.signOut().then((x) => {
			console.log(x)
		}).catch((x) => {
			console.log(x)
		})

		if (GlobalValue.currentBuild == 'bn') {
			const getSelected_lang = localStorage.getItem('selected_lang');
			localStorage.clear();
			if (getSelected_lang != null) {
				localStorage.setItem('selected_lang', getSelected_lang);
			}
		} else {
			localStorage.clear();
		}
		this.userLoginGenerator(!!localStorage.getItem('sessionUser'));
		this.authUserInfo.next('');

		return true;
	}

	passwordUpdate(body){
		console.log('<========Password update service called========>');
		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: JSON.parse(localStorage.getItem('token'))
			 })
		};
		return this.http.post(this.updatePasswordURL, body, httpOptions).pipe(
			map((x: any) => x),
			catchError((error: Response) => {
				return throwError(error);
			 })
		);
	}
	profileUpdate(body):Observable<any>{
		console.log('<========Profile update service called========>');
		const httpOptions = {
		headers: new HttpHeaders({
			'Content-Type': 'application/json',
			Authorization: JSON.parse(localStorage.getItem('token'))
		 })
		};
		return this.http.post(this.updateProfileURL, body, httpOptions).pipe(
		map((x: any) => x),
		catchError((error: Response) => {
			return throwError(error);
		 })
		);
	}
	loggedIn() {
		return !!localStorage.getItem('sessionUser');
	}

	userLoginChecker() {
		return this.isUserLoggedIn.asObservable();
	}

	userLoginGenerator(is_sessionUserExist) {
		this.isUserLoggedIn.next(is_sessionUserExist);
		if (is_sessionUserExist) {
			this.authUserInfo.next(JSON.parse(localStorage.getItem('sessionUser')));
		}
	}

	getAuthUserInfo() {
		return this.authUserInfo.asObservable();
	}

	getLanguage() {
		return this.languageChanger.asObservable();
	}

	setLanguage(language) {
		this.languageChanger.next(language);
	}

	socialSignIn(socialObj) {
		let body = {
			app_id: GlobalValue.app_id,
			company_id: GlobalValue.company_id,
			provider: socialObj.provider.toLowerCase(),
			profile_id: socialObj.id,
			user_name: null,
			profile_pic: socialObj.photoUrl,
			first_name: socialObj.firstName,
			last_name: socialObj.lastName,
			password: socialObj.id,
			app_name: GlobalValue.app_name,
			company_name: GlobalValue.company_name,
			email: socialObj.email,
			token: socialObj.authToken
		}

		console.log(body)

		console.log('<========Sign in by facebook service called========>');
		const headers = new HttpHeaders().set('Content-Type', 'application/json');
		return this.http.post(this.signInFbURL, body, { headers: headers }).pipe(
			map((x: any) => x),
			map((x: any) => x.result),
			concatMap((x) => {
				return of(x).pipe(
					mergeMap((x) => {
						console.log('<========Get token service called========>');
						return this.http.post(this.getTokenURL, { app_id: GlobalValue.app_id, company_id: GlobalValue.company_id, access_token: x.access_token }, { headers: headers }).pipe(
							map((x: Response) => x),
							tap((x: any) => {
								const decodeResult = this.tokenDecoder(x.result.access_token)
								if (!!decodeResult) {
									Object.assign(x.result, {
										...decodeResult,
										is_company_admin: null,
										password: socialObj.id,
										profile_pic: socialObj.photoUrl,
										first_name: socialObj.firstName,
										last_name: socialObj.lastName
									});
								}
								localStorage.setItem('sessionUser', JSON.stringify(x.result));
								// localStorage.setItem('profile_pic', JSON.stringify(x.result.profile_pic));
								localStorage.setItem('token', JSON.stringify(x.result.access_token));
								this.currentUser = x.result;
								this.userLoginGenerator(!!localStorage.getItem('sessionUser'));
								this.authUserInfo.next(JSON.parse(localStorage.getItem('sessionUser')));
							})
						);
					})
				);
			}),

			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}

	private tokenDecoder(token) {
		this.helper = new JwtHelperService();
		return this.helper.decodeToken(token);
	}


	// Oauth implementations start here
	token0Auth(email: string, password: string): Observable<any> {
		console.log('<========Token 0Auth wtih (grant_type: password) service called========>');
		const headers = new HttpHeaders().set('Content-Type', 'application/json');
		const body = JSON.stringify({ user_name: email, password: password, grant_type: "password" });
		return this.http.post(this.token0AuthURL, body, { headers: headers }).pipe(
			map((x: Response) => x),
			map((x: any) => x.result),
			concatMap((x) => {
				return of(x).pipe(
					mergeMap((x) => {
						const { access_token } = x
						console.log('<========Check authorized 0Auth service called========>');
						const httpOptions = {
							headers: new HttpHeaders({
								'Content-Type': 'application/json',
								Authorization: access_token
							})
						}
						return this.http.post(this.checkAuthorizedURL, { app_id: GlobalValue.app_id }, httpOptions).pipe(
							map((x: any) => {
								if (!!x) Object.assign(x.result, { access_token: access_token })
								return x
							}),
						);
					})
				);
			}),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}
	authorize(result, loginModel): Observable<any> {
		console.log('<========Authorize 0Auth service called========>');

		const httpOptions = {
			headers: new HttpHeaders({
				'Content-Type': 'application/json',
				Authorization: result.access_token
			})
		}

		let body = {
			app_id: GlobalValue.app_id,
			company_id: result.user_session ? result.user_session.last_company_id != null ? result.user_session.last_company_id : GlobalValue.company_id : GlobalValue.company_id,
		}

		return this.http.post(this.authorizeURL, body, httpOptions).pipe(
			map((x: Response) => x),
			map((x: any) => x.result),
			concatMap((x) => {
				return of(x).pipe(
					mergeMap((x) => {
						console.log('<========Token 0Auth with (grant_type: authorization_code) service called========>');

						const headers = new HttpHeaders().set('Content-Type', 'application/json');

						return this.http.post(this.token0AuthURL, { grant_type: 'authorization_code', authorization_code: x.authorization_code }, { headers: headers }).pipe(
							map((x: Response) => x),
							tap((x: any) => {

								x.result.created ? delete x.result.created : null
								x.result.updated ? delete x.result.updated : null
								x.result.permissions.length == 0 ? delete x.result.permissions : null

								Object.assign(x.result, {
									is_company_admin: !x.result.is_company_admin ? false : x.result.is_company_admin,
									role: !x.result.role ? { role_name: "individual", role_type: "1" } : x.result.role,
									password: loginModel.password
								});

								localStorage.setItem('sessionUser', JSON.stringify(x.result));
								localStorage.setItem('token', JSON.stringify(x.result.access_token));

								this.currentUser = x.result;

								this.userLoginGenerator(!!localStorage.getItem('sessionUser'));
								this.authUserInfo.next(JSON.parse(localStorage.getItem('sessionUser')));
							})
						);
					})
				);
			}),
			catchError((error: Response) => {
				return throwError(error);
			})
		);
	}
}
