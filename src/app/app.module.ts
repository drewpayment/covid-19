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
import { CountriesGraphComponent } from './countries-graph/countries-graph.component';
import { HomeComponent } from './home/home.component';
import { FooterComponent } from './footer/footer.component';
import { ContagionComponent } from './contagion/contagion.component';
import { DecimalPipe } from '@angular/common';
import { HighchartsChartModule } from 'highcharts-angular';
import { CountyDialogComponent } from './contagion/county-dialog/county-dialog.component';

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
    declarations: [
        AppComponent,
        InfiniteScrollComponent,
        // MapComponent,
        PublicComponent,
        VideoIntroComponent,
        CountryDetailComponent,
        CountriesGraphComponent,
        HomeComponent,
        FooterComponent,
        ContagionComponent,
        CountyDialogComponent
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
        HighchartsChartModule,

        // APP ROUTER
        AppRouterModule
    ],
    entryComponents: [
        CountyDialogComponent
    ],
    providers: [
        DecimalPipe
    ],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }
