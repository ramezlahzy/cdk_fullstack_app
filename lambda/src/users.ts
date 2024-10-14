import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, QueryCommand, ExecuteStatementCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { getCurrentUser, headers, USERS_TABLE } from './helpers';
import config from './assets/config';
const cognito = new CognitoIdentityServiceProvider();

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const method = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const client = new DynamoDBClient({});
    const docClient = DynamoDBDocumentClient.from(client);
    const userid = pathParameters.id;

    try {
        const currentUser = await getCurrentUser(event);
        const clientid = currentUser?.clientid;

        if (method === 'GET') {
            if (userid) {
                const query = `SELECT * FROM ${USERS_TABLE} WHERE userid = ?`;
                const addItemStatementCommand = new ExecuteStatementCommand({
                    Statement: query,
                    Parameters: [{ S: userid }],
                });
                const response = await docClient.send(addItemStatementCommand);
                if (!response.Items || response.Items.length === 0) {
                    return { statusCode: 404, body: JSON.stringify({ message: 'User not found' }), headers };
                }
                return { statusCode: 200, body: JSON.stringify(response.Items[0]), headers };
            }

            const query = `SELECT * FROM ${USERS_TABLE} WHERE clientid = ?`;
            const addItemStatementCommand = new ExecuteStatementCommand({
                Statement: query,
                Parameters: [clientid],
            });
            const response = await docClient.send(addItemStatementCommand);
            return { statusCode: 200, body: JSON.stringify(response.Items), headers };
        }

        if (method === 'POST') {
            const body = JSON.parse(event.body || '{}');
            const email = body.email;

            if (!email) {
                return { statusCode: 400, body: JSON.stringify({ message: 'Email is required' }), headers };
            }

            const userid = uuidv4();
            const Item = {
                userid,
                clientid,
                ...body,
            };
            console.log('Item', Item);

            const command = new PutCommand({
                TableName: USERS_TABLE,
                Item,
            });

            const cognitoParams = {
                UserPoolId: config.UserPoolId,  // Update with actual pool ID
                Username: email,
                TemporaryPassword: '12345678',
                MessageAction: 'SUPPRESS',
                UserAttributes: [
                    { Name: 'email', Value: email },  // Required attribute
                ],
            };

            await cognito.adminCreateUser(cognitoParams).promise();
            await docClient.send(command);
            return { statusCode: 200, body: JSON.stringify(Item), headers };
        }

        if (method === 'PATCH' && userid) {
            const body = JSON.parse(event.body || '{}');

            // Build the UpdateExpression dynamically
            let updateExpression = "SET";
            const expressionAttributeValues: { [key: string]: any } = {};
            const expressionAttributeNames: { [key: string]: any } = {};

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
                updateExpression += " #status = :status,";  // Alias for 'status', reserved word in DynamoDB
                expressionAttributeValues[":status"] = body.status;
                expressionAttributeNames["#status"] = "status";
            }

            // Remove trailing comma
            updateExpression = updateExpression.slice(0, -1);

            const updateCommand = new UpdateCommand({
                TableName: USERS_TABLE,
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
                headers
            };
        }

        return { statusCode: 400, body: JSON.stringify({ message: 'Invalid Request method or parameters', headers }) };

    } catch (error: any) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message, headers })
        };
    }
};
