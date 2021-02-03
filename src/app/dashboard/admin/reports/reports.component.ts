import { Component, OnInit, Inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ReportServicesService } from '../../../shared/services/reports/report-services.service';
import { ExportAsService, ExportAsConfig, SupportedExtensions } from 'ngx-export-as';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['../material-dashboard.scss', './reports.component.scss']
})
export class ReportsComponent implements OnInit {

  config: ExportAsConfig = {
    type: 'xlsx',
    elementIdOrContent: 'rptTable',
    options: {
      // jsPDF: {
      //   orientation: 'landscape'
      // },
      // pdfCallbackFn: this.pdfCallbackFn // to add header and footer
    }
  };

  daySelected: number;
  activityLogs: [];
  meetingFilter: any = { meeting_name: '' };
  dtOptions: any = {};

  constructor(public spinner: NgxSpinnerService, private rptService: ReportServicesService,
	public dialog: MatDialog, private datePipe: DatePipe, private exportAsService: ExportAsService) { }
  ngOnInit() {

	this.daySelected = 3;
	this.fetchActivityReport('#initCall', 2);
  }

  showParticipantDetails(data) {
	const dialogRef = this.dialog.open(ParticipantsDialogComponent, {
		disableClose: true,
		minWidth: '80%',
		// maxHeight: '90%',
		data: {
		participants: data,
		parent : this
		}
	});
  }

  exportAs(type: SupportedExtensions, opt?: string) {
    this.config.type = type;
    if (opt) {
      this.config.options.jsPDF.orientation = opt;
    }
    let date = new Date();
    this.exportAsService.save(this.config, 'meeting_activity_report').subscribe(() => {
      // save started
    });
  }

  pdfCallbackFn (pdf: any) {
    // example to add page number as footer to every page of pdf
    const noOfPages = pdf.internal.getNumberOfPages();
    for (let i = 1; i <= noOfPages; i++) {
      pdf.setPage(i);
      pdf.text('Page ' + i + ' of ' + noOfPages, pdf.internal.pageSize.getWidth() - 100, pdf.internal.pageSize.getHeight() - 30);
    }
  }

  fetchActivityReport(targrt, days) {
	this.activityLogs = [];
	$('.btn').addClass('btn-primary');
	$('.btn').removeAttr('disabled');
	$(targrt).removeClass('btn-primary');
	$(targrt).attr('disabled', 'disabled');
	this.spinner.show();
	this.rptService.getMeetingActivityInfo(days).subscribe(alog => {
		this.spinner.hide();
		if (alog.status === 'ok') {
		if (alog.result.length > 0) {
			this.activityLogs = alog.result;
		}
		}
		this.daySelected = days;
	});
  }
}

@Component({
  templateUrl: './modal-meeting-participants-details.html',
  styleUrls: ['../material-dashboard.scss']
})
export class ParticipantsDialogComponent implements OnInit {
  participants: [];
  constructor(
	public dialogRef: MatDialogRef<ParticipantsDialogComponent>,
	@Inject(MAT_DIALOG_DATA) public data: any,
	private router: Router) {

  }
  ngOnInit(): void {
	if (this.data.participants.length > 0) {
		this.participants = this.data.participants;
	}
	// this.participants = this.data.participants;
	$('#pList').html('');
	this.participants.map(x => {
		const dataX: any = x;
		const isGuest = dataX.is_guest ? 'yes' : 'no';
		const startTime = this.data.parent.datePipe.transform(dataX.start_time, 'MMM d, y, h:mm:ss a');
		const endTime = this.data.parent.datePipe.transform(dataX.end_time, 'MMM d, y, h:mm:ss a');
		const tRow = '<tr><td>' + dataX.participant_name + '</td><td>' + dataX.participant_mail + '</td><td>' +
		isGuest + '</td><td>' + startTime + '</td><td>' + endTime + '</td><td>' + dataX.duration + ' min</td></tr>';
		$('#pList').append(tRow);
	});
  }
  closeDialog(): void {
	this.dialogRef.close();
  }
}

