import { Injectable, Inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { CountyCases, CountyCenter, CountyCasesWithGeoData } from '../models';
import { tap, map, switchMap, withLatestFrom, mergeAll, concat, zip } from 'rxjs/operators';
import { DOCUMENT } from '@angular/common';

@Injectable({
    providedIn: 'root'
})
export class ContagionService {

    constructor(
        private http: HttpClient,
        @Inject(DOCUMENT) public document: Document
    ) { }

    getCountyCenters(): Observable<any> {
        const url = 'https://raw.githubusercontent.com/drewpayment/spatial/master/data/county_centers.csv';
        return this.http
            .get<string>(url, {
                headers: {
                    Accept: 'application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet'
                },
                observe: 'response',
                responseType: 'text' as 'json'
            })
            .pipe(
                map(resp => {
                    const csvArr = resp.body.split('\n');
                    const headers = csvArr[0].split(',');
                    const raw = csvArr.slice(1);
                    return this.parseCountyCentersList(headers, raw);
                })
            );
    }

    getNYTimesCovidDataByCounty(): Observable<CountyCasesWithGeoData> {
        const url = 'https://raw.githubusercontent.com/nytimes/covid-19-data/master/us-counties.csv';
        return this.http
            .get<string>(url, {
                headers: {
                    Accept: 'application/vnd.openxmlformatsofficedocument.spreadsheetml.sheet'
                },
                observe: 'response',
                responseType: 'text' as 'json'
            })
            .pipe(
                switchMap((resp) => {
                    const csvArr = resp.body.split('\n');
                    const headers = csvArr[0].split(',');
                    const raw = csvArr.slice(1);
                    
                    return of(this.parseCountyCasesList(headers.length, raw));
                }),
                zip(this.getCountyCenters()),
                map(([cases, centers]) => {
                    return {
                        countyCasesList: cases,
                        geoData: centers
                    } as CountyCasesWithGeoData;
                })
            );
    }

    private parseCountyCentersList(headers: string[], csv: string[]): CountyCenter[] {
        const lines: CountyCenter[] = [];

        for (let i = 0; i < csv.length; i++) {
            const data = csv[i].split(',');
            const row = {} as CountyCenter;

            for (let j = 0; j < headers.length; j++) {
                row[headers[j]] = data[j];
            }

            lines.push(row);
        }

        return lines;
    }

    private parseCountyCasesList(headersLength: number, csv: string[]): CountyCases[] {
        const lines: CountyCases[] = [];

        for (let i = 0; i < csv.length; i++) {
            const data = csv[i].split(',');
            const row = {} as CountyCases;

            for (let j = 0; j < headersLength; j++) {
                row[this.getCountyCaseKey(j)] = data[j];
            }

            lines.push(row);    
        }

        return lines;
    }

    private getCountyCaseKey(i: number): string {
        switch (i) {
            case CountyCaseEnum.date:
                return 'date';
            case CountyCaseEnum.county:
                return 'county';
            case CountyCaseEnum.state:
                return 'state';
            case CountyCaseEnum.fips:
                return 'fips';
            case CountyCaseEnum.cases:
                return 'cases';
            case CountyCaseEnum.deaths: 
                return 'deaths';
        }
    }

}

enum CountyCaseEnum {
    date,
    county,
    state,
    fips,
    cases,
    deaths
}
