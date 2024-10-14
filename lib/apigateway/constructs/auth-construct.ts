
import * as cdk from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaIntegration, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { tablesType } from '../../od-app-cdk-stack';

export const createAuthEndpoint = (OdAppCdkStack: cdk.Stack, tables: tablesType, reportResources: any, api: LambdaRestApi) => {

  const currentUserLambda = new Function(OdAppCdkStack, "AuthHandler", {
    runtime: Runtime.NODEJS_18_X,
    code: Code.fromAsset("lambda"),
    handler: "dist/auth.handler",
    timeout: cdk.Duration.seconds(30),
    memorySize: 328, // You can also adjust memory size if needed
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

  tables.ClientTable.grantFullAccess(currentUserLambda);
  tables.ResponseTable.grantFullAccess(currentUserLambda);
  tables.ResponseSetTable.grantFullAccess(currentUserLambda);
  tables.SurveyTypeTable.grantFullAccess(currentUserLambda);
  tables.RespondentTable.grantFullAccess(currentUserLambda);
  tables.UserTable.grantFullAccess(currentUserLambda);

  const auth = api.root.addResource("auth");
  auth.addResource("me").addMethod("GET", new LambdaIntegration(currentUserLambda));


}

