
import * as cdk from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaIntegration, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';



export const createSendEmailsEndPoint = (OdAppCdkStack: cdk.Stack, tables: any, reportResources: any, api: LambdaRestApi) => {

    const emailLambda = new Function(OdAppCdkStack, 'SendEmailLambda', {
        runtime: Runtime.NODEJS_18_X,  // or any other runtime
        code: Code.fromAsset('lambda'),  // Path to the folder containing lambda code
        handler: 'dist/send-emails.handler',  // The handler function inside your lambda code
        memorySize: 128,
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
    emailLambda.addToRolePolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'], // Replace with your SES identity ARN
    }));
    tables.ClientTable.grantFullAccess(emailLambda);
    tables.ResponseTable.grantFullAccess(emailLambda);
    tables.ResponseSetTable.grantFullAccess(emailLambda);
    tables.SurveyTypeTable.grantFullAccess(emailLambda);
    tables.RespondentTable.grantFullAccess(emailLambda);
    tables.UserTable.grantFullAccess(emailLambda);
    tables.RespondentSurveyTable.grantFullAccess(emailLambda);
    const sendGetway = api.root.addResource("send-emails");

    sendGetway.addMethod("POST", new LambdaIntegration(emailLambda));

}
