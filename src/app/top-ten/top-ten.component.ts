import { Component, OnInit, ViewChild, AfterViewInit, ViewChildren, QueryList, OnDestroy } from '@angular/core';
import { NovelCovidService } from '../novelcovid.service';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { CoronaCountry } from '../models';
import { MatPaginatorDefaultOptions, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource, MatTable } from '@angular/material/table';
import { tap, map, startWith } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Moment } from 'moment';
import * as moment from 'moment';
import { Router } from '@angular/router';

interface CountryRanked extends CoronaCountry {
    rank: number;
}

@Component({
    selector: 'app-top-ten',
    templateUrl: './top-ten.component.html',
    styleUrls: ['./top-ten.component.scss']
})
export class TopTenComponent implements OnInit, AfterViewInit, OnDestroy {

    columns = ['rank', 'name', 'cases'];
    activeTable = new MatTableDataSource<CountryRanked>(null);
    deathsTable = new MatTableDataSource<CountryRanked>(null);
    criticalTable = new MatTableDataSource<CountryRanked>(null);
    recoveredTable = new MatTableDataSource<CountryRanked>(null);

    @ViewChildren(MatPaginator) paginators: QueryList<MatPaginator>;
    countries$: Observable<CoronaCountry[]>;

    defaultPager = {
        pageSizeOptions: [10],
        pageSize: 10,
        length: 0
    };

    activeCtx = {
        pager: this.defaultPager,
        dataSource: this.activeTable,
        columns: this.columns,
        casesProperty: 'active',
        header: 'header-active',
        tableDesc: 'Active'
    };

    deathCtx = {
        pager: this.defaultPager,
        dataSource: this.deathsTable,
        columns: this.columns,
        casesProperty: 'deaths',
        header: 'header-deaths',
        tableDesc: 'Deaths'
    };

    critCtx = {
        pager: this.defaultPager,
        dataSource: this.criticalTable,
        columns: this.columns,
        casesProperty: 'critical',
        header: 'header-critical',
        tableDesc: 'Critical'
    };

    recovCtx = {
        pager: this.defaultPager,
        dataSource: this.recoveredTable,
        columns: this.columns,
        casesProperty: 'recovered',
        header: 'header-recovered',
        tableDesc: 'Recovered'
    };

    isMobile = false;
    subs: Subscription[] = [];
    updated: Moment;

    constructor(
        private service: NovelCovidService, 
        private breakpoint: BreakpointObserver,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.subs.push(this.breakpoint.observe([ Breakpoints.Handset ])
            .subscribe(state => {
                this.isMobile = state.matches;
            }));
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
    }

    ngAfterViewInit() {
        this.subs.push(this.service.getCountries()
            .pipe(
                tap(countries => {
                    if (!countries) return;
                    this.updated = moment(countries[0].updated, 'x');

                    /** ACTIVE TOP TEN */
                    const ac = countries.sort((a, b) => b.active - a.active)
                        .map((c, i) => Object.assign({}, c, { rank: i + 1 }));
                    this.activeCtx.dataSource = this.createMatTableDataSource(ac, 'activePag');
                    this.activeCtx.pager.length = ac.length;

                    /** DEATHS TOP TEN */
                    const dc = countries.sort((a, b) => b.deaths - a.deaths)
                        .map((c, i) => Object.assign({}, c, { rank: i + 1}));
                    this.deathCtx.dataSource = this.createMatTableDataSource(dc, 'deathsPag');
                    this.deathCtx.pager.length = dc.length;

                    /** CRITICAL TOP TEN */
                    const crit = countries.sort((a, b) => b.critical - a.critical)
                        .map((c, i) => Object.assign({}, c, { rank: i + 1}));
                    this.critCtx.dataSource = this.createMatTableDataSource(crit, 'critPag');
                    this.critCtx.pager.length = crit.length;
                    
                    /** RECOVERY TOP TEN */
                    const recov = countries.sort((a, b) => b.recovered - a.recovered)
                        .map((c, i) => Object.assign({}, c, { rank: i + 1}));
                    this.recovCtx.dataSource = this.createMatTableDataSource(recov, 'recovPag');
                    this.recovCtx.pager.length = recov.length;
                })
            ).subscribe());
    }

    handleRowClick(row: CoronaCountry) {
        this.router.navigate(['country', row.countryInfo._id]);
    }

    private createMatTableDataSource<T>(data: T[], paginatorName?: string): MatTableDataSource<T> {
        const result = new MatTableDataSource<T>(data);
        if (paginatorName == 'activePag') {
            result.paginator = this.paginators.first;
        } else if (paginatorName == 'deathsPag') {
            result.paginator = this.paginators.find((p, i, a) => i === 1);
        } else if (paginatorName == 'critPag') {
            result.paginator = this.paginators.find((p, i, a) => i === 2);
        } else if (paginatorName == 'recovPag') {
            result.paginator = this.paginators.last;
        }
        return result;
    }

}
