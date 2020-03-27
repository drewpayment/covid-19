
export interface CovidLocations {
    latest: LatestSum;
    locations: CovidLocation[];
}

export interface CovidLocation {
    id: number;
    country: string;
    country_code: string;
    province: string;
    coordinates: LatLong;
    latest: LatestSum;
    timelines: Timelines;
}

export interface Timelines {
    confirmed: TimelineDetail;
    deaths: TimelineDetail;
    recovered: TimelineDetail;
}

export interface TimelineDetail {
    latest: number;
    timeline: TimelineCategoricalDetail;
}

export interface TimelineCategoricalDetail {
    [key: string]: number;
}

export interface LatLong {
    latitude: string;
    longitude: string;
}

export interface LatestSum {
    confirmed: number;
    deaths: number;
    recovered: number;
}

export interface LocationDetail {
    location: CovidLocation;
}
