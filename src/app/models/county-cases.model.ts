import { Moment } from 'moment';

export interface CountyCasesWithGeoData {
    countyCasesList: CountyCases[];
    geoData: CountyCenter[];
}

export interface CountyCases {
    date: Moment | Date | string;
    county: string;
    state: string;
    fips: number;
    cases: number;
    deaths: number;
}

export interface CountyCenter {
    fips: number;
    clon00: number;
    clat00: number;
    clon10: number;
    clat10: number;
    pclon00: number;
    pclat00: number;
    pclon10: number;
    pclat10: number;
}
