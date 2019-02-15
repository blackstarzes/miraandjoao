import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import AttributeMap = DocumentClient.AttributeMap;

import {DeliveryDetails} from "./deliverydetails";
import {RsvpDetails} from "./rsvpdetails";

export interface User extends AttributeMap {
    accommodationprovided?: number;
    allowchildren: boolean;
    delivered: DeliveryDetails;
    invitedcount: number;
    invitednames: string;
    language: string;
    linkeduserid?: string;
    rsvpcount: number;
    salutation: string;
    userid: string;
    usertag: string;
}

export function getPeople(user: User) {
    return user.invitednames
        .replace(" and ", ", ")
        .replace(" и ", ", ")
        .split(",")
        .map(function (item) {
            const person: RsvpDetails = {
                name: item.trim()
            };
            return person;
        });
}