import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import AttributeMap = DocumentClient.AttributeMap;

import {isRsvpDetails, RsvpDetails} from "./rsvpdetails";
import {getPeople, User} from "./user";

export interface Rsvp extends AttributeMap {
    usertag: string;
    timestamp?: number;
    people: RsvpDetails[];
    bachelorparty?: boolean;
    bacheloretteparty?: boolean;
    allowchildren: boolean;
}

export function isRsvp(arg: any): arg is Rsvp {
    return arg != undefined && arg != null
        && arg.usertag != undefined && arg.usertag != null && typeof(arg.usertag) == "string"
        && arg.timestamp != undefined && arg.timestamp != null && typeof(arg.timestamp) == "number"
        && arg.people != undefined && arg.people != null && arg.people.every((p: any) => isRsvpDetails(p))
        && arg.bachelorparty != undefined && arg.bachelorparty != null && typeof(arg.bachelorparty) == "boolean"
        && arg.bacheloretteparty != undefined && arg.bacheloretteparty != null && typeof(arg.bacheloretteparty) == "boolean"
        && arg.allowchildren != undefined && arg.allowchildren != null && typeof(arg.allowchildren) == "boolean";
}

export function isValidRsvpForUser(rsvp: Rsvp, user: User): boolean {
    // Ensure that the people match up
    let userPeople = getPeople(user);
    return userPeople.length == rsvp.people.length
        && rsvp.people.every(p => userPeople.some(up => up.name == p.name));
}