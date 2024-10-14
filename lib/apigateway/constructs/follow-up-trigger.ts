
import * as cdk from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaIntegration, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { Rule, Schedule } from 'aws-cdk-lib/aws-events';
import { LambdaFunction } from 'aws-cdk-lib/aws-events-targets';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';



export const createFollowUpTrigger = (OdAppCdkStack: cdk.Stack, tables: any, reportResources: any, api: LambdaRestApi) => {

    const hourlyLambda = new Function(OdAppCdkStack, 'HourlyLambda', {
        runtime: Runtime.NODEJS_18_X,  // or any other runtime
        code: Code.fromAsset('lambda'),  // Path to the folder containing lambda code
        handler: 'dist/follow-up-trigger.handler',  // The handler function inside your lambda code
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
    const senderEmail = 'youremail@example.com';
    const verifiedEmail = 'youremail@example.com';


    hourlyLambda.addToRolePolicy(new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'], // Replace with your SES identity ARN
    }));
    tables.ClientTable.grantFullAccess(hourlyLambda);
    tables.ResponseTable.grantFullAccess(hourlyLambda);
    tables.ResponseSetTable.grantFullAccess(hourlyLambda);
    tables.SurveyTypeTable.grantFullAccess(hourlyLambda);
    tables.RespondentTable.grantFullAccess(hourlyLambda);
    tables.UserTable.grantFullAccess(hourlyLambda);


    // Create an EventBridge rule to trigger the Lambda every hour
    const rule = new Rule(OdAppCdkStack, 'HourlyRule', {
        schedule: Schedule.rate(cdk.Duration.hours(1)),  // Run hourly
        //every 5minutes
        // schedule: Schedule.rate(cdk.Duration.minutes(1)),  // Run
    });

    // Add the Lambda function as the target for the EventBridge rule
    rule.addTarget(new LambdaFunction(hourlyLambda));

}
