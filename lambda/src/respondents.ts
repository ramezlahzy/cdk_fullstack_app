import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { PutCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ExecuteStatementCommand } from "@aws-sdk/lib-dynamodb";
import { docClient, getCurrentUser, headers, RESPONDENTS_TABLE, USERS_TABLE } from './helpers';
import * as uuid from 'uuid';
import { Respondent } from '@/shared-folders/types/respondents.types';


export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const respondentid = pathParameters.id;

    try {
        const currentUser = await getCurrentUser(event);
        const clientId = currentUser?.clientid;
        const clientid = clientId;

        if (method === 'GET' && respondentid) {
            const query = `SELECT * FROM ${RESPONDENTS_TABLE} WHERE respondentid = ?`;
            const addItemStatementCommand = new ExecuteStatementCommand({
                Statement: query,
                Parameters: [respondentid],
            });
            const responseSetData = await docClient.send(addItemStatementCommand);
            const responseSet = responseSetData.Items?.[0] as Respondent;
            if (!responseSet) {
                return { statusCode: 404, body: JSON.stringify({ message: 'Respondent not found' }), headers };
            }
            return { statusCode: 200, body: JSON.stringify(responseSet), headers };
        } else if (method === 'GET') {
            console.log('clientId', clientId);
            console.log('RESPONDENTS_TABLE', RESPONDENTS_TABLE);
            const query = `SELECT * FROM ${RESPONDENTS_TABLE} WHERE clientid = ?`;
            const addItemStatementCommand = new ExecuteStatementCommand({
                Statement: query,
                Parameters: [clientId],
            });
            const responseSetData = await docClient.send(addItemStatementCommand)
            if (!responseSetData.Items) return { statusCode: 404, body: JSON.stringify({ message: 'Respondents not found' }), headers };

            const responses = responseSetData.Items as Respondent[];
            return { statusCode: 200, body: JSON.stringify(responses), headers };
        }

        if (method === 'DELETE') {
            const respondentId = event.pathParameters?.id;
            if (!respondentId) {
                return { statusCode: 400, body: JSON.stringify({ message: 'respondentid is required' }), headers };
            }
            const deleteCommand = new ExecuteStatementCommand({
                Statement: `DELETE FROM ${RESPONDENTS_TABLE} WHERE respondentid = ?`,
                Parameters: [respondentId],
            });
            await docClient.send(deleteCommand);
            return { statusCode: 204, headers, body: '' };
        }

        if (method === 'POST') {
            const body = event.body;
            if (!body) return { statusCode: 400, body: JSON.stringify({ message: 'Request body is required' }), headers };

            const respondents = JSON.parse(body).respondents;
            for (let i = 0; i < respondents.length; i++) {
                const respondentid = uuid.v4();
                const email = respondents[i].email;
                if (!email) {
                    return { statusCode: 400, body: JSON.stringify({ message: 'Email is required' }), headers };
                }
                
                const Item: Respondent = {
                    respondentid,
                    clientid,
                    contacthistory: {},
                    ...respondents[i],
                };
                const command = new PutCommand({
                    TableName: RESPONDENTS_TABLE,
                    Item
                });
                await docClient.send(command);
            }
            return { statusCode: 200, body: JSON.stringify(body), headers };
        }

        if (method === 'PATCH' && respondentid) {
            let updateExpression = "SET";
            let ExpressionAttributeValues: Record<string, any> = {};
            const body = JSON.parse(event.body || '{}') as Respondent;

            if (!body) {
                return { statusCode: 400, body: JSON.stringify({ message: 'Request body is required' }), headers };
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
                TableName: RESPONDENTS_TABLE,
                Key: { respondentid },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues,
                ReturnValues: 'ALL_NEW' as const,
            };
            const command = new UpdateCommand(params);
            const result = await docClient.send(command);

            return {
                statusCode: 200,
                body: JSON.stringify({ respondentid, ...result.Attributes, method: 'PATCH', updateExpression }),
                headers
            };
        }

        return { statusCode: 400, body: JSON.stringify({ message: `Invalid Request method=${method}` }), headers };
    } catch (error: any) {
        return { statusCode: 500, body: JSON.stringify({ message: error.message, body: event.body }), headers };
    }
};
