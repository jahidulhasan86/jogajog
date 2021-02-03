import { Component, NgModule, OnInit, Inject } from '@angular/core';
import { AdminDashboardService } from '../../../../shared/services/admin-dashboard/admin-dashboard.service';
import { NgxSpinnerService } from 'ngx-spinner';
// import * as Chartist from 'chartist';
import { DatePipe } from '@angular/common';
import { MatDialogRef, MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { MediaReporterService } from '../../../../shared/services/media-reporter/media-reporter.service';
import { MediaServerAdminService } from '../../../../shared/services/media-server-admin/media-server-admin.service';
import { ExportAsService, ExportAsConfig, SupportedExtensions } from 'ngx-export-as';
import Swal from 'sweetalert2';
// import * as Chart from 'chartist';
// import { ChartsModule } from 'ng2-charts/ng2-charts';
import { ChartDataSets, ChartOptions, ChartType } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';
import { Color, Label } from 'ng2-charts';

@Component({
	selector: 'app-error-report',
	templateUrl: './error-report.component.html',
	styleUrls: ['./error-report.component.scss']
})
export class ErrorReportComponent implements OnInit {
	public barChartOptions: ChartOptions = {
	};
	public barChartLabels: Label[] = [];
	public maxStreams = ['1000', '500'];
	public barChartType: ChartType = 'bar';
	public barChartLegend = true;
	public barChartPlugins = [pluginDataLabels];
	public response = [];
  
	public streamDataPoints = [];
	public bandWidthDataPoints = [];
	public maxDataSet: any = [];
	public serverUsageResponse: any = [];
	public barChartData: ChartDataSets[] = [
	  { data: this.streamDataPoints, label: 'Stream' },
	  { data: this.bandWidthDataPoints, label: 'Bandwidth' },
	];
    public barChartColors: Color[] = [
		{ backgroundColor: '#f49823' },
		{ backgroundColor: '#43a047c7' },
	  ]

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
	meetingFilter: any = { descriptions: '' };
	dtOptions: any = {};
	serverInstances: string;
	runningSessoins: number;
	totalErrors: number;
	totalServers: number;
	usedServers: number;
	constructor(private dashboardService: AdminDashboardService, private spinner: NgxSpinnerService,
		private mediaRptService: MediaReporterService,
		private mediaWebSocketService: MediaServerAdminService,
		public dialog: MatDialog, private datePipe: DatePipe, private exportAsService: ExportAsService) { }
	ngOnInit() {
		this.serverInstances = '1/1';
		this.runningSessoins = 0;
		this.totalErrors = 0;
		this.totalServers = 0;
		this.usedServers = 0;
		this.getServerUsageDetails();
		this.getRunningSessionDetails();
	}

	showParticipantDetails(data) {
		if (data.length === 0) {
			Swal.fire({
				title: 'Nothing Here.',
				showConfirmButton: false
			});
			return;
		}
		const dialogRef = this.dialog.open(ParticipantsDialogComponent, {
			disableClose: true,
			// minWidth: '80%',
			// maxHeight: '90%',
			data: {
				participants: data,
				parent: this
			}
		});
	}

	showErrorDetails(data) {
		if (data.length === 0) {
			Swal.fire({
				title: 'Nothing Here.',
				showConfirmButton: false
			});
			return;
		}
		const dialogRef = this.dialog.open(ErrorDialogComponent, {
			disableClose: true,
			minWidth: '80%',
			// maxHeight: '90%',
			data: {
				errors: data,
				parent: this
			}
		});
	}

	exportAs(type: SupportedExtensions, opt?: string) {
		this.config.type = type;
		if (opt) {
			this.config.options.jsPDF.orientation = opt;
		}
		const date = new Date();
		this.exportAsService.save(this.config, 'meeting_activity_report').subscribe(() => {
			// save started
		});
	}

	pdfCallbackFn(pdf: any) {
		// example to add page number as footer to every page of pdf
		const noOfPages = pdf.internal.getNumberOfPages();
		for (let i = 1; i <= noOfPages; i++) {
			pdf.setPage(i);
			pdf.text('Page ' + i + ' of ' + noOfPages, pdf.internal.pageSize.getWidth() - 100, pdf.internal.pageSize.getHeight() - 30);
		}
	}

	getRunningSessionDetails() {
		this.activityLogs = [];
		this.totalErrors = 0;
		this.runningSessoins = 0;
		this.spinner.show();
		this.mediaRptService.getRunningSessionDetails().subscribe(alog => {
			this.spinner.hide();
			if (alog.status === 'ok') {
				if (alog.resultset.length > 0) {
					this.runningSessoins = alog.resultset.length;
					alog.resultset.forEach(res => {
						this.totalErrors += res.events.length;
						if (res.participants.length > 0) {
							res.participants.forEach(p => {
								res.users.filter((u, i) => {
									if (p.user.user_id === u) {
										res.users[i] = p.user;
									}
								});
								if (res.events.length > 0) {
									res.events.filter((e, j) => {
										if (p.user.user_id === e.user_id) {
											res.events[j].user_name = p.user.user_name;
										}
										if (this.serverUsageResponse.length > 0) {
											this.serverUsageResponse.filter((sr, k) => {
												if (sr.conferences.length > 0) {
													sr.conferences.filter((c, l) => {
														if (c === e.conference_id) {
															res.events[j].server_name = sr.id;
														}
													});
												}
											});
										}
									});
								}
							});
						}
					});
					this.activityLogs = alog.resultset;
				} else {
					$('#rptTable').html('No Data Found!').css('text-align', 'center');
				}
			}
		});
	}


	getServerUsageDetails() {
		this.activityLogs = [];
		this.totalErrors = 0;
		this.runningSessoins = 0;
		this.usedServers = 0;
		this.spinner.show();
		this.mediaRptService.getServerDetails().subscribe(sd => {
			this.spinner.hide();
			if (sd.status === 'ok') {
				if (sd.resultset.length > 0) {
					this.serverUsageResponse = sd.resultset;
					this.totalServers = sd.resultset.length;
					this.serverUsageResponse.forEach((d, i) => {
						if (d.stream_count > 0) {
							this.usedServers++;
						}
						this.streamDataPoints.push(d.stream_count);
						this.bandWidthDataPoints.push(d.bandwidth);
						this.maxDataSet.push({instance: d.id = d.id && d.id.length === 36 ? 'server-' + i : d.id, ms: d.max_streams, mb: d.max_bandwidth });
						d.id = d.id && d.id.length === 36 ? 'server-' + i : d.id;
						this.barChartLabels.push(d.id);
					  });
					  this.barChartData = [
						{ data: this.streamDataPoints, label: 'Stream' },
						{ data: this.bandWidthDataPoints, label: 'Bandwidth' },
					  ];
					  const ddd = this;
					  this.barChartOptions = {
						responsive: true,
						maintainAspectRatio: false,
						legend: { position: 'bottom' },
						scales: {
							xAxes: [{
								gridLines: {
									// color: "rgba(0, 0, 0, 0)",
								},
								// barPercentage: 0.4
							},
						],
							yAxes: [{
								gridLines: {
									// color: "rgba(0, 0, 0, 0)",
								}
							}]
						},
						plugins: {
						  datalabels: {
							anchor: 'end',
							align: 'end',
						  }
						},
						tooltips: {
						  callbacks: {
							label: function (tooltipItem, data) {
							  let label: any = data.datasets[tooltipItem.datasetIndex].label || '';
							  if (label === 'Bandwidth') {
								label = '[Bandwidth] Used: ';
								// const findI = ddd.maxDataSet.findIndex(function(currentValue, index, arr), tooltipItem.label);
								const found = ddd.maxDataSet.findIndex(function (element, index) {
									if (element.instance === tooltipItem.label) {
										label += tooltipItem.yLabel + ' Total: ' + element.mb;
									}
								});
								// ddd.maxDataSet.forEach(x => {
								// 	if (x.instance === tooltipItem.label) {
								// 		label += tooltipItem.yLabel + ' Total: ' + x.mb;
								// 	}
								// });
								// if (tooltipItem.label === )
								// label += tooltipItem.yLabel + ' Total: ' + ddd.maxDataSet[tooltipItem.datasetIndex].mb;
							  } else {
								label = '[Stream] Used: ';
								const found = ddd.maxDataSet.findIndex(function (element, index) {
									if (element.instance === tooltipItem.label) {
										label += tooltipItem.yLabel + ' Total: ' + element.ms;
									}
								});
								// ddd.maxDataSet.forEach(x => {
								// 	if (x.instance === tooltipItem.label) {
								// 		label += tooltipItem.yLabel + ' Total: ' + x.ms;
								// 	}
								// });
								// label += tooltipItem.yLabel + ' Total: ' + ddd.maxDataSet[tooltipItem.datasetIndex].ms;
							  }
							  return label;
							}
						  }
						}
					  };
					// this.activityLogs = sd.resultset;
				} else {
					// $('#rptTabcle').html('No Data Found!').css('text-align', 'center');
				}
			}
		});
	}
}

@Component({
	templateUrl: './modal-meeting-participants-details.html',
	styleUrls: ['./error-report.component.scss']
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
			const startTime = this.data.parent.datePipe.transform(dataX.created_at, 'MMM d, y, h:mm:ss a');
			const tRow = '<tr><td>' + dataX.user.user_name + '</td><td>' + dataX.user.email + '</td><td>' + startTime + '</td></tr>';
			$('#pList').append(tRow);
		});
	}
	closeDialog(): void {
		this.dialogRef.close();
	}
}

@Component({
	templateUrl: './modal-meeting-error-details.html',
	styleUrls: ['./error-report.component.scss']
})
export class ErrorDialogComponent implements OnInit {
	errors: [];
	constructor(
		public dialogRef: MatDialogRef<ErrorDialogComponent>,
		@Inject(MAT_DIALOG_DATA) public data: any,
		private router: Router) {

	}
	ngOnInit(): void {
		if (this.data.errors.length > 0) {
			this.errors = this.data.errors;
		}
		// this.participants = this.data.participants;
		$('#pList').html('');
		this.errors.map(x => {
			const dataX: any = x;
			const startTime = this.data.parent.datePipe.transform(dataX.event_time, 'MMM d, y, h:mm:ss a');
			const tRow = '<tr><td>' + dataX.server_name + '</td><td>' + dataX.user_name + '</td><td>' + dataX.json.error_name + '</td><td>' +
				dataX.json.code + '</td><td>' + dataX.json.message + '</td><td>' + startTime + '</td></tr>';
			$('#pList').append(tRow);
		});
	}
	closeDialog(): void {
		this.dialogRef.close();
	}
}

