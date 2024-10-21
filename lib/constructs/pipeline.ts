import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as codepipeline from 'aws-cdk-lib/aws-codepipeline';
import * as codepipeline_actions from 'aws-cdk-lib/aws-codepipeline-actions';
import * as codebuild from 'aws-cdk-lib/aws-codebuild';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import { UserPool, UserPoolClient } from 'aws-cdk-lib/aws-cognito';

export const createConstructs = (scope: Construct) => {

    const repo = new codecommit.Repository(scope, 'FrontEndRepo', {
        repositoryName: 'frontend-repo',
        description: 'Repository for the frontend application',
    });

    // // prevent removal of the repository
    repo.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);


    // const repo = codecommit.Repository.fromRepositoryName(scope, 'ReportRepo', 'report-website-repo');

    // const uniqueBucketName = `report-website-bucket`;

    const websiteBucket = new s3.Bucket(scope, 'Bucket', {
        websiteIndexDocument: 'index.html',
        publicReadAccess: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS, // Allow public access but block ACLs
    });

    //websiteBucket is already exist
    // const websiteBucket = s3.Bucket.fromBucketName(scope, 'ReportBucket', 'report-website-bucket');

    const noCachePolicy = new cloudfront.CachePolicy(scope, 'NoCachePolicy', {
        cachePolicyName: 'NoCachePolicy',
        defaultTtl: cdk.Duration.seconds(0),   // Default TTL = 0 (no cache)
        maxTtl: cdk.Duration.seconds(0),       // Max TTL = 0 (no cache)
        minTtl: cdk.Duration.seconds(0),       // Min TTL = 0 (no cache)
        headerBehavior: cloudfront.CacheHeaderBehavior.none(),
        queryStringBehavior: cloudfront.CacheQueryStringBehavior.none(),
        cookieBehavior: cloudfront.CacheCookieBehavior.none(),
      });
      
    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(scope, 'Distribution', {
        defaultBehavior: {
            origin: new origins.S3Origin(websiteBucket),
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
            cachePolicy: noCachePolicy,
        },
        errorResponses: [
            {
                httpStatus: 404,
                responseHttpStatus: 200,
                responsePagePath: '/index.html',
                ttl: cdk.Duration.seconds(0),
            },
        ],
    });


    // Cognito Identity Pool for Unauthenticated Access
    const identityPool = new cognito.CfnIdentityPool(scope, 'IdentityPool', {
        allowUnauthenticatedIdentities: true,
    });

    // IAM Role for Unauthenticated Access to DynamoDB
    const unauthenticatedRole = new iam.Role(scope, 'CognitoDefaultUnauthenticatedRole', {
        assumedBy: new iam.FederatedPrincipal(
            'cognito-identity.amazonaws.com',
            {
                'StringEquals': {
                    'cognito-identity.amazonaws.com:aud': identityPool.ref,
                },
                'ForAnyValue:StringLike': {
                    'cognito-identity.amazonaws.com:amr': 'unauthenticated',
                },
            },
            'sts:AssumeRoleWithWebIdentity'
        ),
    });

    // Attach the role to the Cognito Identity Pool
    new cognito.CfnIdentityPoolRoleAttachment(scope, 'ReportIdentityPoolRoleAttachment', {
        identityPoolId: identityPool.ref,
        roles: {
            'unauthenticated': unauthenticatedRole.roleArn,
        },
    });

    // CodePipeline
    const pipeline = new codepipeline.Pipeline(scope, 'FrontEndWebsitePipeline', {
        pipelineName: 'website-pipeline',
    });

    // Source Stage
    const sourceOutput = new codepipeline.Artifact();
    const sourceAction = new codepipeline_actions.CodeCommitSourceAction({
        actionName: 'CodeCommit',
        repository: repo,
        output: sourceOutput,
    });
    pipeline.addStage({
        stageName: 'Source',
        actions: [sourceAction],
    });

    // Build Stage
    const buildProject = new codebuild.PipelineProject(scope, 'FrontEndBuildProject', {
        environment: {
            buildImage: codebuild.LinuxBuildImage.STANDARD_5_0, // Specify the build image here
        },
    });


    const buildOutput = new codepipeline.Artifact();
    const buildAction = new codepipeline_actions.CodeBuildAction({
        actionName: 'CodeBuild',
        project: buildProject,
        input: sourceOutput,
        outputs: [buildOutput],
    });
    pipeline.addStage({
        stageName: 'Build',
        actions: [buildAction],
    });

    // Deploy Stage
    const deployAction = new codepipeline_actions.S3DeployAction({
        actionName: 'S3Deploy',
        bucket: websiteBucket,
        input: buildOutput,
    });
    pipeline.addStage({
        stageName: 'Deploy',
        actions: [deployAction],
    });




    // Output the resources url website

    new cdk.CfnOutput(scope, 'WebsiteURL', {
        value: distribution.distributionDomainName,
        description: 'The URL of the report website',
    });

    const userPool = new UserPool(scope, 'UserPool', {
        selfSignUpEnabled: true,  // Disable self-sign-up
        signInAliases: {
            email: true,  // Sign in with email
        },
        autoVerify: {
            email: true,  // Email verification
        },
        standardAttributes: {
            email: {
                required: true,  // Email is required and will serve as the user ID
                mutable: false,
            }
        },
        passwordPolicy: {
            minLength: 8,  // Set minimum password length if needed
            requireUppercase: false,
            requireLowercase: false,
            requireDigits: false,
            requireSymbols: false,
        }
        // ,
        // lambdaTriggers: {
        //   postConfirmation: postConfirmationLambda,  // Trigger Lambda on post-confirmation
        // }
    });

    // Add a User Pool Client with only username/password authentication
    const userPoolClient = new UserPoolClient(scope, 'UserPoolClient', {
        userPool,
        authFlows: {
            userPassword: true,  // Use only username and password
        },
    });


    new cdk.CfnOutput(scope, 'UserPoolId', {
        value: userPool.userPoolId,
    });

    new cdk.CfnOutput(scope, 'UserPoolClientId', {
        value: userPoolClient.userPoolClientId,
    });
    new cdk.CfnOutput(scope, 'reportWebsiteURL', {
        value: distribution.distributionDomainName,
    });
    new cdk.CfnOutput(scope, 'reportWebsiteBucket', {
        value: websiteBucket.bucketName,
    });

    return {
        repo,
        websiteBucket,
        distribution,
        identityPool,
        unauthenticatedRole,
        pipeline,
        userPool,
        userPoolClient
    };
};
