"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
const helpers_1 = require("./helpers");
const handler = async (event) => {
    const method = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    try {
        const currentUser = await (0, helpers_1.getCurrentUser)(event);
        const clientid = currentUser?.clientid;
        if (method === 'GET') {
            console.log('clientid', clientid);
            const request = await helpers_1.docClient.send(new lib_dynamodb_1.GetCommand({
                TableName: helpers_1.CLIENTS_TABLE,
                Key: { clientid },
            }));
            console.log('request', request);
            if (!request.Item) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: 'Client not found with id= ' + clientid }),
                    headers: helpers_1.headers,
                };
            }
            const response = request.Item;
            return { statusCode: 200, body: JSON.stringify(response), headers: helpers_1.headers };
        }
        if (method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            let clientid = body.clientid;
            clientid = (0, uuid_1.v4)();
            const Item = {
                clientid, ...body,
            };
            const command = new lib_dynamodb_1.PutCommand({
                TableName: helpers_1.CLIENTS_TABLE,
                Item,
            });
            await helpers_1.docClient.send(command);
            return { statusCode: 201, body: JSON.stringify({ clientid, ...body }), headers: helpers_1.headers };
        }
        if (method === 'PATCH') {
            const body = JSON.parse(event.body || '{}');
            let updateExpression = 'set ';
            const expressionAttributeValues = {};
            const expressionAttributeNames = {};
            for (const key in body) {
                updateExpression += `#${key} = :${key},`;
                expressionAttributeValues[`:${key}`] = body[key];
                expressionAttributeNames[`#${key}`] = key;
            }
            updateExpression = updateExpression.slice(0, -1);
            const command = new lib_dynamodb_1.UpdateCommand({
                TableName: helpers_1.CLIENTS_TABLE,
                Key: { clientid },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ExpressionAttributeNames: expressionAttributeNames,
                ReturnValues: 'ALL_NEW',
            });
            await helpers_1.docClient.send(command);
            const client = { clientid, ...body };
            return { statusCode: 200, body: JSON.stringify(client), headers: helpers_1.headers };
        }
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid Request method=' + method + " clientId= " + clientid, pathParameters }),
            headers: helpers_1.headers,
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message, body: event.body, method }),
            headers: helpers_1.headers,
        };
    }
};
exports.handler = handler;
