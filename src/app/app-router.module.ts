import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { PublicComponent } from './src/app/public/public.component';
import { environment } from '../environments/environment';

const routes: Route[] = [
    {
        path: 'public',
        component: PublicComponent
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
