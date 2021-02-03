import { NgModule } from '@angular/core';

import { MatBadgeModule } from '@angular/material/badge';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatOptionModule, MatNativeDateModule } from '@angular/material/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSliderModule } from '@angular/material/slider';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatListModule} from '@angular/material/list';
import {MatMenuModule} from '@angular/material/menu';
import {MatRadioModule} from '@angular/material/radio';
import {MatTableModule} from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import {MatChipsModule} from '@angular/material/chips';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatSelectModule} from '@angular/material/select';

@NgModule({
	imports: [],
	exports: [
		MatCheckboxModule,
		NgxMaterialTimepickerModule,
		MatDatepickerModule,
		MatProgressBarModule,
		MatSnackBarModule,
		MatTooltipModule,
		MatToolbarModule,
		MatSliderModule,
		MatSelectModule,
		MatProgressSpinnerModule,
		MatInputModule,
		MatGridListModule,
		MatSidenavModule,
		MatFormFieldModule,
		MatDialogModule,
		MatIconModule,
		MatBadgeModule,
		MatButtonModule,
		MatCardModule,
		MatOptionModule,
		MatNativeDateModule,
		MatListModule,
		MatMenuModule,
		MatRadioModule,
		MatTableModule,
		MatSortModule,
		MatPaginatorModule,
		MatChipsModule,
		MatExpansionModule,
		MatSelectModule
		
	],
	declarations: []
})
export class MaterialModule {}
