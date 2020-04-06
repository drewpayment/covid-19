
export interface GeoSpatial {
    type: string;
    features: GeoSpatialFeature[];
}

export interface GeoSpatialFeature {
    type: string;
    properties: GeoSpatialFeatureProperties;
    geometry: GeoSpatialFeatureGeometry;
}

export interface GeoSpatialFeatureProperties {
    GEO_ID: string;
    STATE: number;
    COUNTY: string;
    NAME: string;
    LSAD: string;
    CENSUSAREA: number;
}

export interface GeoSpatialFeatureGeometry {
    type: string;
    coordinates: number[][][];
}

// {
//     "type": "FeatureCollection",
//     "features": [
//         { 
//             "type": "Feature", 
//             "properties": { 
//                 "GEO_ID": "0500000US01001", 
//                 "STATE": "01", 
//                 "COUNTY": "001", 
//                 "NAME": "Autauga", 
//                 "LSAD": "County", 
//                 "CENSUSAREA": 594.436000 
//             }, 
//             "geometry": { 
//                 "type": "Polygon", 
//                 "coordinates": [
//                     [
//                         [-86.496774, 32.344437], 
//                         [-86.717897, 32.402814], 
//                         [-86.814912, 32.340803], 
//                         [-86.890581, 32.502974], 
//                         [-86.917595, 32.664169], 
//                         [-86.713390, 32.661732], 
//                         [-86.714219, 32.705694], 
//                         [-86.413116, 32.707386], 
//                         [-86.411172, 32.409937], 
//                         [-86.496774, 32.344437]
//                     ]
//                 ] 
//             } 
//         }