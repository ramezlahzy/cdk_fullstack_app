import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ExecuteStatementCommand } from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { docClient, getCurrentUser, headers, RESPONSE_SETS_TABLE, RESPONSES_TABLE, SURVEY_TYPES_TABLE } from './helpers';
import { ResponseSet, SurveyType } from '@/shared-folders/types/survey.types';
import { Response } from '@/shared-folders/types/Response.types';


export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const method = event.httpMethod;
  const pathParameters = event.pathParameters || {};

  try {
    const currentUser = await getCurrentUser(event);
    const clientId = currentUser?.clientid;
    const surveyid = pathParameters.id;

    if (method === 'GET') {

      if (!clientId)
        return {
          statusCode: 404, headers, body: JSON.stringify({ message: `Client not found with id= ${clientId}` })
        };


      const surveyTypeData = await getSurveyTypes();
      console.log('surveyTypeData', surveyTypeData);
      const responseData = await getReponses(clientId);
      console.log('responseData', responseData);
      const responseSets = await getResponseSets(clientId, surveyTypeData, responseData);



      if (surveyid) {
        const survey = responseSets.find((survey) => survey.responsesetid === surveyid);
        if (!survey) {
          return {
            statusCode: 404, headers, body: JSON.stringify({ message: `Survey not found with id= ${surveyid}` })
          };
        }
        const responses = responseData?.filter((response: Response) => response.responsesetid === surveyid);
        const surveyDemographics: any = { demographic1: {}, demographic2: {} };

        for (const response of responses || []) {
          const responseContent = response.responsecontent;
          const firstDemographicValue = responseContent.demographic1;
          const secondDemographicValue = responseContent.demographic2;

          surveyDemographics.demographic1[firstDemographicValue] = (surveyDemographics.demographic1[firstDemographicValue] || 0) + 1;
          surveyDemographics.demographic2[secondDemographicValue] = (surveyDemographics.demographic2[secondDemographicValue] || 0) + 1;
        }

        survey.surveyDemographics = surveyDemographics;

        return {
          statusCode: 200,
          body: JSON.stringify(survey),
          headers
        };
      }

      return {
        statusCode: 200,
        body: JSON.stringify(responseSets),
        headers,
      };
    }

    if (method === 'POST') {
      const survey = JSON.parse(event.body || '{}')


      const responsesetid = uuidv4();
      survey.responsesetid = responsesetid;
      survey.clientid = clientId;

      const statusOptions = ['Open', 'Closed Auto', 'Closed Manual'];
      console.log('survey', survey);
      const params = {
        TableName: RESPONSE_SETS_TABLE,
        Item: survey
      };
      const command = new PutCommand(params);
      await docClient.send(command);

      survey.responsesetid = responsesetid;
      return {
        statusCode: 200,
        body: JSON.stringify(survey),
        headers,
      };
    }

    if (method === 'PATCH') {

      const survey = JSON.parse(event.body || '{}');
      const surveyid = pathParameters.id;
      const surveyTypeQuery = `SELECT * FROM ${SURVEY_TYPES_TABLE} WHERE surveytypeid = ?`;
      const surveyTypeCommand = new ExecuteStatementCommand({
        Statement: surveyTypeQuery,
        Parameters: [survey.surveytypeid],
      });
      const surveyTypeData = await docClient.send(surveyTypeCommand);

      if (!surveyTypeData.Items?.length) {
        return {
          statusCode: 404, headers, body: JSON.stringify({ message: `Survey Type not found with id= ${survey.surveytypeid}` })
        };
      }


      let updateExpression = 'set ';
      const expressionAttributeValues: { [key: string]: any } = {};
      const expressionAttributeNames: { [key: string]: string } = {};
      for (const key in survey) {
        if (key === 'responsesetid'
          || key === 'clientid'
        ) continue;
        updateExpression += `#${key} = :${key},`;
        expressionAttributeValues[`:${key}`] = survey[key];
        expressionAttributeNames[`#${key}`] = key;
      }
      updateExpression = updateExpression.slice(0, -1);
      const command = new UpdateCommand({
        TableName: RESPONSE_SETS_TABLE,
        Key: { responsesetid: surveyid },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW',
      });
      await docClient.send(command);
      const updatedSurvey = { responsesetid: surveyid, ...survey };
      return {
        statusCode: 200,
        body: JSON.stringify(updatedSurvey),
        headers,
      };

    }

    return {
      statusCode: 400,
      body: JSON.stringify({ message: `Invalid Request method=${method}` }),
      headers,
    };

  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message, body: event.body, method }),
    };
  }
};


const getResponseSets = async (clientid: string, surveyTypes: SurveyType[], responses: Response[]): Promise<ResponseSet[]> => {
  const query = `SELECT * FROM ${RESPONSE_SETS_TABLE} WHERE clientid = ?`;
  console.log("client id", clientid);
  console.log("query", query);
  const addItemStatementCommand = new ExecuteStatementCommand({
    Statement: query,
    Parameters: [clientid],
  });
  const responseSetData = await docClient.send(addItemStatementCommand);
  console.log('responseSetData', responseSetData);
  const responseSets = [] as ResponseSet[];
  const responseSetsData = responseSetData.Items;
  for (const responseSet of responseSetsData || []) {
    const { surveytypeid, responsesetid } = responseSet;
    const surveyType = surveyTypes?.find((surveyType: SurveyType) => surveyType.surveytypeid === surveytypeid);
    responseSet.surveyType = surveyType;
    const responsesForSurvey = responses.filter((response: any) => response.responsesetid === responsesetid);
    responseSet.responsesCount = responsesForSurvey?.length;
    responseSets.push(responseSet as ResponseSet);
  }



  return responseSets;
}

const getSurveyTypes = async (): Promise<SurveyType[]> => {
  const query = `SELECT * FROM ${SURVEY_TYPES_TABLE}`;
  const addItemStatementCommand = new ExecuteStatementCommand({
    Statement: query,
  });
  const surveyTypeData = await docClient.send(addItemStatementCommand);
  return surveyTypeData.Items as SurveyType[];
}

const getReponses = async (clientId: string): Promise<Response[]> => {

  const query = `SELECT * FROM ${RESPONSE_SETS_TABLE} WHERE clientid = ?`;
  const addItemStatementCommand = new ExecuteStatementCommand({
    Statement: query,
    Parameters: [clientId],
  });
  const responseSetData = await docClient.send(addItemStatementCommand);
  const responseSetsData = responseSetData.Items;

  const responseSetsIds = responseSetsData?.map((responseSet: any) => responseSet.responsesetid);

  const responseQuery = `SELECT * FROM ${RESPONSES_TABLE} WHERE responsesetid IN ('${responseSetsIds?.join("','")}')`;
  const responseCommand = new ExecuteStatementCommand({
    Statement: responseQuery,
  });
  const responseData = await docClient.send(responseCommand);
  return responseData.Items as Response[];
}