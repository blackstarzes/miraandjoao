import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import AttributeMap = DocumentClient.AttributeMap;

import {DeliveryDetails} from "./deliverydetails";

export interface User extends AttributeMap {
    allowchildren: boolean;
    delivered: DeliveryDetails;
    invitedcount: number;
    invitednames: string;
    language: string;
    rsvpcount: number;
    salutation: string;
    userid: string;
    usertag: string;
}