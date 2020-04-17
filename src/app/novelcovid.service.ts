import { Injectable } from '@angular/core';
import { CoronaSummary, CoronaCountry, CoronaState, CountryHistorical } from './models';
import { Observable, BehaviorSubject, of } from 'rxjs';
import * as moment from 'moment';
import { switchMap, map, shareReplay, tap } from 'rxjs/operators';
import { HttpClient } from '@angular/common/http';

interface CacheInfo {
    countries: BehaviorSubject<CoronaCountry[]>;
    countriesUpdated: moment.Moment | null;
    hasCountries: boolean;
    summaryUpdated: moment.Moment | null;
    hasSummary: boolean;
    hasStates: boolean;
    states: BehaviorSubject<CoronaState[]>;
    statesUpdated: moment.Moment | null;
    summary: BehaviorSubject<CoronaSummary>;
    hasHistoricalCountries: boolean;
    historicalCountries: BehaviorSubject<CountryHistorical[]>;
    historicalCountriesUpdated: moment.Moment | null;
}

const WORLD_METERS = 'https://corona.lmao.ninja/v2';

export enum CACHE_TYPE {
    COUNTRIES,
    SUMMARY,
    COUNTRIES_HISTORY,
    STATES
}

@Injectable({
    providedIn: 'root'
})
export class NovelCovidService {

    private cacheInfo = {
        countries: new BehaviorSubject<CoronaCountry[]>(null),
        summary: new BehaviorSubject<CoronaSummary>(null),
        states: new BehaviorSubject<CoronaState[]>(null),
        hasCountries: false, 
        hasSummary: false,
        hasStates: false,
        countriesUpdated: null,
        summaryUpdated: null,
        hasHistoricalCountries: false,
        historicalCountries: new BehaviorSubject<CountryHistorical[]>(null),
        historicalCountriesUpdated: null
    } as CacheInfo;

    constructor(private http: HttpClient) {}

    getSummary(): Observable<CoronaSummary> {
        if (this.isSummaryCacheValid())
            return this.cacheInfo.summary.asObservable();
        
        return this.http.get<CoronaSummary>(`${WORLD_METERS}/all`)
            .pipe(tap(result => this.addToCache(CACHE_TYPE.SUMMARY, result)));
    }

    getCountries(country?: string): Observable<CoronaCountry[]> {
        if (this.isCountryCacheValid()) 
            return this.cacheInfo.countries.asObservable();

        return this.http.get<CoronaCountry[]>(`${WORLD_METERS}/countries`)
            .pipe(tap(result => this.addToCache(CACHE_TYPE.COUNTRIES, result)));
    }

    getStates(state?: string): Observable<CoronaState[]> {
        if (this.isStateCacheValid())
            return this.cacheInfo.states.asObservable();

        return this.http.get<CoronaState[]>(`${WORLD_METERS}/states`)
            .pipe(tap(result => this.addToCache(CACHE_TYPE.STATES, result)));
    }

    getCountry(id: number): Observable<CoronaCountry> {
        if (this.isCountryCacheValid()) 
            return this.cacheInfo.countries
                .pipe(map(countries => countries.find(c => c.countryInfo._id === id)));

        return this.getCountries()
            .pipe(switchMap(result => {
                return of(result.find(c => c.countryInfo._id === id));
            }));
    }

    getCountryHistorical(name: string): Observable<CountryHistorical> {
        const url = `${WORLD_METERS}/historical/${name}`;
        return this.http.get<CountryHistorical>(url)
            .pipe(shareReplay());
    }

    getCountriesHistorical(): Observable<CountryHistorical[]> {
        const url = `${WORLD_METERS}/historical`;

        if (this.isCountriesHistoricalCacheValid())
            return this.cacheInfo.historicalCountries.asObservable();

        return this.http.get<CountryHistorical[]>(url)
            .pipe(tap(countries => this.addToCache(CACHE_TYPE.COUNTRIES_HISTORY, countries)));
    }

    private isStateCacheValid(): boolean {
        return this.cacheInfo.hasStates && !this.isCacheExpired(CACHE_TYPE.STATES);
    }

    private isCountryCacheValid(): boolean {
        return this.cacheInfo.hasCountries && !this.isCacheExpired(CACHE_TYPE.COUNTRIES);
    }

    private isSummaryCacheValid(): boolean {
        return this.cacheInfo.hasSummary && !this.isCacheExpired(CACHE_TYPE.SUMMARY);
    }

    private isCountriesHistoricalCacheValid(): boolean {
        return this.cacheInfo.hasHistoricalCountries && !this.isCacheExpired(CACHE_TYPE.COUNTRIES_HISTORY);
    }

    private addToCache(cacheType: CACHE_TYPE, data: any): void {
        if (cacheType === CACHE_TYPE.COUNTRIES) {
            this.cacheInfo.hasCountries = true;
            this.cacheInfo.countriesUpdated = moment();
            this.cacheInfo.countries.next(data);
        } else if (cacheType === CACHE_TYPE.SUMMARY) {
            this.cacheInfo.hasSummary = true;
            this.cacheInfo.summaryUpdated = moment();
            this.cacheInfo.summary.next(data);
        } else if (cacheType === CACHE_TYPE.COUNTRIES_HISTORY) {
            this.cacheInfo.hasHistoricalCountries = true;
            this.cacheInfo.historicalCountriesUpdated = moment();
            this.cacheInfo.historicalCountries.next(data);
        }
    }

    private isCacheExpired(cacheType: CACHE_TYPE): boolean {
        const key = cacheType === CACHE_TYPE.COUNTRIES 
            ? 'countriesUpdated' : 'summaryUpdated';
        
        const cacheTimeCheck = this.cacheInfo[key].add(5, 'minute');

        return cacheTimeCheck.isBefore(moment(), 'minute');
    }

}
