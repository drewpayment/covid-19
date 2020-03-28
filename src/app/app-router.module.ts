import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { PublicComponent } from './public/public.component';
import { environment } from '../environments/environment';
import { VideoIntroComponent } from './video-intro/video-intro.component';

const routes: Route[] = [
    {
        path: 'public',
        component: PublicComponent
    },
    {
        path: 'intro', 
        component: VideoIntroComponent
    },
    { 
        path: '',
        redirectTo: 'public',
        pathMatch: 'full'
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
