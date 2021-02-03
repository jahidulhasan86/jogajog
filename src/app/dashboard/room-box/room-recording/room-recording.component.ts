import { Component, OnInit, Input } from '@angular/core';
import { RecordingService } from 'src/app/shared/services/recording/recording.service';

@Component({
  selector: 'app-room-recording',
  templateUrl: './room-recording.component.html',
  styleUrls: ['./room-recording.component.scss']
})
export class RoomRecordingComponent implements OnInit {
  recordingList = []

  @Input() roomId;

  constructor(private recordingService: RecordingService) { }

  ngOnInit(): void {
    if(!!this.roomId){
      this.getRecordingByMeetingId()
    }
  }

  getRecordingByMeetingId(){
    this.recordingService.getRecordingByMeetingId(this.roomId).subscribe((result) => {
      if(result.status == 'ok'){
        console.log(result)
        this.recordingList = result.resultset
      }
    }, (error) => {
      console.log(error)
    })
  }

}
