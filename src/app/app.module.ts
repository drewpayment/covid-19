import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { CommonModule } from '@angular/common';
import { MaterialModule } from './material.module';
import { InfiniteScrollComponent } from './infinite-scroll/infinite-scroll.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MapComponent } from './map/map.component';
import { PublicComponent } from './src/app/public/public.component';
import { AppRouterModule } from './app-router.module';

@NgModule({
    declarations: [
        AppComponent,
        InfiniteScrollComponent,
        MapComponent,
        PublicComponent
    ],
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MaterialModule,
        FormsModule,
        ReactiveFormsModule,

        AppRouterModule
    ],
    providers: [],
    bootstrap: [
        AppComponent
    ]
})
export class AppModule { }
