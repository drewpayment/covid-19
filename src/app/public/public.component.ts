import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { switchMap, tap, startWith, debounceTime } from 'rxjs/operators';
import { Tensor, Rank } from '@tensorflow/tfjs';
import { Observable, of, BehaviorSubject, merge, zip, combineLatest, Subscription } from 'rxjs';
import { Sort, MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { FormControl } from '@angular/forms';
import { CoronaSummary, CoronaCountry } from '../models';
import { AppService } from '../app.service';
import { NovelCovidService } from '../novelcovid.service';
import { LocationService } from '../location.service';
import { Router } from '@angular/router';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

const SORT_COLUMNS = {
    COUNTRY: 'country',
    PROVINCE: 'province',
    CONFIRMED: 'cases',
    DEATHS: 'deaths',
    RECOVERED: 'recovered'
};

const SORT_DIR = { ASC: 'asc', DESC: 'desc' };

@Component({
    selector: 'app-public',
    templateUrl: './public.component.html',
    styleUrls: ['./public.component.scss']
})
export class PublicComponent implements OnInit, OnDestroy {
    title = 'covid';
    xTrain: Tensor<Rank>;
    xTest: Tensor<Rank>;
    yTrain: Tensor<Rank>;
    yTest: Tensor<Rank>;
    latest: CoronaSummary;
    locations$: Observable<CoronaCountry[]>;
    isLoading = true;
    displayColumns = ['country', 'cases', 'deaths'];
    @ViewChild(MatSort, {static: true}) sort: MatSort;
    dataSource = new MatTableDataSource<CoronaCountry>();
    sortStrategy = new BehaviorSubject<Sort>({ active: 'cases', direction: 'desc' });
    filter = new FormControl();
    isGlobalViewOpened = true;
    isWebViewEnabled = false;
    isMobilePotrait = false;
    subs: Subscription[] = [];

    constructor(
        private service: AppService, 
        private covid: NovelCovidService, 
        private location: LocationService,
        private router: Router,
        private bo: BreakpointObserver
    ) {}

    ngOnInit() {
        this.subs.push(this.bo.observe([ Breakpoints.HandsetLandscape, Breakpoints.Web ])
        .subscribe(state => {
            this.isWebViewEnabled = state.matches;

            if (state.matches) {
                this.displayColumns = ['country', 'todayCases', 'todayDeaths', 'cases', 'active', 'deaths', 'recovered'];
            } else {
                this.displayColumns = ['country', 'cases', 'deaths'];
                this.isMobilePotrait = state.breakpoints[Breakpoints.HandsetPortrait];
            }
        }));
        
        this.dataSource.sort = this.sort;

        this.locations$ = combineLatest([
                this.covid.getSummary(),
                this.covid.getCountries(),
                // this.service.getLocations(), 
                this.sortStrategy, 
                this.filter.valueChanges.pipe(startWith(''), debounceTime(250))
            ])
            .pipe(
                switchMap(([covid, res, sort, search]) => {
                    // MACHINE-LEARNING TO BE IMPLEMENTED
                    // const features = ['confirmed', 'deaths', 'recovered'];
                    // const [xTrain, xTest, yTrain, yTest] = this.train.createDatasets(res.locations, features, new Set(), 0.1);
                    // this.xTest = xTest;
                    // this.xTrain = xTrain;
                    // this.yTrain = yTrain;
                    // this.yTest = yTest;

                    // return this.train.trainLinearModel(this.xTrain, this.yTrain)
                    //     .pipe(switchMap((model: any) => {
                    //         // const prediction = model.predict(this.xTest).dataSync();

                    //         this.latest = res.latest;
                    //         this.isLoading = false;
                    //         const sorted = res.locations.sort((a, b) => b.latest.confirmed - a.latest.confirmed);
                    //         return of(sorted);
                    //     }));
                    let filtered: CoronaCountry[] = [];

                    if (search && search.length) {
                        const s = this.normalize(search);
                        filtered = res.filter(loc => {
                            if (s === 'us') {
                                return this.normalize(loc.country) === s;
                            }
                            return this.normalize(loc.country).includes(s);
                        });
                    } else {
                        filtered = res;
                    }

                    filtered = filtered.sort((a, b) => {
                        return this.sortCovidLocations(a, b, sort);
                    });

                    this.latest = covid;
                    this.isLoading = false;
                    
                    return of(filtered);
                }),
                tap((locations: CoronaCountry[]) => {
                    this.service.setMappableLocations(locations);
                    this.dataSource.data = locations;
                })
            );
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
    }

    sortTable(event: Sort) {
        this.sortStrategy.next(event);
    }

    goToDetail(country: CoronaCountry) {
        this.router.navigate(['country', country.countryInfo._id]);
    }

    private normalize(value: string): string {
        return value && value.length 
            ? value.trim().toLowerCase().replace(/\s/g, '') : '';
    }

    private sortCovidLocations(a: CoronaCountry, b: CoronaCountry, s: Sort): number {
        return (a[s.active] < b[s.active] ? -1 : 1)
            * (s.direction === SORT_DIR.ASC ? 1 : -1);
    }

}
