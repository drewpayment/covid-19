import { Component, OnInit, ViewChild } from '@angular/core';
import { ContagionService } from './contagion.service';
import { map } from 'rxjs/operators';
import { CountyCenter, CountyCases } from '../models';
import { Observable, combineLatest } from 'rxjs';
import { PlotComponent } from 'angular-plotly.js';
import * as moment from 'moment';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import '../utils/array-ext';
import { DecimalPipe } from '@angular/common';

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

    constructor(private service: ContagionService, private numPipe: DecimalPipe) { }

    ngOnInit(): void {
        
        this.plot$ = combineLatest(this.service.getNYTimesCovidDataByCounty(), this.service.getCountySpatialData())
            .pipe(
                map(([result, spatialData]) => {
                    this.geo = result.geoData;
                    this.cases = result.countyCasesList;
                    const data = {
                        type: 'scattermapbox',
                        mode: 'markers',
                        text: [],
                        lon: [],
                        lat: [],
                        zmin: 0, 
                        zmid: 10,
                        zmax: 50,
                        z: [],
                        marker: {
                            color: '#491c0b',
                            size: 4
                        },
                        radius: 10,
                        hoverinfo: 'text'
                    };

                    this.lastUpdated = moment(this.cases[this.cases.length - 1].date);
                    const rawCases = this.cases.map(c => c.cases);
                    const grouped = this.cases.groupBy('fips');
                    const gLength = Object.keys(grouped).length;

                    this.percCountiesInfected = coerceNumberProperty((gLength / this.geo.length).toPrecision(4));
                    this.groupedByCounty = grouped;

                    for (const p in grouped) {
                        const countyCases = grouped[p] as CountyCases[];
                        const g = this.getGeoData(countyCases[0].fips);

                        const c = countyCases[countyCases.length - 1];
                        const markerColor = this.getMarkerColor(rawCases, c.cases);
                        data.marker.color = markerColor;
                        data.text.push(`${c.county} County - ${moment(c.date).format('MM/DD')} Cases: ${c.cases} Deaths: ${c.deaths}`);
                        data.z.push(countyCases.length);
                        data.lat.push(g.pclat10);
                        data.lon.push(g.pclon10);
                    }

                    const largestZ = data.z.sort((a, b) => coerceNumberProperty(a) - coerceNumberProperty(b));
                    const largeNum = largestZ[largestZ.length - 1];
                    const removeIndex = data.z.findIndex(z => z == largeNum);
                    data.z = [...data.z.slice(0, removeIndex), ...data.z.slice(removeIndex + 1)];

                    return {
                        data: [data],
                        layout: {
                            dragmode: 'zoom',
                            mapbox: {
                                style: 'carto-positron',
                                layers: [{
                                    source: spatialData,
                                    type: 'fill',
                                    below: 'traces',
                                    color: '#fff'
                                }],
                                below: 'traces',
                                center: {
                                    lat: 39,
                                    lon: -98,
                                },
                                zoom: 3.5,
                            },
                            margin: { r: 0, t: 0, b: 0, l: 0 },
                            showlegend: false
                        },
                        config: {
                            // mapboxAccessToken: 'pk.eyJ1IjoiZHJld3BheW1lbnQiLCJhIjoiY2s4bm5sMWc2MGJ6OTNtcW9ra21hNWgzNyJ9._b2y0RuyiE-2hXP42nU1xw'
                        }
                    };
                }),
            );
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
