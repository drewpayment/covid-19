import { Component, OnInit, Inject, AfterViewInit } from '@angular/core';
import { CountyCases } from '../../models';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import * as Highcharts from 'highcharts/highcharts';
import * as moment from 'moment';
import { coerceNumberProperty } from '@angular/cdk/coercion';
import * as tf from '@tensorflow/tfjs';
import { Observable, Observer } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
    selector: 'app-county-dialog',
    templateUrl: './county-dialog.component.html',
    styleUrls: ['./county-dialog.component.scss']
})
export class CountyDialogComponent implements OnInit, AfterViewInit {
    Highcharts: typeof Highcharts = Highcharts;
    countyName: string;
    hc$: Observable<Highcharts.Options>;
    private RegCasesSlope = 0;
    set regCasesSlope(val: number) { this.RegCasesSlope = coerceNumberProperty(val); }
    get regCasesSlope() { return this.RegCasesSlope; }
    private RegCasesAcc = 0;
    set regCasesAcc(val: number) { this.RegCasesAcc = coerceNumberProperty(val); }
    get regCasesAcc() { return this.RegCasesAcc; }
    private RegDeathsSlope = 0;
    private RegDeathsAcc = 0; 
    set regDeathsSlope(val: number) { this.RegDeathsSlope = coerceNumberProperty(val); }
    get regDeathsSlope() { return this.RegDeathsSlope; }
    set regDeathsAcc(val: number) { this.RegDeathsAcc = coerceNumberProperty(val); }
    get regDeathsAcc() { return this.RegDeathsAcc; }
    trainY: any[];
    cases: any[] = [];
    deaths: any[] = [];

    constructor(
        private ref: MatDialogRef<CountyDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: CountyCases[]
    ) { }

    ngOnInit(): void {
        // const sumDays = this.data.length;
        // const sumCases = cases.reduce((p, n) => p = coerceNumberProperty(p) + coerceNumberProperty(n[1]));
        
        
    }

    ngAfterViewInit() {
        this.hc$ = this.train()
            .pipe(switchMap(_ => this.plot()));
    }

    mean(arr: number[]): number {
        const tot = arr.reduce((p, n) => p += n, 0);
        return tot / arr.length;
    }

    getLinearCases(dayNum: number): number {
        return Math.ceil((this.regCasesSlope * coerceNumberProperty(dayNum)) + this.regCasesAcc);
    }

    getLinearDeaths(dayNum: number): number {
        return Math.ceil((this.regDeathsSlope * coerceNumberProperty(dayNum)) + this.regDeathsAcc);
    }

    predict(x: tf.Tensor, slope: number, acc: number) {
        const m = tf.variable(tf.scalar(slope));
        const b = tf.variable(tf.scalar(acc));
        return tf.tidy(() => {
            return m.mul(x).add(b);
        });
    }

    private loss(prediction: tf.Tensor, actualValues: tf.Tensor): tf.Scalar {
        return prediction.sub(actualValues).square().mean();
    }

    private train(): Observable<void> {
        return new Observable((ob: Observer<void>) => {
            if (this.data && this.data.length) {
                this.countyName = this.data[0].county + ' County, ' + this.data[0].state;
    
                this.data.forEach(c => {
                    const dt = moment(c.date).valueOf();
                    this.cases.push([dt, coerceNumberProperty(c.cases)]);
                    this.deaths.push([dt, coerceNumberProperty(c.deaths)]);
                });
            }
    
            const xArr = [];
            this.cases.forEach((c, i, a) => xArr.push(i));
    
            const Mc = this.mean(this.cases.map(c => c[1]));
            const Md = this.mean(xArr);
            const SSd = xArr.reduce((p, n) => p += (n * n), 0);
            const SSc = this.cases.reduce((p, n) => p += (n[1] * n[1]), 0);
            this.regCasesSlope = SSc / SSd;
            this.regCasesAcc = Mc - (this.regCasesSlope * Md);
    
            const Mdths = this.mean(this.deaths.map(d => d[1]));
            const SSdths = this.deaths.reduce((p, n) => p += (n[1] * n[1]), 0);
            this.regDeathsSlope = SSdths / SSd;
            this.regDeathsAcc = Mdths - (this.regDeathsSlope * Md);
            
            const addlDays = 60;
            const lastDay = moment(this.cases[this.cases.length - 1][0], 'x');
            for (let i = 31; i <= addlDays; i++) {
                const dt = lastDay.clone().add((i - 30), 'd').valueOf();
                this.cases.push([dt, this.getLinearCases(i)]);
                this.deaths.push([dt, this.getLinearDeaths(i)]);
            }
            const learningRate = 0.01;
            const optimizer = tf.train.sgd(learningRate);
    
            // optimizer.minimize(() => {
                const predCasesYs = this.predict(tf.tensor1d(xArr), this.regCasesSlope, this.regCasesAcc);
                const predDeathsYs = this.predict(tf.tensor1d(xArr), this.regDeathsSlope, this.regDeathsAcc);
    
                console.dir([predCasesYs, predDeathsYs]);
                
                const casesStepLoss = this.loss(predCasesYs, tf.tensor1d(this.cases));
                const deathsStepLoss = this.loss(predDeathsYs, tf.tensor1d(this.deaths));
    
                console.dir([casesStepLoss, deathsStepLoss]);
    
                ob.complete();
                // return casesStepLoss;
            // });
        });
    }

    close() {
        this.ref.close();
    }

    plot(): Observable<Highcharts.Options> {
        return new Observable((ob: Observer<Highcharts.Options>) => {
            ob.next({
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
                        data: this.cases,
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
                        data: this.deaths,
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
            });
            ob.complete();
        });
    }

}
