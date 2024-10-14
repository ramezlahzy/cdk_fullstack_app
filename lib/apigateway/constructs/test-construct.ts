
import * as cdk from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaIntegration, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { tablesType } from '../../od-app-cdk-stack';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';


export const createTestDataEndpoint = (OdAppCdkStack: cdk.Stack, tables: tablesType, reportResources: any, api: LambdaRestApi) => {

  const testLambda = new Function(OdAppCdkStack, "TestHandler", {
    runtime: Runtime.NODEJS_18_X,
    code: Code.fromAsset("lambda"), // Assume your Lambda code is in the "lambda" folder
    handler: "tests.handler",
    timeout: cdk.Duration.seconds(90), // Increase the timeout here
    memorySize: 328, // You can also adjust memory size if needed
    environment: {
      CLIENTS_TABLE: tables.ClientTable.tableName,
      RESPONSES_TABLE: tables.ResponseTable.tableName,
      RESPONSE_SETS_TABLE: tables.ResponseSetTable.tableName,
      SURVEY_TYPES_TABLE: tables.SurveyTypeTable.tableName,
      RESPONDENTS_TABLE: tables.RespondentTable.tableName,
      USERS_TABLE: tables.UserTable.tableName,
      RESPONDENT_SURVEY_TABLE: tables.RespondentSurveyTable.tableName,
      // USER_POOL_ID : reportResources?.userPool?.userPoolId      
    },
  });
  testLambda.addToRolePolicy(new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      "cognito-idp:AdminCreateUser", 
      "cognito-idp:AdminUpdateUserAttributes", // Other required actions can be added here
      "cognito-idp:AdminDeleteUser" // Add more actions as needed
    ],
    resources: [ 'arn:aws:cognito-idp:ap-southeast-2:127214171587:userpool/ap-southeast-2_RIbd7Vx4Q'], // Replace with actual User Pool ARN if dynamic
  }));

  // tables.ClientTable.grantReadWriteData(testLambda);
  // tables.ResponseTable.grantReadWriteData(testLambda);
  // tables.ResponseSetTable.grantReadWriteData(testLambda);
  // tables.SurveyTypeTable.grantReadWriteData(testLambda);
  // tables.RespondentTable.grantReadWriteData(testLambda);
  // tables.UserTable.grantReadWriteData(testLambda);
  //grante delete
  tables.ClientTable.grantFullAccess(testLambda);
  tables.ResponseTable.grantFullAccess(testLambda);
  tables.ResponseSetTable.grantFullAccess(testLambda);
  tables.SurveyTypeTable.grantFullAccess(testLambda);
  tables.RespondentTable.grantFullAccess(testLambda);
  tables.UserTable.grantFullAccess(testLambda);
  tables.RespondentSurveyTable.grantFullAccess(testLambda);

  // tables.ResponseTable.grante("dynamodb:DeleteItem", testLambda);
  // tables.ResponseSetTable.grante("dynamodb:DeleteItem", testLambda);
  // tables.SurveyTypeTable.grante("dynamodb:DeleteItem", testLambda);
  // tables.RespondentTable.grante("dynamodb:DeleteItem", testLambda);
  // tables.UserTable.grante("dynamodb:DeleteItem", testLambda);
  // table.grant(fn, 'dynamodb:PutItem');





  api.root.addResource("create-data").addMethod("GET", new LambdaIntegration(testLambda))

  return testLambda

}
