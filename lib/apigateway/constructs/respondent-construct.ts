
import * as cdk from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaIntegration, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';


export const createRespondentsEndpoint = (OdAppCdkStack: cdk.Stack, tables: any, reportResources: any, api: LambdaRestApi) => {

  const respondentsLambda = new Function(OdAppCdkStack, "RespondentsHandler", {
    runtime: Runtime.NODEJS_18_X,
    code: Code.fromAsset("lambda"), // Assume your Lambda code is in the "lambda" folder
    handler: "dist/respondents.handler",
    timeout: cdk.Duration.seconds(30), // Increase the timeout here
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
  

  tables.ClientTable.grantFullAccess(respondentsLambda);
  tables.ResponseTable.grantFullAccess(respondentsLambda);
  tables.ResponseSetTable.grantFullAccess(respondentsLambda);
  tables.SurveyTypeTable.grantFullAccess(respondentsLambda);
  tables.RespondentTable.grantFullAccess(respondentsLambda);
  tables.UserTable.grantFullAccess(respondentsLambda);
  const respondent = api.root.addResource("respondents");

  respondent.addMethod("POST", new LambdaIntegration(respondentsLambda));
  respondent.addMethod("GET", new LambdaIntegration(respondentsLambda));
  respondent.addMethod("PATCH", new LambdaIntegration(respondentsLambda));
  const respondentId = respondent.addResource("{id}");
  respondentId.addMethod("DELETE", new LambdaIntegration(respondentsLambda));
  respondentId.addMethod("GET", new LambdaIntegration(respondentsLambda));
  respondentId.addMethod("PATCH", new LambdaIntegration(respondentsLambda));

  return respondentsLambda;

}
