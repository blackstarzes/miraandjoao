import {DocumentClient} from "aws-sdk/lib/dynamodb/document_client";
import AttributeMap = DocumentClient.AttributeMap;

export interface DeliveryDetails extends AttributeMap {
    savethedate: boolean;
}