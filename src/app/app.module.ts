import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { InfiniteScrollComponent } from './infinite-scroll/infinite-scroll.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { MapComponent } from './map/map.component';
import { PublicComponent } from './public/public.component';
import { AppRouterModule } from './app-router.module';
import { VideoIntroComponent } from './video-intro/video-intro.component';
import { CountryDetailComponent } from './country-detail/country-detail.component';
// import { NgxChartsModule } from '@swimlane/ngx-charts';
import * as PlotlyJS from 'plotly.js/dist/plotly.js';
import { PlotlyModule } from 'angular-plotly.js';

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
    declarations: [
        AppComponent,
        InfiniteScrollComponent,
        // MapComponent,
        PublicComponent,
        VideoIntroComponent,
        CountryDetailComponent
    ],
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,
        // NgxChartsModule,
        PlotlyModule,

        AppRouterModule
    ],
    providers: [],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }
