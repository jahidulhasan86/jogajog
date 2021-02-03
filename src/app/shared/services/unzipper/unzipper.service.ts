/*

 * Copyright (c) 2004-2020 by Protect Together Inc.

 * All Rights Reserved

 * Protect Together Inc Confidential

 */
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { GlobalValue } from '../../../global';
import { map, catchError, flatMap, mergeMap, toArray, tap, switchMap, concatMap } from 'rxjs/operators';
import { Observable, throwError, Subject, BehaviorSubject, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UnzipperService {
  private getUnzipperUrl = `${GlobalValue.unzipper_BaseUrl}unzipFiles`;

  constructor(private http:HttpClient) { }

  DownloadandUnzipFiles(recordginId, zipfile, ovip?) {
    // this.currentUser = JSON.parse(localStorage.getItem('sessionUser'));
    //  Authorization: JSON.parse(localStorage.getItem('token'))
    console.log(this.getUnzipperUrl);
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json'
      })
    };
    return this.http.get(ovip + '/unzipper/unzipper/unzipFiles' + "?id=" + recordginId + "&zipfile=" + zipfile, httpOptions)
    .pipe(
      map((x: any) => {
        return x;
      }),
      catchError((error: Response) => {
        return throwError(error);
      })
    )
  }
}
