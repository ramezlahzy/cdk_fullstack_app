
import * as cdk from 'aws-cdk-lib';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";
import { Cors, LambdaIntegration, LambdaRestApi } from "aws-cdk-lib/aws-apigateway";
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';


export const createSignEndpoint = (OdAppCdkStack: cdk.Stack, tables: any, reportResources: any, api: LambdaRestApi) => {

  // Create the User Pool
  // const userPool = new UserPool(OdAppCdkStack, 'MyUserPool', {
  //   selfSignUpEnabled: true,  // Disable self-sign-up
  //   signInAliases: {
  //     email: true,  // Sign in with email
  //   },
  //   autoVerify: {
  //     email: true,  // Email verification
  //   },
  //   standardAttributes: {
  //     email: {
  //       required: true,  // Email is required and will serve as the user ID
  //       mutable: false,
  //     }
  //   },
  //   passwordPolicy: {
  //     minLength: 8,  // Set minimum password length if needed
  //     requireUppercase: false,
  //     requireLowercase: false,
  //     requireDigits: false,
  //     requireSymbols: false,
  //   }
  //   // ,
  //   // lambdaTriggers: {
  //   //   postConfirmation: postConfirmationLambda,  // Trigger Lambda on post-confirmation
  //   // }
  // });

  // // Add a User Pool Client with only username/password authentication
  // const userPoolClient = new UserPoolClient(OdAppCdkStack, 'MyUserPoolClient', {
  //   userPool,
  //   authFlows: {
  //     userPassword: true,  // Use only username and password
  //   },
  // });



  // const signLambda = new Function(OdAppCdkStack, "SignHandler", {
  //   runtime: Runtime.NODEJS_18_X,
  //   code: Code.fromAsset("lambda"), // Assume your Lambda code is in the "lambda" folder
  //   handler: "sign.handler",
  //   environment: {
  //     USER_POOL_ID: userPool.userPoolId,
  //     USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
  //     COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,  // Pass Cognito Client ID to Lambda
  //   },
  // });
  // const sign = api.root.addResource("sign");
  // sign.addMethod("POST", new LambdaIntegration(signLambda));


  // const postConfirmationLambda = new Function(OdAppCdkStack, 'PostConfirmationFunction', {
  //   runtime: Runtime.NODEJS_18_X,
  //   code: Code.fromAsset('lambda'),  // Assuming you have a directory called 'lambda'
  //   handler: 'postConfirmation.handler',  // Your Lambda handler file and function
  //   environment: {
  //     USER_POOL_ID: userPool.userPoolId,
  //     USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
  //     COGNITO_CLIENT_ID: userPoolClient.userPoolClientId,  // Pass Cognito Client ID to Lambda
  //   },
  // });

  // const confirmation = api.root.addResource("confirmation");
  // confirmation.addMethod("POST", new LambdaIntegration(postConfirmationLambda));


  // return signLambda

}
