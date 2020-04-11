import { Component, OnInit, ViewChild } from '@angular/core';
import { ContagionService } from './contagion.service';
import { map } from 'rxjs/operators';
import { CountyCenter, CountyCases } from '../models';
import { Observable, combineLatest, Subscription } from 'rxjs';
import { PlotComponent } from 'angular-plotly.js';
import * as moment from 'moment';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import '../utils/array-ext';
import { DecimalPipe } from '@angular/common';
import * as Highcharts from 'highcharts/highmaps';
import HC_map from 'highcharts/modules/map';
import HC_acc from 'highcharts/modules/accessibility';
import boost from 'highcharts/modules/boost';
import hc_data from 'highcharts/modules/data';
import { MatDialog } from '@angular/material/dialog';
import { CountyDialogComponent } from './county-dialog/county-dialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
hc_data(Highcharts);
boost(Highcharts);
HC_acc(Highcharts);
HC_map(Highcharts);

const US_MAP = require('@highcharts/map-collection/countries/us/us-all-all.geo.json');

@Component({
    selector: 'app-contagion',
    templateUrl: './contagion.component.html',
    styleUrls: ['./contagion.component.scss']
})
export class ContagionComponent implements OnInit {

    geo: CountyCenter[];
    cases: CountyCases[];
    @ViewChild('plt') plt: PlotComponent;
    plot$: Observable<any>;
    percCountiesInfected: number;
    groupedByCounty: { [key: string]: CountyCases[] };
    lastUpdated: Date | string | moment.Moment;
    markerColors = ['#F57151', '#FC3824', '#EB3433', '#E62020', '#BE040A'];

    /**
     * HIGHCHARTS
     */
    hc$: Observable<any>;
    Highcharts: typeof Highcharts = Highcharts;
    subs: Subscription[] = [];

    hcClick = (event: any) => {
        const fips = coerceNumberProperty(event.point.fips);
        const filteredCases = this.cases.filter(c => c.fips == fips);
        this.showCountyHistoricalDetailDialog(filteredCases);
    }

    constructor(
        private service: ContagionService, 
        private numPipe: DecimalPipe,
        private dialog: MatDialog,
        private breakpoint: BreakpointObserver
    ) { }

    ngOnInit(): void {

        this.hc$ = combineLatest(this.service.getNYTimesCovidDataByCounty(), this.service.getCountySpatialData())
            .pipe(
                map(([result, spatialData]) => {
                    this.geo = result.geoData;
                    this.cases = result.countyCasesList;
                    const grouped = this.groupBy(this.cases, 'fips');
                    const gLength = Object.keys(grouped).length;
                    this.percCountiesInfected = coerceNumberProperty((gLength / this.geo.length).toPrecision(4));
                    this.groupedByCounty = grouped;

                    // todo: finish this
                    const data = [];

                    for (const p in grouped) {
                        const countyCases = grouped[p] as CountyCases[];
                        const g = this.getGeoData(countyCases[0].fips);

                        if (!g) continue;

                        const c = countyCases[countyCases.length - 1];

                        data.push({
                            fips: c.fips,
                            name: c.county,
                            value: c.cases,
                            date: moment(c.date).format('mm/dd')
                        });
                    }

                    const countiesMap = Highcharts.geojson(US_MAP);
                    // Extract the line paths from the GeoJSON
                    const lines = Highcharts.geojson(US_MAP, 'mapline');
                    // Filter out the state borders and separator lines, we want these
                    // in separate series
                    const borderLines = Highcharts.grep(lines, (l) => {
                        return l.properties['hc-group'] === '__border_lines__';
                    });
                    const separatorLines = Highcharts.grep(lines, (l) => {
                        return l.properties['hc-group'] === '__separator_lines__';
                    });
                    // const countiesMap = Highcharts.geojson(spatialData, 'map');
                    Highcharts.each(countiesMap, (mp) => {
                        mp.name = (mp.name + ', ' + mp.properties['hc-key'].substr(3, 2)).toUpperCase();
                    });

                    const options = {
                        chart: {
                            type: 'map',
                            borderWidth: 1, 
                            marginRight: 20, // for the legend
                            width: 960,
                            height: 600
                        },
                        yAxis: {
                            gridLineWidth: 0,
                            visible: false
                        },
                        xAxis: {
                            gridLineWidth: 0,
                            visible: false
                        },
                        boost: {
                            useGPUTranslations: true
                        },
                        title: {
                            text: 'Active cases per county'
                        },
                        subtitle: {
                            text: 'Click a county to see detailed information'
                        },
                        mapNavigation: {
                            enabled: true,
                            buttonOptions: {
                                alignTo: 'spacingBox'
                            }
                        },
                        legend: {
                            layout: 'vertical',
                            align: 'right',
                            floating: true,
                            backgroundColor: (
                                Highcharts.defaultOptions &&
                                Highcharts.defaultOptions.legend && 
                                Highcharts.defaultOptions.legend.backgroundColor
                            ) || 'rgba(255, 255, 255, 0.85)'
                        },
                        colorAxis: {
                            min: 0,
                            max: 500,
                            tickInterval: 25,
                            stops: [[0, '#F1EEF6'], [0.65, '#900037'], [1, '#500007']],
                            labels: {
                                format: '{value}'
                            }
                        },
                        plotOptions: {
                            mapline: {
                                showInLegend: false,
                                enableMouseTracking: false,
                            },
                            map: {
                                events: {
                                    click: this.hcClick
                                }
                            },
                            series: {
                                turboThreshold: 4000
                            }
                        },
                        series: [
                        {
                            mapData: countiesMap,
                            data,
                            joinBy: ['fips', 'fips'],
                            name: 'Covid-19 Infections',
                            borderWidth: 0.5,
                            states: {
                                hover: {
                                    color: '#a4edba',
                                }
                            },
                            shadow: false
                        } as any, 
                        {
                            type: 'mapline',
                            name: 'State Borders',
                            data: borderLines,
                            color: 'white',
                            shadow: false
                        }, {
                            type: 'mapline',
                            name: 'Separator',
                            data: separatorLines,
                            color: 'gray',
                            shadow: false
                        }
                    ]
                    };

                    return {
                        hc: Highcharts,
                        options
                    };
                })
            );
    }

    private showCountyHistoricalDetailDialog(cases: CountyCases[]) {
        this.subs.push(this.dialog.open(CountyDialogComponent, {
            data: cases,
            autoFocus: false,
            width: this.breakpoint.isMatched(Breakpoints.Handset)
                ? '100vw' : '70vw'
        }).afterClosed().subscribe());
    }

    private getMarkerColor(nums: number[], val: number) {
        const rank = this.getPercentileRank(nums, val);
        const perc = Math.ceil(coerceNumberProperty((rank * 100).toPrecision(2)));

        if (perc <= 20) {
            return this.markerColors[0];
        } else if (perc > 20 && perc <= 40) {
            return this.markerColors[1];
        } else if (perc > 40 && perc <= 60) {
            return this.markerColors[2];
        } else if (perc > 60 && perc <= 80) {
            return this.markerColors[3];
        } else {
            return this.markerColors[4];
        }
    }

    private getPercentileRank(nums: number[], val: number) {
        const sorted = nums.sort();
        val = coerceNumberProperty(val);
        for (let i = 0; i < sorted.length; i++) {
            if (val <= sorted[i]) {
                while (i < sorted.length && val === sorted[i]) i++;
                if (i === 0) return 0;
                if (val !== sorted[i - 1]) {
                    i += (val - sorted[i - 1]) / (sorted[i] - sorted[i - 1]);
                }
                return i / sorted.length;
            }
        }
        return 1;
    }

    getGeoData(fips: number): CountyCenter {
        return this.geo.find(g => g.fips === fips);
    }

    private getRand(first: number | string, second: number | string, dec: number): string {
        const min = coerceNumberProperty(first < second ? first : second);
        const max = coerceNumberProperty(first == min ? second : first);
        const val = Math.random();
        const rand = val < 0.5
            ? ((1 - val) * (max - min) + min)
            : (val * (max - min) + min);

        const pow = Math.pow(10, dec);
        return (Math.floor(rand * pow) / pow).toPrecision(dec);
    }

    private groupBy(arr: any[], key: string, key2?: string, delimiter?: string) {
        delimiter = delimiter || ',';
        return arr.reduce((rv, x) => {
            if (key2)
                (rv[x[key] + delimiter + x[key2]] = rv[x[key] + delimiter + x[key2]] || []).push(x);
            else
                (rv[x[key]] = rv[x[key]] || []).push(x);
            return rv;
        }, {});
    }

    getSimilarCoordinates(lats: string[], lons: string[]): LatsLons {
        const result: LatsLons = { lats: [], lons: [] };
        const arrLength = lats.length;
        const decPlaces = lats[0].toString().split('.')[1].length;

        for (let i = 0; i < arrLength; i++) {
            const lat = coerceNumberProperty(lats[i]);
            const lon = coerceNumberProperty(lons[i]);
            const addedLat = lat + 0.00001;
            const subbedLat = lat - 0.00001;
            const addedLon = lon + 0.00001;
            const subbedLon = lon - 0.00001;
            let resLat = this.getRand(addedLat, subbedLat, decPlaces);
            let resLon = this.getRand(addedLon, subbedLon, decPlaces);

            const latExists = result.lats.findIndex(l => l == resLat) > -1;
            const lonExists = result.lons.findIndex(l => l == resLon) > -1;

            if (latExists) {
                resLat = this.getRand(addedLat, subbedLat, decPlaces);
            }

            if (lonExists) {
                resLon = this.getRand(addedLon, subbedLon, decPlaces);
            }

            result.lats.push(resLat);
            result.lons.push(resLon);
        }

        return result;
    }

}


interface LatsLons {
    lats: string[];
    lons: string[];
}
