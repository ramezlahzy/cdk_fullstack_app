"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
const helpers_1 = require("./helpers");
const handler = async (event) => {
    const method = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const surveytypeid = pathParameters.id;
    try {
        if (method === 'GET') {
            if (surveytypeid) {
                const request = await helpers_1.docClient.send(new lib_dynamodb_1.GetCommand({
                    TableName: helpers_1.SURVEY_TYPES_TABLE,
                    Key: { surveytypeid }
                }));
                return { statusCode: 200, body: JSON.stringify(request.Item), headers: helpers_1.headers };
            }
            const request = await helpers_1.docClient.send(new lib_dynamodb_1.ScanCommand({
                TableName: helpers_1.SURVEY_TYPES_TABLE,
            }));
            return { statusCode: 200, body: JSON.stringify(request.Items), headers: helpers_1.headers };
        }
        if (method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            let surveytypeid = body.surveytypeid;
            if (!(0, uuid_1.validate)(surveytypeid)) {
                surveytypeid = (0, uuid_1.v4)();
            }
            const Item = {
                surveytypeid,
                ...body,
            };
            const command = new lib_dynamodb_1.PutCommand({
                TableName: helpers_1.SURVEY_TYPES_TABLE,
                Item,
            });
            await helpers_1.docClient.send(command);
            return { statusCode: 201, body: JSON.stringify({ surveytypeid, ...body }), headers: helpers_1.headers };
        }
        if (method === 'PATCH' && surveytypeid) {
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
                TableName: helpers_1.SURVEY_TYPES_TABLE,
                Key: { surveytypeid },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ExpressionAttributeNames: expressionAttributeNames,
                ReturnValues: 'ALL_NEW',
            });
            const response = await helpers_1.docClient.send(command);
            return { statusCode: 200, body: JSON.stringify({ surveytypeid, ...body }), headers: helpers_1.headers };
        }
        return {
            statusCode: 400,
            body: JSON.stringify({ message: `Invalid Request method=${method} surveytypeid=${surveytypeid}`, pathParameters }),
            headers: helpers_1.headers,
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message, body: event.body, method }),
        };
    }
};
exports.handler = handler;
