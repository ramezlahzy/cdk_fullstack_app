import * as cdk from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { createClientEndpoint } from '../constructs/client-construct';
import { createSurveyTypeEndpoint } from '../constructs/survey-type-construct';
import { createUsersEndpoint } from '../constructs/users-construct';
import { createResponsesEndpoint } from '../constructs/responses-construct';
import { createRespondentsEndpoint } from '../constructs/respondent-construct';
import { createSignEndpoint } from '../constructs/sign-construct';

export const createSurveyApiGateway = (OdAppCdkStack: cdk.Stack, tables: any, reportResources: any) => {

  const api = new LambdaRestApi(OdAppCdkStack, "SharedApi", {
    proxy: false,
    defaultCorsPreflightOptions: {
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: Cors.ALL_METHODS,
      allowHeaders: ["*"],
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

  createClientEndpoint(OdAppCdkStack, tables, reportResources, api);
  // createSurveyEndpoint(OdAppCdkStack, tables, reportResources, api);
  createSurveyTypeEndpoint(OdAppCdkStack, tables, reportResources, api);
  createUsersEndpoint(OdAppCdkStack, tables, reportResources, api);
  createResponsesEndpoint(OdAppCdkStack, tables, reportResources, api);
  createRespondentsEndpoint(OdAppCdkStack, tables, reportResources, api);
  createSignEndpoint(OdAppCdkStack, tables, reportResources, api);

  new cdk.CfnOutput(OdAppCdkStack, 'ApiUrl', {
    value: api.url ?? 'Something went wrong with the deployment',
  });

}
