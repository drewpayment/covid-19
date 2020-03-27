import { Injectable } from '@angular/core';
import * as covid from 'novelcovid';
import { CoronaSummary, CoronaCountry, CoronaState } from './models';
import { Observable } from 'rxjs';
import * as moment from 'moment';


@Injectable({
    providedIn: 'root'
})
export class NovelCovidService {

    constructor() {}

    getSummary(): Observable<CoronaSummary> {
        return new Observable((ob) => {
            covid.getAll().then((result: CoronaSummary) => {
                result.updated = moment(result.updated);
                ob.next(result);
                ob.complete();
            });
        });
    }

    getCountries(country?: string): Observable<CoronaCountry[]> {
        return new Observable((ob) => {
            covid.getCountry(country).then(result => {
                ob.next(result);
                ob.complete();
            });
        });
    }

    getStates(state?: string): Observable<CoronaState[]> {
        return new Observable((ob) => {
            covid.getState(state).then(result => {
                ob.next(result);
                ob.complete();
            });
        });
    }

}
