"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const helpers_1 = require("./helpers");
const RESPONSE_SET_TABLE = 'responseSetTable';
const SURVEY_TYPE_TABLE = 'surveyTypeTable';
const handler = async (event) => {
    const method = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const client = lib_dynamodb_1.DynamoDBDocumentClient.from(new client_dynamodb_1.DynamoDBClient({}));
    try {
        const responsesetid = pathParameters.id;
        if (responsesetid && method === 'GET') {
            const params = {
                TableName: RESPONSE_SET_TABLE,
                Key: {
                    responsesetid,
                },
            };
            const command = new lib_dynamodb_1.GetCommand(params);
            const data = await client.send(command);
            const responseSet = data.Item;
            if (!responseSet) {
                return {
                    statusCode: 404,
                    body: JSON.stringify({ message: `Response set not found for id: ${responsesetid}` }),
                    headers: helpers_1.headers,
                };
            }
            const surveytypeid = responseSet.surveytypeid;
            const surveyTypeParams = {
                TableName: SURVEY_TYPE_TABLE,
                Key: {
                    surveytypeid,
                },
            };
            const surveyTypeCommand = new lib_dynamodb_1.GetCommand(surveyTypeParams);
            const surveyTypeData = await client.send(surveyTypeCommand);
            const surveyType = surveyTypeData.Item;
            if (surveyType) {
                responseSet.surveyType = surveyType;
            }
            return {
                statusCode: 200,
                body: JSON.stringify(responseSet),
                headers: helpers_1.headers,
            };
        }
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: `Invalid Request method=${method}, responsesetid=${responsesetid}`,
                pathParameters,
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
                method,
            }),
        };
    }
};
exports.handler = handler;
