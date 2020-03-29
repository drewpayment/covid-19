import { Moment } from 'moment';

/**
 * Resources for corona.lmao API
 */
export interface CoronaSummary {
    cases: number;
    deaths: number;
    recovered: number;
    updated: Date | Moment | string;
}

export interface CoronaCountry {
    country: string;
    cases: number;
    todayCases: number;
    deaths: number;
    todayDeaths: number;
    recovered: number;
    active: number;
    critical: number;
    casesPerOneMillion: number;
    countryInfo: CoronaCountryInfo;
}

export interface CoronaState {
    state: string;
    cases: number;
    todayCases: number;
    deaths: number;
    todayDeaths: number;
    recovered: number;
    active: number;
}

export interface CoronaCountryInfo {
    iso2: string;
    iso3: string;
    _id: number;
    lat: number;
    long: number;
    flag: string;
}

export interface CountryHistorical {
    country: string;
    timeline: CountryHistoricalTimelineCategories;
}

export interface CountryHistoricalTimelineCategories {
    cases: CountryHistoricalTimelineDetail;
    deaths: CountryHistoricalTimelineDetail;
}

/**
 * key: Date string
 * value: number
 * e.g. "01/01/1900": 0
 */
export interface CountryHistoricalTimelineDetail {
    [key: string]: any;
}
