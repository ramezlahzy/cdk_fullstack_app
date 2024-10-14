
import * as cdk from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaIntegration, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';


export const createResponsesEndpoint = (OdAppCdkStack: cdk.Stack, tables: any, reportResources: any, api: LambdaRestApi) => {

  const responsesLambda = new Function(OdAppCdkStack, "ResponsesHandler", {
    runtime: Runtime.NODEJS_18_X,
    code: Code.fromAsset("lambda"), // Assume your Lambda code is in the "lambda" folder
    handler: "dist/responses.handler",
    timeout: cdk.Duration.seconds(30),
    environment: {
      CLIENTS_TABLE: tables.ClientTable.tableName,
      RESPONSES_TABLE: tables.ResponseTable.tableName,
      RESPONSE_SETS_TABLE: tables.ResponseSetTable.tableName,
      SURVEY_TYPES_TABLE: tables.SurveyTypeTable.tableName,
      RESPONDENTS_TABLE: tables.RespondentTable.tableName,
      USERS_TABLE: tables.UserTable.tableName,
      RESPONDENT_SURVEY_TABLE: tables.RespondentSurveyTable.tableName,
    },
  });
  tables.ResponseTable.grantReadWriteData(responsesLambda);
  const response = api.root.addResource("survey-responses");

  response.addMethod("POST", new LambdaIntegration(responsesLambda));

  return responsesLambda;

}
