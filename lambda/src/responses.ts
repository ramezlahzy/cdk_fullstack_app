import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient, headers, RESPONSES_TABLE } from './helpers';
import { Respondent } from '@/shared-folders/types/respondents.types';
import { Submit } from '@/shared-folders/types/Response.types';


export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const pathParameters = event.pathParameters || {};
  const responseid = pathParameters?.id;

  try {
    if (method === 'POST') {
      const body = JSON.parse(event.body || '{}');

      const responseid = uuidv4();
      const Item = {
        responseid,
        ...body,
      } as Submit

      const command = new PutCommand({
        TableName: RESPONSES_TABLE,
        Item,
      });

      await docClient.send(command);
      return {
        statusCode: 201,
        body: JSON.stringify({ responseid, ...body }),
        headers,
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Invalid Request method=${method} responseid=${responseid}`,
        pathParameters
      }),
      headers,
    };

  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: error.message,
        body: event.body,
        method
      }),
      headers,
    };
  }
};
