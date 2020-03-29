import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NovelCovidService } from '../novelcovid.service';
import { switchMap, map } from 'rxjs/operators';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import { CoronaCountry, CoronaSummary, CovidLocation, CountryHistorical } from '../models';
import { Observable, of } from 'rxjs';
import { AppService } from '../app.service';
import * as moment from 'moment';
import { PlotComponent } from 'angular-plotly.js';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
    selector: 'app-country-detail',
    templateUrl: './country-detail.component.html',
    styleUrls: ['./country-detail.component.scss']
})
export class CountryDetailComponent implements OnInit {

    mapCountries: CoronaCountry[];
    country: CoronaCountry;
    summary$: Observable<CoronaSummary>;

    // NGX OPTIONS
    legend = true;
    showLabels = true;
    animations = true;
    xAxis = true;
    yAxis = true;
    showYAxisLabel = false;
    showXAxisLabel = false;
    timeline = true;
    activeEntries = [];
    
    chartData$: Observable<any>;
    plotlyGraph = {
        layout: {
            legend: {
                orientation: 'h',
                halign: 'center',
                valign: 'middle'
            }
        },
        data: [],
        config: {
            staticPlot: false,
            displayLogo: false
        }
    };

    plotColors = [
        'rgb(153, 0, 0)',
        'rgb(32, 32, 32)'
    ];

    @ViewChild('plt') plt: PlotComponent;

    yAxisTickFormatting = (tick) => {
        if (tick > 1000) {
            const tickStr = tick.toString();
            return tickStr.slice(0, tickStr.length - 3) + 'k';
        }
            
        return tick;
    }

    constructor(
        private route: ActivatedRoute, 
        private novel: NovelCovidService, 
        private service: AppService,
        private bo: BreakpointObserver
    ) { }

    ngOnInit(): void {
        this.bo.observe([ Breakpoints.Handset, Breakpoints.Web ])
            .subscribe(state => {
                if (this.plt) {
                    this.plt.plotly.resize(this.plt.plotEl.nativeElement);
                }
            });

        this.summary$ = this.novel.getSummary();
        this.chartData$ = this.route.paramMap
            .pipe(
                switchMap(params => {
                    const id = coerceNumberProperty(params.get('id'));
                    return this.novel.getCountry(id);
                }),
                switchMap(country => {
                    if (country) {
                        this.country = country;
                        this.mapCountries = [country];

                        return this.novel.getCountryHistorical(country.country);
                    }
                    return of(null);
                }),
                map((loc: CountryHistorical) => {
                    if (!loc) return [];

                    const timelines = loc.timeline;
                    if (!timelines) return [];
                    
                    const data = [];
                    let idx = 0; 
                    for (const p in timelines) {
                        const dates = timelines[p];
                        const series = {
                            type: 'scatter',
                            name: p.charAt(0).toUpperCase() + p.slice(1),
                            mode: 'lines',
                            line: {
                                color: this.plotColors[idx],
                                width: 2
                            },
                            x: [],
                            y: []
                        };

                        for (const dp in dates) {
                            series.y.push(dates[dp]);
                            series.x.push(moment(dp, 'M/D/YYYY').format('M/D'));
                        }

                        data.push(series);
                        idx++;
                    }

                    this.plotlyGraph.data = data;

                    return data;
                })
            );
    }

    divide(num: number, den: number): number {
        return coerceNumberProperty(num) / coerceNumberProperty(den);
    }

    isBoldWeight(sum: CoronaCountry): boolean {
        return sum != null 
            ? this.divide(sum.deaths, sum.cases) > 0.01
            : false;
    }

    onSelect(event) {
        // console.dir(event);
    }

    onActivate(event) {
        // console.dir(event);
    }

    onDeactivate(event) {
        // console.dir(event);
    }

}
