import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router, RouterEvent, NavigationEnd } from '@angular/router';
import { filter, map, tap } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { Location } from '@angular/common';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
    title = 'covid';
    isHomepage$: Observable<boolean>;

    constructor(private router: Router, private location: Location) {
        this.isHomepage$ = this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                map((event: RouterEvent) => event.url.length === 1 && event.url === '/'),
                tap(val => console.log(val))
            );
    }

    ngOnInit() {}

    goBack = () => this.location.back();

}
