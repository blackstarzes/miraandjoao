import {Diet} from "./diet";

export interface RsvpDetails {
    name: string;
    rsvpResponse?: boolean;
    diet?: Diet;
    allergies?: string;
}

export function isRsvpDetails(arg: any): arg is RsvpDetails {
    return arg != undefined && arg != null
        && arg.name != undefined && arg.name != null && typeof(arg.name) == "string"
        && arg.rsvpResponse != undefined && arg.rsvpResponse != null && typeof(arg.rsvpResponse) == "boolean"
        && arg.diet != undefined && arg.diet != null && arg.diet in Diet
        && (arg.allergies == undefined || arg.allergies == null || typeof(arg.allergies) == "string");
}