import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterEvent, NavigationEnd } from '@angular/router';
import { filter, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

// tslint:disable-next-line: ban-types
declare let gtag: Function;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'covid';
    isHomepage$: Observable<boolean>;
    isMobile$: Observable<boolean>;

    constructor(
        private router: Router, 
        private location: Location,
        private breakpointObserver: BreakpointObserver
    ) {
        this.isMobile$ = this.breakpointObserver.observe([ Breakpoints.HandsetPortrait ])
            .pipe(map(state => state.matches));

        this.isHomepage$ = this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                map((event: NavigationEnd) => {
                    gtag('config', 'UA-162431629-1', {
                        // tslint:disable-next-line: object-literal-key-quotes
                        'page_path': event.urlAfterRedirects
                    });

                    return event.url.length === 1 && event.url === '/';
                })
            );
    }

    ngOnInit() {}

    goBack = () => this.location.back();

    goHome = () => this.router.navigate(['']);

}
