
export interface GeocodeResponse {
    TransactionId: string;
    Version: number;
    QueryStatusCode: string;
    TimeTaken: number;
    Exception: string;
    ErrorMessage: string;
    StreetAddresses: GeocodeDetail[];
}

export interface GeocodeDetail {
    TransactionId: string;
    Version: number;
    QueryStatusCode: string;
    TimeTaken: number;
    Exception: string;
    ErrorMessage: string;
    APN: string;
    StreetAddress: string;
    City: string;
    State: string;
    Zip: number;
    ZipPlus4: number;
}
