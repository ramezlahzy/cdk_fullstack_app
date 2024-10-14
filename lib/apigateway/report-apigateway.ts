import * as cdk from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { createSurveyEndpoint } from './constructs/response-sets-construct';
import { createTestDataEndpoint } from './constructs/test-construct';
import { createUsersEndpoint } from './constructs/users-construct';
import { createSurveyTypeEndpoint } from './constructs/survey-type-construct';
import { tablesType } from '../od-app-cdk-stack';
import { createAuthEndpoint } from './constructs/auth-construct';
import { createRespondentsEndpoint } from './constructs/respondent-construct';
import { createClientEndpoint } from './constructs/client-construct';
import { createFollowUpTrigger } from './constructs/follow-up-trigger';
import { createSendEmailsEndPoint } from './constructs/send-emails';
import { createPublicSurveyEndpoint } from './constructs/public-response-sets-construct';
import { createResponsesEndpoint } from './constructs/responses-construct';

export const createReportApiGateway = (OdAppCdkStack: cdk.Stack, tables: tablesType, reportResources: any) => {

  const api = new LambdaRestApi(OdAppCdkStack, "SharedApi", {
    proxy: false,
    defaultCorsPreflightOptions: {
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: Cors.ALL_METHODS,
      // allowHeaders: ["*"],
      statusCode: 200
    },
    policy: new cdk.aws_iam.PolicyDocument({
      statements: [
        new cdk.aws_iam.PolicyStatement({
          effect: cdk.aws_iam.Effect.ALLOW,
          principals: [new cdk.aws_iam.AnyPrincipal()],
          actions: ["execute-api:Invoke"],
          resources: ["arn:aws:execute-api:*:*:*"]
        })
      ]
    }),
    handler: new Function(OdAppCdkStack, "dummy", {
      runtime: Runtime.NODEJS_18_X,
      code: Code.fromAsset("lambda"), // Assume your Lambda code is in the "lambda" folder
      handler: "clients.handler",
      environment: {
        CLIENTS_TABLE: tables.ClientTable.tableName
      },
    })
  });

  createTestDataEndpoint(OdAppCdkStack, tables, reportResources, api);
  createAuthEndpoint(OdAppCdkStack, tables, reportResources, api);
  createSurveyEndpoint(OdAppCdkStack, tables, reportResources, api);
  createSurveyTypeEndpoint(OdAppCdkStack, tables, reportResources, api);
  createUsersEndpoint(OdAppCdkStack, tables, reportResources, api);
  createRespondentsEndpoint(OdAppCdkStack, tables, reportResources, api);
  createClientEndpoint(OdAppCdkStack, tables, reportResources, api);
  createFollowUpTrigger(OdAppCdkStack, tables, reportResources, api);
  createSendEmailsEndPoint(OdAppCdkStack, tables, reportResources, api);
  createPublicSurveyEndpoint(OdAppCdkStack, tables, reportResources, api);
  createResponsesEndpoint(OdAppCdkStack, tables, reportResources, api);


  new cdk.CfnOutput(OdAppCdkStack, 'ApiUrl', {
    value: api.url ?? 'Something went wrong with the deployment',
  });
  new cdk.CfnOutput(OdAppCdkStack, 'tables', {
    value: JSON.stringify({
      ClientTable: tables.ClientTable.tableName,
      RespondentTable: tables.RespondentTable.tableName,
      ResponseSetTable: tables.ResponseSetTable.tableName,
      SurveyTypeTable: tables.SurveyTypeTable.tableName,
      ResponseTable: tables.ResponseTable.tableName,
      UserTable: tables.UserTable.tableName,

    }),
  });
}
