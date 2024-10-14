
import * as cdk from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaIntegration, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';
import { tablesType } from '../../od-app-cdk-stack';
import { Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';


export const createUsersEndpoint = (OdAppCdkStack: cdk.Stack, tables: tablesType, reportResources: any, api: LambdaRestApi) => {


  // Users
  const usersLambda = new Function(OdAppCdkStack, "UsersHandler", {
    runtime: Runtime.NODEJS_18_X,
    code: Code.fromAsset("lambda"), // Assume your Lambda code is in the "lambda" folder
    handler: "dist/users.handler",
    timeout: cdk.Duration.seconds(30),
    environment: {
      USERS_TABLE: tables.UserTable.tableName
    },
  });
  usersLambda.addToRolePolicy(new PolicyStatement({
    effect: Effect.ALLOW,
    actions: [
      "cognito-idp:AdminCreateUser", 
      "cognito-idp:AdminUpdateUserAttributes", // Other required actions can be added here
      "cognito-idp:AdminDeleteUser" // Add more actions as needed
    ],
    resources: [ 'arn:aws:cognito-idp:ap-southeast-2:127214171587:userpool/ap-southeast-2_RIbd7Vx4Q'], // Replace with actual User Pool ARN if dynamic
  }));




  tables.UserTable.grantFullAccess(usersLambda);

  const usersResource = api.root.addResource("users");
  const userByIdResource = usersResource.addResource("{id}");

  usersResource.addMethod("POST", new LambdaIntegration(usersLambda));
  usersResource.addMethod("GET", new LambdaIntegration(usersLambda));
  userByIdResource.addMethod("PATCH", new LambdaIntegration(usersLambda));
  userByIdResource.addMethod("DELETE", new LambdaIntegration(usersLambda));
  userByIdResource.addMethod("GET", new LambdaIntegration(usersLambda));

  return usersLambda;

}
