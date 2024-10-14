import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4, validate as uuidValidate } from 'uuid';
import { docClient, headers, SURVEY_TYPES_TABLE } from './helpers';


export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const pathParameters = event.pathParameters || {};
  const surveytypeid = pathParameters.id;

  try {
    if (method === 'GET') {
      if (surveytypeid) {
        const request = await docClient.send(new GetCommand({
          TableName: SURVEY_TYPES_TABLE,
          Key: { surveytypeid }
        }));
        return { statusCode: 200, body: JSON.stringify(request.Item), headers };
      }

      const request = await docClient.send(new ScanCommand({
        TableName: SURVEY_TYPES_TABLE,
      }));
      return { statusCode: 200, body: JSON.stringify(request.Items), headers };
    }

    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');

      let surveytypeid = body.surveytypeid;
      // Check if UUID is valid
      if (!uuidValidate(surveytypeid)) {
        surveytypeid = uuidv4();
      }

      const Item = {
        surveytypeid,
        ...body,
      };

      const command = new PutCommand({
        TableName: SURVEY_TYPES_TABLE,
        Item,
      });

      await docClient.send(command);
      return { statusCode: 201, body: JSON.stringify({ surveytypeid, ...body }), headers };
    }

    if (method === 'PATCH' && surveytypeid) {
      const body = JSON.parse(event.body || '{}');
      let updateExpression = 'set ';
      const expressionAttributeValues: { [key: string]: any } = {};
      const expressionAttributeNames: { [key: string]: any } = {};

      for (const key in body) {
        updateExpression += `#${key} = :${key},`;
        expressionAttributeValues[`:${key}`] = body[key];
        expressionAttributeNames[`#${key}`] = key;
      }

      updateExpression = updateExpression.slice(0, -1);

      const command = new UpdateCommand({
        TableName: SURVEY_TYPES_TABLE,
        Key: { surveytypeid },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW',
      });

      const response = await docClient.send(command);
      return { statusCode: 200, body: JSON.stringify({ surveytypeid, ...body }), headers };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({ message: `Invalid Request method=${method} surveytypeid=${surveytypeid}`, pathParameters }),
      headers,
    };

  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message, body: event.body, method }),
    };
  }
};
