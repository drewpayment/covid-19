import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { NovelCovidService } from '../novelcovid.service';
import { switchMap, map } from 'rxjs/operators';
import * as moment from 'moment';
import { Observable, Subscription } from 'rxjs';
import { CountryHistorical } from '../models';
import { PlotComponent } from 'angular-plotly.js';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
    selector: 'app-countries-graph',
    templateUrl: './countries-graph.component.html',
    styleUrls: ['./countries-graph.component.scss']
})
export class CountriesGraphComponent implements OnInit, OnDestroy {

    plot$: Observable<any>;
    @ViewChild('plt') plt: PlotComponent;
    subs: Subscription[] = [];

    constructor(private novel: NovelCovidService, private bo: BreakpointObserver) { }

    ngOnInit(): void {
        this.subs.push(this.bo.observe([Breakpoints.Handset]).subscribe(state => {
            if (this.plt) {
                this.plt.plotly.resize(this.plt.plotEl.nativeElement);
            }
        }));

        this.plot$ = this.novel.getCountriesHistorical()
            .pipe(
                map(list => this.getTopNCountriesByCasesToday(5, list, [])),
                map(historyList => {
                    const countries = [];
                    historyList.forEach((h, i, a) => {
                        const series = {
                            x: [],
                            y: [],
                            fill: this.getFillSetting(i),
                            type: 'scatter',
                            name: h.country.charAt(0).toUpperCase() + h.country.slice(1),
                            stackgroup: 'one',
                        };

                        if (!h.timeline.cases) return;

                        for (const p in h.timeline.cases) {
                            const dt = moment(p).format('M/D');

                            series.y.push(h.timeline.cases[p]);
                            series.x.push(dt);
                        }
                        
                        countries.push(series);
                    });

                    return {
                        data: countries,
                        layout: {
                            title: 'Top 5 Countries Cases',
                            showlegend: true,
                            autosize: true,
                        }
                    };
                })
            );
    }

    ngOnDestroy() {
        this.subs.forEach(s => s.unsubscribe());
    }

    private getFillSetting(index: number): string {
        if (index === 0) 
            return 'tozeroy';
        else 
            return 'tonextx';
    }

    private getTopNCountriesByCasesToday(
        noOfResults: number, 
        orig: CountryHistorical[], 
        result: CountryHistorical[] = []
    ): CountryHistorical[] {
        const max = orig.reduce((prev, curr) => {
            const prevIndex = Object.keys(prev.timeline.cases).length - 1;
            const prevAmt = Object.values(prev.timeline.cases)[prevIndex];
            const currIndex = Object.keys(curr.timeline.cases).length - 1;
            const currAmt = Object.values(curr.timeline.cases)[currIndex];
            return prevAmt > currAmt ? prev : curr;
        });

        const index = orig.findIndex(o => o === max);
        orig.splice(index, 1);
        result.push(max);

        if (result.length < noOfResults) {
            return this.getTopNCountriesByCasesToday(noOfResults, orig, result);
        } else {
            const sorted = result.sort((prev, curr) => {
                const prevIndex = Object.keys(prev.timeline.cases).length - 1;
                const prevAmt = Object.values(prev.timeline.cases)[prevIndex];
                const currIndex = Object.keys(curr.timeline.cases).length - 1;
                const currAmt = Object.values(curr.timeline.cases)[currIndex];
                return prevAmt > currAmt ? 1 : -1;
            });
            
            return sorted;
        }
    }

    private getColorScale(color: string): string[][] {
        const result = [];

        for (let i = 0; i < 11; i++) {
            result.push([
                this.round((i * 0.1), 1).toString(),
                color
            ]);
        }

        return result;
    }

    private round(value, precision) {
        const mult = Math.pow(10, precision || 0);
        return Math.round(value * mult) / mult;
    }

    private getRandomColor(): string {
        let color = 'rgb(';

        for (let i = 0; i < 3; i++) {
            const delimiter = i === 2 ? ')' : ',';
            color += Math.floor(Math.random() * 255) + delimiter;
        }
        return color;
    }

}
