
import * as cdk from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaIntegration, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';


export const createClientEndpoint = (OdAppCdkStack: cdk.Stack, tables: any, reportResources: any, api: LambdaRestApi) => {

  const clientsLambda = new Function(OdAppCdkStack, "ClientsHandler", {
    runtime: Runtime.NODEJS_18_X,
    code: Code.fromAsset("lambda"), // Assume your Lambda code is in the "lambda" folder
    timeout: cdk.Duration.seconds(30),
    handler: "dist/clients.handler",
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
  tables.ClientTable.grantFullAccess(clientsLambda);
  tables.ResponseTable.grantFullAccess(clientsLambda);
  tables.ResponseSetTable.grantFullAccess(clientsLambda);
  tables.SurveyTypeTable.grantFullAccess(clientsLambda);
  tables.RespondentTable.grantFullAccess(clientsLambda);
  tables.UserTable.grantFullAccess(clientsLambda);

  const clients = api.root.addResource("clients");
  const clientById = clients.addResource("{id}");

  clients.addMethod("POST", new LambdaIntegration(clientsLambda));
  clients.addMethod("GET", new LambdaIntegration(clientsLambda));
  clients.addMethod("PATCH", new LambdaIntegration(clientsLambda));

  clientById.addMethod("GET", new LambdaIntegration(clientsLambda));
  clientById.addMethod("PATCH", new LambdaIntegration(clientsLambda));

  return clientsLambda

}
