import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Code, Function, Runtime } from "aws-cdk-lib/aws-lambda";

export const createRDS = (OdAppCdkStack: cdk.Stack) => {


    // const vpc = new ec2.Vpc(OdAppCdkStack, 'VPC', {
    //     maxAzs: 2,
    // });

    // const dbCredentialsSecret = new secretsmanager.Secret(OdAppCdkStack, 'DBCredentialsSecret', {
    //     secretName: 'rds-db-credentials',
    //     generateSecretString: {
    //         secretStringTemplate: JSON.stringify({
    //             username: 'postgres_admin', // Choose a different username (e.g., 'postgres_admin')
    //         }),
    //         generateStringKey: 'password',
    //         excludeCharacters: '"@/\\', // You can customize this as needed
    //     },
    // });
    // const rdsInstance = new rds.DatabaseInstance(OdAppCdkStack, 'MyRdsInstance', {
    //     engine: rds.DatabaseInstanceEngine.postgres({ version: rds.PostgresEngineVersion.VER_13 }),
    //     instanceType: ec2.InstanceType.of(ec2.InstanceClass.BURSTABLE3, ec2.InstanceSize.MICRO), // Choose your instance type
    //     vpc,
    //     credentials: rds.Credentials.fromSecret(dbCredentialsSecret),
    //     multiAz: false, // Enable Multi-AZ if needed
    //     allocatedStorage: 20, // Storage in GB
    //     maxAllocatedStorage: 100, // Allow RDS to scale storage up to this value
    //     vpcSubnets: {
    //         subnetType: ec2.SubnetType.PUBLIC, // Use public or private subnets
    //     },
    //     publiclyAccessible: true, // Set to false if you don't want public access
    //     databaseName: 'surveys_database',
    //     backupRetention: cdk.Duration.days(7), // Number of days to retain backups
    //     deletionProtection: false, // Enable this in production
    // });
    // new cdk.CfnOutput(OdAppCdkStack, 'RDSInstanceEndpoint', {
    //     value: rdsInstance.dbInstanceEndpointAddress,
    // });
    // //print the endpoint address of the RDS instance
    // // print username and databse name and password
    // new cdk.CfnOutput(OdAppCdkStack, 'RDSInstance'
    //     , {
    //         value: rdsInstance.instanceIdentifier
    //     });
    // new cdk.CfnOutput(OdAppCdkStack, 'RDSInstanceUsername', {
    //     value: 'postgres_admin', // Output the new username
    // });

    // new cdk.CfnOutput(OdAppCdkStack
    //     , 'RDSInstanceDatabaseName'
    //     , {
    //         value: 'surveys_database'
    //     });
    // new cdk.CfnOutput(OdAppCdkStack, 'RDSInstancePassword', {
    //     value: dbCredentialsSecret.secretValueFromJson('password').unsafeUnwrap(),
    // });

    // const lambdaSG = new ec2.SecurityGroup(OdAppCdkStack, 'LambdaSecurityGroup', {
    //     vpc,
    //     allowAllOutbound: true,
    // });


    // const rdsSG = rdsInstance.connections.securityGroups[0];
    // rdsSG.addIngressRule(lambdaSG, ec2.Port.tcp(5432), 'Allow Lambda to access RDS');




    const lambdaFunction = new Function(OdAppCdkStack, 'RDSLambdaHandler', {
        runtime: Runtime.PYTHON_3_12,  // or any other runtime
        code: Code.fromAsset('lambda'),  // Path to the folder containing lambda code
        handler: 'rds.handler',  // The handler function inside your lambda code
        memorySize: 128,
        timeout: cdk.Duration.seconds(30),
    });

    return lambdaFunction;




}