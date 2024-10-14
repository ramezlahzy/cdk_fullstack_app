
import * as cdk from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaIntegration, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { tablesType } from '../../od-app-cdk-stack';


export const createSurveyTypeEndpoint = (OdAppCdkStack: cdk.Stack, tables: tablesType, reportResources: any, api: LambdaRestApi) => {

  const sureyTypesLambda = new Function(OdAppCdkStack, "SurveyTypesHandler", {
    runtime: Runtime.NODEJS_18_X,
    code: Code.fromAsset("lambda"), // Assume your Lambda code is in the "lambda" folder
    handler: "dist/survey-types.handler",
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

  tables.SurveyTypeTable.grantReadWriteData(sureyTypesLambda);
  const surveyTypes = api.root.addResource("survey-types");
  const surveyTypesById = surveyTypes.addResource("{id}");


  surveyTypes.addMethod("POST", new LambdaIntegration(sureyTypesLambda));
  surveyTypes.addMethod("GET", new LambdaIntegration(sureyTypesLambda));
  surveyTypesById.addMethod("PATCH", new LambdaIntegration(sureyTypesLambda));
  surveyTypesById.addMethod("GET", new LambdaIntegration(sureyTypesLambda));



  return sureyTypesLambda;

}
