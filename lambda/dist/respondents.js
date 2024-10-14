"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const lib_dynamodb_2 = require("@aws-sdk/lib-dynamodb");
const helpers_1 = require("./helpers");
const uuid = __importStar(require("uuid"));
const handler = async (event) => {
    const method = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const respondentid = pathParameters.id;
    try {
        const currentUser = await (0, helpers_1.getCurrentUser)(event);
        const clientId = currentUser?.clientid;
        const clientid = clientId;
        if (method === 'GET' && respondentid) {
            const query = `SELECT * FROM ${helpers_1.RESPONDENTS_TABLE} WHERE respondentid = ?`;
            const addItemStatementCommand = new lib_dynamodb_2.ExecuteStatementCommand({
                Statement: query,
                Parameters: [respondentid],
            });
            const responseSetData = await helpers_1.docClient.send(addItemStatementCommand);
            const responseSet = responseSetData.Items?.[0];
            if (!responseSet) {
                return { statusCode: 404, body: JSON.stringify({ message: 'Respondent not found' }), headers: helpers_1.headers };
            }
            return { statusCode: 200, body: JSON.stringify(responseSet), headers: helpers_1.headers };
        }
        else if (method === 'GET') {
            console.log('clientId', clientId);
            console.log('RESPONDENTS_TABLE', helpers_1.RESPONDENTS_TABLE);
            const query = `SELECT * FROM ${helpers_1.RESPONDENTS_TABLE} WHERE clientid = ?`;
            const addItemStatementCommand = new lib_dynamodb_2.ExecuteStatementCommand({
                Statement: query,
                Parameters: [clientId],
            });
            const responseSetData = await helpers_1.docClient.send(addItemStatementCommand);
            if (!responseSetData.Items)
                return { statusCode: 404, body: JSON.stringify({ message: 'Respondents not found' }), headers: helpers_1.headers };
            const responses = responseSetData.Items;
            return { statusCode: 200, body: JSON.stringify(responses), headers: helpers_1.headers };
        }
        if (method === 'DELETE') {
            const respondentId = event.pathParameters?.id;
            if (!respondentId) {
                return { statusCode: 400, body: JSON.stringify({ message: 'respondentid is required' }), headers: helpers_1.headers };
            }
            const deleteCommand = new lib_dynamodb_2.ExecuteStatementCommand({
                Statement: `DELETE FROM ${helpers_1.RESPONDENTS_TABLE} WHERE respondentid = ?`,
                Parameters: [respondentId],
            });
            await helpers_1.docClient.send(deleteCommand);
            return { statusCode: 204, headers: helpers_1.headers, body: '' };
        }
        if (method === 'POST') {
            const body = event.body;
            if (!body)
                return { statusCode: 400, body: JSON.stringify({ message: 'Request body is required' }), headers: helpers_1.headers };
            const respondents = JSON.parse(body).respondents;
            for (let i = 0; i < respondents.length; i++) {
                const respondentid = uuid.v4();
                const email = respondents[i].email;
                if (!email) {
                    return { statusCode: 400, body: JSON.stringify({ message: 'Email is required' }), headers: helpers_1.headers };
                }
                const Item = {
                    respondentid,
                    clientid,
                    contacthistory: {},
                    ...respondents[i],
                };
                const command = new lib_dynamodb_1.PutCommand({
                    TableName: helpers_1.RESPONDENTS_TABLE,
                    Item
                });
                await helpers_1.docClient.send(command);
            }
            return { statusCode: 200, body: JSON.stringify(body), headers: helpers_1.headers };
        }
        if (method === 'PATCH' && respondentid) {
            let updateExpression = "SET";
            let ExpressionAttributeValues = {};
            const body = JSON.parse(event.body || '{}');
            if (!body) {
                return { statusCode: 400, body: JSON.stringify({ message: 'Request body is required' }), headers: helpers_1.headers };
            }
            if (body.email) {
                updateExpression += " email = :email,";
                ExpressionAttributeValues[':email'] = body.email;
            }
            if (body.firstName) {
                updateExpression += " firstName = :firstName,";
                ExpressionAttributeValues[':firstName'] = body.firstName;
            }
            if (body.lastName) {
                updateExpression += " lastName = :lastName,";
                ExpressionAttributeValues[':lastName'] = body.lastName;
            }
            updateExpression = updateExpression.trim().replace(/,\s*$/, "");
            const params = {
                TableName: helpers_1.RESPONDENTS_TABLE,
                Key: { respondentid },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues,
                ReturnValues: 'ALL_NEW',
            };
            const command = new lib_dynamodb_1.UpdateCommand(params);
            const result = await helpers_1.docClient.send(command);
            return {
                statusCode: 200,
                body: JSON.stringify({ respondentid, ...result.Attributes, method: 'PATCH', updateExpression }),
                headers: helpers_1.headers
            };
        }
        return { statusCode: 400, body: JSON.stringify({ message: `Invalid Request method=${method}` }), headers: helpers_1.headers };
    }
    catch (error) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message, body: event.body }), headers: helpers_1.headers };
    }
};
exports.handler = handler;
