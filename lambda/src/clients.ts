import { APIGatewayProxyEvent } from 'aws-lambda';
import { PutCommand, GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { getCurrentUser, headers, docClient, CLIENTS_TABLE } from './helpers';
import { Client } from '@/shared-folders/types/client.types';


export const handler = async (event: APIGatewayProxyEvent): Promise<{
  statusCode: number;
  body: string;
  headers: { [key: string]: string };
}> => {
  const method = event.httpMethod;
  const pathParameters = event.pathParameters || {};

  try {
    const currentUser = await getCurrentUser(event);
    const clientid = currentUser?.clientid;

    if (method === 'GET') {
      console.log('clientid', clientid);

      const request = await docClient.send(
        new GetCommand({
          TableName: CLIENTS_TABLE,
          Key: { clientid },
        })
      );
      console.log('request', request);

      if (!request.Item) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: 'Client not found with id= ' + clientid }),
          headers,
        };
      }
      const response = request.Item as Client;

      return { statusCode: 200, body: JSON.stringify(response), headers };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');
      let clientid = body.clientid;

      clientid = uuidv4();

      const Item = {
        clientid, ...body,
      };

      const command = new PutCommand({
        TableName: CLIENTS_TABLE,
        Item,
      });

      await docClient.send(command);
      return { statusCode: 201, body: JSON.stringify({ clientid, ...body }), headers };
    }

    if (method === 'PATCH') {
      const body = JSON.parse(event.body || '{}') as any;
      let updateExpression = 'set ';
      const expressionAttributeValues: { [key: string]: any } = {};
      const expressionAttributeNames: { [key: string]: string } = {};

      for (const key in body) {
        updateExpression += `#${key} = :${key},`;
        expressionAttributeValues[`:${key}`] = body[key];
        expressionAttributeNames[`#${key}`] = key;
      }

      updateExpression = updateExpression.slice(0, -1);

      const command = new UpdateCommand({
        TableName: CLIENTS_TABLE,
        Key: { clientid },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW',
      });

      await docClient.send(command)

      const client: Client = { clientid, ...body };
      return { statusCode: 200, body: JSON.stringify(client), headers };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid Request method=' + method + " clientId= " + clientid, pathParameters }),
      headers,
    };

  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message, body: event.body, method }),
      headers,
    };
  }
};
