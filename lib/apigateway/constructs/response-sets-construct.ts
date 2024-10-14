
import * as cdk from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaIntegration, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { tablesType } from '../../od-app-cdk-stack';


export const createSurveyEndpoint = (OdAppCdkStack: cdk.Stack, tables: tablesType, reportResources: any, api: LambdaRestApi) => {
    // Surveys
    const sureysLambda = new Function(OdAppCdkStack, "ResponseSetsHandler", {
        runtime: Runtime.NODEJS_18_X,
        code: Code.fromAsset("lambda"), // Assume your Lambda code is in the "lambda" folder
        handler: "dist/response-sets.handler",
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
    tables.ClientTable.grantFullAccess(sureysLambda);
    tables.ResponseTable.grantFullAccess(sureysLambda);
    tables.ResponseSetTable.grantFullAccess(sureysLambda);
    tables.SurveyTypeTable.grantFullAccess(sureysLambda);
    tables.RespondentTable.grantFullAccess(sureysLambda);
    tables.UserTable.grantFullAccess(sureysLambda);
    tables.ResponseSetTable.grant(sureysLambda,'dynamodb:PartiQLSelect');
    const surveys = api.root.addResource("surveys");
    const surveysById = surveys.addResource("{id}");

    surveys.addMethod("POST", new LambdaIntegration(sureysLambda));
    surveys.addMethod("GET", new LambdaIntegration(sureysLambda));
    surveysById.addMethod("PATCH", new LambdaIntegration(sureysLambda));
    surveysById.addMethod("GET", new LambdaIntegration(sureysLambda));
    return sureysLambda
}
