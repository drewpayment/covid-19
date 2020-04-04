import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatCardModule } from '@angular/material/card';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSelectModule } from '@angular/material/select';
import { MatGridListModule } from '@angular/material/grid-list';

@NgModule({
    imports: [
        MatProgressSpinnerModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        ScrollingModule,
        MatTableModule,
        MatSortModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatExpansionModule,
        MatMomentDateModule,
        MatCardModule,
        MatSidenavModule,
        MatSelectModule,
        MatGridListModule,
    ],
    exports: [
        MatProgressSpinnerModule,
        MatToolbarModule,
        MatListModule,
        MatIconModule,
        ScrollingModule,
        MatTableModule,
        MatSortModule,
        MatTooltipModule,
        MatFormFieldModule,
        MatButtonModule,
        MatInputModule,
        MatExpansionModule,
        MatMomentDateModule,
        MatCardModule,
        MatSidenavModule,
        MatSelectModule,
        MatGridListModule,
    ]
})
export class MaterialModule {}
