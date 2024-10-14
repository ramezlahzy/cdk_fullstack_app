"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const lib_dynamodb_2 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
const helpers_1 = require("./helpers");
const handler = async (event) => {
    const method = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    try {
        const currentUser = await (0, helpers_1.getCurrentUser)(event);
        const clientId = currentUser?.clientid;
        const surveyid = pathParameters.id;
        if (method === 'GET') {
            if (!clientId)
                return {
                    statusCode: 404, headers: helpers_1.headers, body: JSON.stringify({ message: `Client not found with id= ${clientId}` })
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
                        statusCode: 404, headers: helpers_1.headers, body: JSON.stringify({ message: `Survey not found with id= ${surveyid}` })
                    };
                }
                const responses = responseData?.filter((response) => response.responsesetid === surveyid);
                const surveyDemographics = { demographic1: {}, demographic2: {} };
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
                    headers: helpers_1.headers
                };
            }
            return {
                statusCode: 200,
                body: JSON.stringify(responseSets),
                headers: helpers_1.headers,
            };
        }
        if (method === 'POST') {
            const survey = JSON.parse(event.body || '{}');
            const responsesetid = (0, uuid_1.v4)();
            survey.responsesetid = responsesetid;
            survey.clientid = clientId;
            const statusOptions = ['Open', 'Closed Auto', 'Closed Manual'];
            console.log('survey', survey);
            const params = {
                TableName: helpers_1.RESPONSE_SETS_TABLE,
                Item: survey
            };
            const command = new lib_dynamodb_1.PutCommand(params);
            await helpers_1.docClient.send(command);
            survey.responsesetid = responsesetid;
            return {
                statusCode: 200,
                body: JSON.stringify(survey),
                headers: helpers_1.headers,
            };
        }
        if (method === 'PATCH') {
            const survey = JSON.parse(event.body || '{}');
            const surveyid = pathParameters.id;
            const surveyTypeQuery = `SELECT * FROM ${helpers_1.SURVEY_TYPES_TABLE} WHERE surveytypeid = ?`;
            const surveyTypeCommand = new lib_dynamodb_2.ExecuteStatementCommand({
                Statement: surveyTypeQuery,
                Parameters: [survey.surveytypeid],
            });
            const surveyTypeData = await helpers_1.docClient.send(surveyTypeCommand);
            if (!surveyTypeData.Items?.length) {
                return {
                    statusCode: 404, headers: helpers_1.headers, body: JSON.stringify({ message: `Survey Type not found with id= ${survey.surveytypeid}` })
                };
            }
            let updateExpression = 'set ';
            const expressionAttributeValues = {};
            const expressionAttributeNames = {};
            for (const key in survey) {
                if (key === 'responsesetid'
                    || key === 'clientid')
                    continue;
                updateExpression += `#${key} = :${key},`;
                expressionAttributeValues[`:${key}`] = survey[key];
                expressionAttributeNames[`#${key}`] = key;
            }
            updateExpression = updateExpression.slice(0, -1);
            const command = new lib_dynamodb_1.UpdateCommand({
                TableName: helpers_1.RESPONSE_SETS_TABLE,
                Key: { responsesetid: surveyid },
                UpdateExpression: updateExpression,
                ExpressionAttributeValues: expressionAttributeValues,
                ExpressionAttributeNames: expressionAttributeNames,
                ReturnValues: 'ALL_NEW',
            });
            await helpers_1.docClient.send(command);
            const updatedSurvey = { responsesetid: surveyid, ...survey };
            return {
                statusCode: 200,
                body: JSON.stringify(updatedSurvey),
                headers: helpers_1.headers,
            };
        }
        return {
            statusCode: 400,
            body: JSON.stringify({ message: `Invalid Request method=${method}` }),
            headers: helpers_1.headers,
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message, body: event.body, method }),
        };
    }
};
exports.handler = handler;
const getResponseSets = async (clientid, surveyTypes, responses) => {
    const query = `SELECT * FROM ${helpers_1.RESPONSE_SETS_TABLE} WHERE clientid = ?`;
    console.log("client id", clientid);
    console.log("query", query);
    const addItemStatementCommand = new lib_dynamodb_2.ExecuteStatementCommand({
        Statement: query,
        Parameters: [clientid],
    });
    const responseSetData = await helpers_1.docClient.send(addItemStatementCommand);
    console.log('responseSetData', responseSetData);
    const responseSets = [];
    const responseSetsData = responseSetData.Items;
    for (const responseSet of responseSetsData || []) {
        const { surveytypeid, responsesetid } = responseSet;
        const surveyType = surveyTypes?.find((surveyType) => surveyType.surveytypeid === surveytypeid);
        responseSet.surveyType = surveyType;
        const responsesForSurvey = responses.filter((response) => response.responsesetid === responsesetid);
        responseSet.responsesCount = responsesForSurvey?.length;
        responseSets.push(responseSet);
    }
    return responseSets;
};
const getSurveyTypes = async () => {
    const query = `SELECT * FROM ${helpers_1.SURVEY_TYPES_TABLE}`;
    const addItemStatementCommand = new lib_dynamodb_2.ExecuteStatementCommand({
        Statement: query,
    });
    const surveyTypeData = await helpers_1.docClient.send(addItemStatementCommand);
    return surveyTypeData.Items;
};
const getReponses = async (clientId) => {
    const query = `SELECT * FROM ${helpers_1.RESPONSE_SETS_TABLE} WHERE clientid = ?`;
    const addItemStatementCommand = new lib_dynamodb_2.ExecuteStatementCommand({
        Statement: query,
        Parameters: [clientId],
    });
    const responseSetData = await helpers_1.docClient.send(addItemStatementCommand);
    const responseSetsData = responseSetData.Items;
    const responseSetsIds = responseSetsData?.map((responseSet) => responseSet.responsesetid);
    const responseQuery = `SELECT * FROM ${helpers_1.RESPONSES_TABLE} WHERE responsesetid IN ('${responseSetsIds?.join("','")}')`;
    const responseCommand = new lib_dynamodb_2.ExecuteStatementCommand({
        Statement: responseQuery,
    });
    const responseData = await helpers_1.docClient.send(responseCommand);
    return responseData.Items;
};
