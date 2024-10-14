import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { GetCommand, DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { headers } from './helpers';

const RESPONSE_SET_TABLE = 'responseSetTable';
const SURVEY_TYPE_TABLE = 'surveyTypeTable';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const pathParameters = event.pathParameters || {};
  const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

  try {
    const responsesetid = pathParameters.id;

    if (responsesetid && method === 'GET') {
      // Get response set by ID
      const params = {
        TableName: RESPONSE_SET_TABLE,
        Key: {
          responsesetid,
        },
      };
      const command = new GetCommand(params);
      const data = await client.send(command);
      const responseSet = data.Item;

      if (!responseSet) {
        return {
          statusCode: 404,
          body: JSON.stringify({ message: `Response set not found for id: ${responsesetid}` }),
          headers,
        };
      }

      const surveytypeid = responseSet.surveytypeid;

      // Get survey type by ID
      const surveyTypeParams = {
        TableName: SURVEY_TYPE_TABLE,
        Key: {
          surveytypeid,
        },
      };
      const surveyTypeCommand = new GetCommand(surveyTypeParams);
      const surveyTypeData = await client.send(surveyTypeCommand);
      const surveyType = surveyTypeData.Item;

      if (surveyType) {
        responseSet.surveyType = surveyType;
      }

      return {
        statusCode: 200,
        body: JSON.stringify(responseSet),
        headers,
      };
    }

    return {
      statusCode: 400,
      body: JSON.stringify({
        message: `Invalid Request method=${method}, responsesetid=${responsesetid}`,
        pathParameters,
      }),
      headers,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: (error as Error).message,
        body: event.body,
        method,
      }),
    };
  }
};
