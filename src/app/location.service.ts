import { Injectable } from '@angular/core';
import { GeocodeResponse } from './models';
import { HttpParams, HttpClient } from '@angular/common/http';
import { environment } from '../environments/environment';
import { Observable } from 'rxjs';


@Injectable({
    providedIn: 'root'
})
export class LocationService {

    private base = `https://geoservices.tamu.edu/Services/ReverseGeocoding/WebService/v04_01/Rest`;
    private geocoderVersion = '4.10';
    private responseFormat = 'json';

    constructor(private http: HttpClient) {}

    getReverseGeocode(lat: number, long: number): Observable<GeocodeResponse> {
        return this.http.get<GeocodeResponse>(this.base, { 
            params: {
                lat: lat.toString(),
                lon: long.toString(),
                apiKey: environment.geocoderKey,
                format: this.responseFormat,
                version: this.geocoderVersion
            },
            reportProgress: false
        });
    }

}
