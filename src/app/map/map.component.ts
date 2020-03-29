import { Component, OnInit, AfterViewInit, OnDestroy, Input } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import { Vector } from 'ol/source';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { fromLonLat } from 'ol/proj';
import WebGLPointsLayer from 'ol/layer/WebGLPoints';
import Heatmap from 'ol/layer/Heatmap';
import { AppService } from '../app.service';
import { switchMap, map, withLatestFrom, tap } from 'rxjs/operators';
import { Subscription, of } from 'rxjs';
import { CovidLocation, CoronaCountry } from '../models';
import { LocationService } from '../location.service';
import { NovelCovidService } from '../novelcovid.service';

interface LatLon {
    lat: number;
    lon: number;
}

@Component({
    selector: 'app-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.scss']
})
export class MapComponent implements OnInit, AfterViewInit, OnDestroy {

    @Input() countries: CoronaCountry[];
    pos: Position;
    map: Map;
    locSub: Subscription;
    isSingleLocation = false;

    constructor(
        private service: AppService, 
        private location: LocationService, 
        private novel: NovelCovidService
    ) { }

    ngOnInit() {
        
    }

    ngAfterViewInit(): void {
        this.locSub = this.service.getCurrentPosition()
            .pipe(
                tap(pos => this.pos = pos),
                switchMap(_ => this.countries && this.countries.length
                    ? of(this.countries) 
                    : this.service.getMappableLocations()),
                tap(countries => {
                    let lat: number;
                    let lon: number;

                    if (countries.length > 1) {
                        lat = this.pos.coords.latitude;
                        lon = this.pos.coords.longitude;
                    } else {
                        this.isSingleLocation = true;
                        const con = countries[0];
                        lat = con.countryInfo.lat;
                        lon = con.countryInfo.long;
                    }

                    this.map = new Map({
                        layers: [
                            new TileLayer({
                                source: new OSM()
                            })
                        ],
                        view: new View({
                            center: fromLonLat([lon, lat]),
                            zoom: 3,
                        }),
                        target: 'map'
                    });
                })
            )
            .subscribe(locs => this.loadMapFeatures(locs));
    }

    ngOnDestroy() {
        if (!this.locSub.closed) this.locSub.unsubscribe();
        if (this.map) this.map = null;
    }

    private loadMapFeatures(locations: CoronaCountry[]) {
        const oldColor = 'rgba(242, 56, 22, 0.61)';
        const newColor = '#ffe52c';
        const period = 12;
        const animRatio = [
            '^', [
                '/', [
                    '%', [
                        '+', 
                        ['time'],
                        [
                            'interpolate',
                            ['linear'],
                            ['get', 'count'],
                            0, 0,
                            locations.length, period
                        ]
                    ],
                    period
                ],
                period
            ],
            0.5
        ];
        const style = {
            variables: {
                minCount: 0,
                maxCount: locations.length
            },
            filter: ['between', ['get', 'count'], ['var', 'minCount'], ['var', 'maxCount']],
            symbol: {
                symbolType: 'circle',
                size: ['*',
                    ['interpolate', ['linear'], Math.random(), 0, 8, 200000, 26],
                    ['-', 1.75, ['*', animRatio, 0.75]]
                ],
                color: ['interpolate',
                    ['linear'],
                    animRatio,
                    0, newColor,
                    1, oldColor
                ],
                opacity: ['-', 1.0, ['*', animRatio, 0.75]]
            }
        };
        const features: Feature[] = [];

        locations.forEach((loc, i, a) => {
            features.push(new Feature({
                count: i,
                geometry: new Point(fromLonLat([loc.countryInfo.long, loc.countryInfo.lat]))
            }));
        });

        const vectorSource = new Vector({
            features,
            // attributions: 'Bunch of smart mfers'
        });

        // while (this.map.getLayers().length > 1) {
        //     const layers = this.map.getLayers();
        //     this.map.removeLayer(layers[layers.length - 1]);
        // }

        // const radius = this.isSingleLocation ? 50 : 6;
        // const blur = this.isSingleLocation ? 25 : 6;

        // this.map.addLayer(new Heatmap({
        //     source: vectorSource,
        //     radius,
        //     blur
        // }));
        this.map.addLayer(new WebGLPointsLayer({
            style,
            source: vectorSource,
            disableHitDetection: true
        }));

        this.animate();
    }

    animate = () => {
        this.map.render();
        window.requestAnimationFrame(this.animate);
    }

}
