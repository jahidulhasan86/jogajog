import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';

@Component({
  selector: 'app-learn-together',
  templateUrl: './learn-together.component.html',
  styleUrls: []
})
export class LearnTogetherComponent implements OnInit {
  content: any;

  constructor(
    public dialogRef: MatDialogRef<LearnTogetherComponent>,
    private dialog: MatDialog,
    @Inject(MAT_DIALOG_DATA) public data: any, private router: Router
  ) {
    this.content = this.data.content
    console.log(this.data.content)
  }

  ngOnInit(): void {
  }
  closeDialog() {
    this.dialogRef.close();
  }

  goApps(type) {
    if (type == 'not_available') {
      Swal.fire({
        title: (!!localStorage.getItem('selected_lang') && localStorage.getItem('selected_lang') === 'bn') ? 'শীঘ্রই আসবে| আপনি যদি প্রাইভেট ডেমোর ব্যাপারে আগ্রহী হোন তাহলে আমাদের সাথে যোগাযোগ করুন|' : 'Coming Soon. If you are interested in a private demo, please contact us.',
        showConfirmButton: false
      })
    } else {
      console.log(type)
      this.closeDialog()
      if(type == 'teamTogether') {
        this.router.navigate(['/teamTogether'])

        // setTimeout(() => {
        //   $('html,body').animate({
        //     scrollTop: $(".teamToG").offset().top
        //   }, 'slow');
        // }, 200);

      }else{
        this.router.navigate(['/learnTogether'])

        // setTimeout(() => {
        //   $('html,body').animate({
        //     scrollTop: $(".l2t").offset().top
        //   }, 'slow');
        // }, 200);
      }
    }
  }

}
