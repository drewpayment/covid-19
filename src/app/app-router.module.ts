import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { PublicComponent } from './public/public.component';
import { environment } from '../environments/environment';
import { VideoIntroComponent } from './video-intro/video-intro.component';
import { CountryDetailComponent } from './country-detail/country-detail.component';
import { HomeComponent } from './home/home.component';

const routes: Route[] = [
    {
        path: '',
        component: HomeComponent
    },
    {
        path: 'intro', 
        component: VideoIntroComponent
    },
    {
        path: 'countries',
        component: PublicComponent
    },
    {
        path: 'country/:id',
        component: CountryDetailComponent
    },
    {
        path: '**', 
        redirectTo: ''
    }
];

@NgModule({
    imports: [
        RouterModule.forRoot(
            routes,
            { enableTracing: !environment.production && false }
        )
    ],
    exports: [
        RouterModule
    ]
})
export class AppRouterModule {
    constructor() {}
}
