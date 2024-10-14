"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const uuid_1 = require("uuid");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const helpers_1 = require("./helpers");
const handler = async (event) => {
    const method = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const responseid = pathParameters?.id;
    try {
        if (method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const responseid = (0, uuid_1.v4)();
            const Item = {
                responseid,
                ...body,
            };
            const command = new lib_dynamodb_1.PutCommand({
                TableName: helpers_1.RESPONSES_TABLE,
                Item,
            });
            await helpers_1.docClient.send(command);
            return {
                statusCode: 201,
                body: JSON.stringify({ responseid, ...body }),
                headers: helpers_1.headers,
            };
        }
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: `Invalid Request method=${method} responseid=${responseid}`,
                pathParameters
            }),
            headers: helpers_1.headers,
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: error.message,
                body: event.body,
                method
            }),
            headers: helpers_1.headers,
        };
    }
};
exports.handler = handler;
