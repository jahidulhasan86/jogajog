import { Component, OnInit } from '@angular/core';
import {RecordingService} from '../../shared/services/recording/recording.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router'

@Component({
  selector: 'app-recording',
  templateUrl: './recording.component.html',
  styleUrls: ['./recording.component.scss']
})
export class RecordingComponent implements OnInit {

  recordingList = [];
  authUser: any;
  spinnerText: string;
	spinnerBGColor = 'rgba(13,12,12,0.8)';
	spinnerType = 'ball-clip-rotate-multiple'
  constructor(private recordingService : RecordingService, private spinner : NgxSpinnerService, private router : Router) { 
    
  }

  ngOnInit(): void {
    this.spinner.show();
		this.authUser = JSON.parse(localStorage.getItem('sessionUser'));
    
    this.recordingService.getRecordings(this.authUser.user_name, null, null).subscribe((x) =>{
      if(x.status == "ok")
      {
        let url = window.location.origin;
        console.log(url);
        this.spinner.hide();
        x.resultset.forEach(element => {
          url = url + "#/" + "playback?" + "meeting_id=" + element.meeting_id + "&session_id=" + element.session_id;
          element.url = url;
          this.recordingList.push(element);
          url = window.location.origin;
        });
      }
    })
    
  }

  searchByName() {
    var input, filter, table, tr, td, i, txtValue;
    input = document.getElementById("myInputSearch");
    filter = input.value.toUpperCase();
    table = document.getElementById("rptTable");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[0];
      if (td) {
        txtValue = td.textContent || td.innerText;
        if (txtValue.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }       
    }
  }

}
