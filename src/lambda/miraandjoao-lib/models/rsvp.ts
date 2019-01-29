import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import AttributeMap = DocumentClient.AttributeMap;

import {RsvpDetails} from "./rsvpdetails";

export interface Rsvp extends AttributeMap {
    usertag: string;
    timestamp?: number;
    people: RsvpDetails[];
    bachelorparty?: boolean;
    bacheloretteparty?: boolean;
    allowchildren: boolean;
}