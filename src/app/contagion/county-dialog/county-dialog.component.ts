import { Component, OnInit, Inject } from '@angular/core';
import { CountyCases } from '../../models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as Highcharts from 'highcharts/highcharts';
import * as moment from 'moment';
import { coerceNumberProperty } from '@angular/cdk/coercion';

@Component({
    selector: 'app-county-dialog',
    templateUrl: './county-dialog.component.html',
    styleUrls: ['./county-dialog.component.scss']
})
export class CountyDialogComponent implements OnInit {
    Highcharts: typeof Highcharts = Highcharts;
    countyName: string;
    hc: Highcharts.Options;

    constructor(
        private ref: MatDialogRef<CountyDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: CountyCases[]
    ) { }

    ngOnInit(): void {
        const cases = [];
        const deaths = [];
        
        if (this.data && this.data.length) {
            this.countyName = this.data[0].county + ' County, ' + this.data[0].state;

            this.data.forEach(c => {
                const dt = moment(c.date).valueOf();
                cases.push([dt, coerceNumberProperty(c.cases)]);
                deaths.push([dt, coerceNumberProperty(c.deaths)]);
            });
        }

        this.hc = {
            chart: {
                type: 'line',
                zoomType: 'x'
            },
            title: {
                text: 'Confirmed vs Deaths'
            },
            subtitle: {
                text: 'Click and drag in the plot area to zoom'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: 'Total Cases'
                },
                min: 0
            },
            legend: {
                enabled: true
            },
            plotOptions: {
                area: {
                    // fillColor: {
                    //     linearGradient: {
                    //         x1: 0, y1: 0, x2: 0, y2: 1
                    //     },
                    //     stops: [
                    //         [0, Highcharts.color('#f68316').get('rgba') as string],
                    //         [1, Highcharts.color('#f68316').setOpacity(0).get('rgba') as string]
                    //     ]
                    // },
                    marker: {
                        radius: 2
                    },
                    lineWidth: 1,
                    states: {
                        hover: {
                            lineWidth: 1
                        }
                    },
                    threshold: null
                }
            },

            series: [
                {
                    type: 'area',
                    name: 'Confirmed',
                    data: cases,
                    color: '#f68316',
                    fillColor: {
                        linearGradient: {
                            x1: 0, y1: 0, x2: 0, y2: 1
                        },
                        stops: [
                            [0, Highcharts.color('#f68316').get('rgba') as string],
                            [1, Highcharts.color('#f68316').setOpacity(0).get('rgba') as string]
                        ]
                    }
                }, 
                {
                    type: 'area',
                    name: 'Deaths',
                    data: deaths,
                    color: '#7b0028',
                    fillColor: {
                        linearGradient: {
                            x1: 0, y1: 0, x2: 0, y2: 1
                        },
                        stops: [
                            [0, Highcharts.color('#7b0028').get('rgba') as string],
                            [1, Highcharts.color('#7b0028').setOpacity(0).get('rgba') as string]
                        ]
                    }
                }
            ]
        };
    }

    close() {
        this.ref.close();
    }

}
