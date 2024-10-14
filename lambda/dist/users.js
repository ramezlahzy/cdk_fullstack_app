"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
const aws_sdk_1 = require("aws-sdk");
const helpers_1 = require("./helpers");
const TABLE_NAME = process.env.USERS_TABLE || 'usersTable';
const cognito = new aws_sdk_1.CognitoIdentityServiceProvider();
const handler = async (event) => {
    const method = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const client = new client_dynamodb_1.DynamoDBClient({});
    const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
    const userid = pathParameters.id;
    try {
        const currentUser = await (0, helpers_1.getCurrentUser)(event);
        const clientid = currentUser?.clientid;
        if (method === 'GET') {
            if (userid) {
                const query = `SELECT * FROM ${TABLE_NAME} WHERE userid = ?`;
                const addItemStatementCommand = new lib_dynamodb_1.ExecuteStatementCommand({
                    Statement: query,
                    Parameters: [{ S: userid }],
                });
                const response = await docClient.send(addItemStatementCommand);
                if (!response.Items || response.Items.length === 0) {
                    return { statusCode: 404, body: JSON.stringify({ message: 'User not found' }), headers: helpers_1.headers };
                }
                return { statusCode: 200, body: JSON.stringify(response.Items[0]), headers: helpers_1.headers };
            }
            const query = `SELECT * FROM ${TABLE_NAME} WHERE clientid = ?`;
            const addItemStatementCommand = new lib_dynamodb_1.ExecuteStatementCommand({
                Statement: query,
                Parameters: [{ S: clientid }],
            });
            const response = await docClient.send(addItemStatementCommand);
            return { statusCode: 200, body: JSON.stringify(response.Items), headers: helpers_1.headers };
        }
        if (method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const email = body.email;
            if (!email) {
                return { statusCode: 400, body: JSON.stringify({ message: 'Email is required' }), headers: helpers_1.headers };
            }
            const userid = (0, uuid_1.v4)();
            const Item = {
                userid,
                clientid,
                ...body,
            };
            const command = new lib_dynamodb_1.PutCommand({
                TableName: TABLE_NAME,
                Item,
            });
            const cognitoParams = {
                UserPoolId: 'ap-southeast-2_RIbd7Vx4Q',
                Username: email,
                TemporaryPassword: '12345678',
                MessageAction: 'SUPPRESS',
                UserAttributes: [
                    { Name: 'email', Value: email },
                ],
            };
            await cognito.adminCreateUser(cognitoParams).promise();
            await docClient.send(command);
            return { statusCode: 200, body: JSON.stringify(Item), headers: helpers_1.headers };
        }
        if (method === 'PATCH' && userid) {
            const body = JSON.parse(event.body || '{}');
            let updateExpression = "SET";
            const expressionAttributeValues = {};
            const expressionAttributeNames = {};
            if (body.firstName) {
                updateExpression += " firstName = :firstName,";
                expressionAttributeValues[":firstName"] = body.firstName;
            }
            if (body.lastName) {
                updateExpression += " lastName = :lastName,";
                expressionAttributeValues[":lastName"] = body.lastName;
            }
            if (body.accesslevel) {
                updateExpression += " accesslevel = :accesslevel,";
                expressionAttributeValues[":accesslevel"] = body.accesslevel;
            }
            if (body.status) {
                updateExpression += " #status = :status,";
                expressionAttributeValues[":status"] = body.status;
                expressionAttributeNames["#status"] = "status";
            }
            updateExpression = updateExpression.slice(0, -1);
            const updateCommand = new lib_dynamodb_1.UpdateCommand({
                TableName: TABLE_NAME,
                Key: { userid },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ExpressionAttributeNames: expressionAttributeNames,
                ReturnValues: "ALL_NEW",
                ConditionExpression: "attribute_exists(userid)",
            });
            const result = await docClient.send(updateCommand);
            return {
                statusCode: 200,
                body: JSON.stringify({ userid, ...result.Attributes }),
                headers: helpers_1.headers
            };
        }
        return { statusCode: 400, body: JSON.stringify({ message: 'Invalid Request method or parameters', headers: helpers_1.headers }) };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message, headers: helpers_1.headers })
        };
    }
};
exports.handler = handler;
