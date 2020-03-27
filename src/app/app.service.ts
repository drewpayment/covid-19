import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject, ReplaySubject } from 'rxjs';
import { shareReplay } from 'rxjs/operators';
import { CovidLocation, CovidLocations, CoronaCountry } from './models';

const JOHN_HOPKINS_API = 'https://coronavirus-tracker-api.herokuapp.com/v2';
const WORLD_METERS = 'https://corona.lmao.ninja';

@Injectable({
    providedIn: 'root'
})
export class AppService {

    private api = JOHN_HOPKINS_API;

    private locations$ = this._getLocations().pipe(shareReplay());
    private filteredLocations$ = new ReplaySubject<CoronaCountry[]>();

    constructor(private http: HttpClient) {}

    private _getLocations(): Observable<CovidLocations> {
        const url = `${this.api}/locations?timelines=0`;
        return this.http.get<CovidLocations>(url);
    }

    setMappableLocations(locs: CoronaCountry[]): void {
        this.filteredLocations$.next(locs);
    }

    getMappableLocations(): Observable<CoronaCountry[]> {
        return this.filteredLocations$.asObservable();
    }

    getLocations(): Observable<CovidLocations> {
        return this.locations$;
    }

    getLocation(id: number, withTimelines: boolean = true): Observable<CovidLocation> {
        const url = `${this.api}/locations/${id}?timelines=${withTimelines ? 1 : 0}`;
        return this.http.get<CovidLocation>(url);
    }

    getCurrentPosition(): Observable<Position> {
        return new Observable((ob) => {
            navigator.geolocation.getCurrentPosition(resp => {
                ob.next(resp);
                ob.complete();
            }, err => {
                ob.error(err);
                ob.complete();
            });
        });
    }

}
