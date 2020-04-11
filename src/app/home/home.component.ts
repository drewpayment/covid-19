import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Observer, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { NovelCovidService } from '../novelcovid.service';
import { CoronaSummary } from '../models';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

    isMobile$: Observable<boolean>;
    covid$: Observable<CoronaSummary>;

    constructor(
        private bo: BreakpointObserver,
        private service: NovelCovidService
    ) { }

    ngOnInit(): void {
        this.isMobile$ = this.bo.observe([ Breakpoints.Handset ])
            .pipe(map(state => state.matches));

        this.covid$ = this.service.getSummary();
    }

}
