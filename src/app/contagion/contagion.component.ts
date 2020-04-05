import { Component, OnInit, ViewChild } from '@angular/core';
import { ContagionService } from './contagion.service';
import { map, take, filter } from 'rxjs/operators';
import { CountyCenter, CountyCases } from '../models';
import { Observable } from 'rxjs';
import { PlotComponent } from 'angular-plotly.js';
import * as moment from 'moment';

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

    constructor(private service: ContagionService) { }

    ngOnInit(): void {
        this.plot$ = this.service.getNYTimesCovidDataByCounty()
            .pipe(
                map(result => {
                    this.geo = result.geoData;
                    this.cases = result.countyCasesList;
                    const data = {
                        type: 'scattermapbox',
                        text: [],
                        lon: [],
                        lat: [],
                        marker: {
                            color: 'fuschia',
                            size: 4
                        }
                    };

                    result.countyCasesList.forEach(c => {
                        const g = this.getGeoData(c.fips);

                        data.lat.push(g.pclat10);
                        data.lon.push(g.pclon10);

                        const text = `${c.county} County\n${moment(c.date).format('MMM-DD')}\nCases: ${c.cases}\nDeaths: ${c.deaths}`;

                        data.text.push(text);
                    });

                    return {
                        data: [data],
                        layout: {
                            dragmode: 'zoom',
                            mapbox: {
                                style: 'white-bg',
                                layers: [{
                                    below: 'traces',
                                    sourcetype: 'raster',
                                    source: [
                                        'https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}'
                                    ],
                                }, {
                                    sourcetype: 'raster',
                                    source: [
                                        // tslint:disable-next-line: max-line-length
                                        'https://geo.weather.gc.ca/geomet/?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&BBOX={bbox-epsg-3857}&CRS=EPSG:3857&WIDTH=1000&HEIGHT=1000&LAYERS=RADAR_1KM_RDBR&TILED=true&FORMAT=image/png'
                                    ],
                                }],
                                below: 'traces',
                                center: { 
                                    lat: 39, 
                                    lon: -98,
                                },
                                zoom: 4,
                            },
                            margin: { r: 0, t: 0, b: 0, l: 0 },
                            showlegend: false
                        }
                    };
                }),
            );
    }

    getGeoData(fips: number): CountyCenter {
        return this.geo.find(g => g.fips === fips);
    }

    private genRand(min, max, decimalPlaces) {  
        const rand = Math.random() < 0.5 
            ? ((1 - Math.random()) * (max - min) + min) 
            : (Math.random() * (max - min) + min);  // could be min or max or anything in between
        const power = Math.pow(10, decimalPlaces);
        return Math.floor(rand * power) / power;
    }

}
