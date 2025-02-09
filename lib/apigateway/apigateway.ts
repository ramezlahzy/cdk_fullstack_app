import * as cdk from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { tablesType } from '../app-cdk-stack';

export const createApiGateway = (OdAppCdkStack: cdk.Stack, tables: tablesType, reportResources: any) => {

  const api = new LambdaRestApi(OdAppCdkStack, "SharedApi", {
    proxy: false,
    defaultCorsPreflightOptions: {
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: Cors.ALL_METHODS,
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
        CLIENTS_TABLE: tables.table.tableName
      },
    })
  });

  // createAuthEndpoint(OdAppCdkStack, tables, reportResources, api);

  new cdk.CfnOutput(OdAppCdkStack, 'ApiUrl', {
    value: api.url ?? 'Something went wrong with the deployment',
  });
  new cdk.CfnOutput(OdAppCdkStack, 'tables', {
    value: JSON.stringify({
      table: tables.table.tableName,
    }),
  });
}
