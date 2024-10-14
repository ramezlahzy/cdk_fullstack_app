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
import { Table } from 'aws-cdk-lib/aws-dynamodb';

export const createSurveyWebsiteConstructs = (scope: Construct) => {
    // CodeCommit Repository
    const repo = new codecommit.Repository(scope, 'SurveyRepo', {
        repositoryName: 'survey-website-repo',
        description: 'Repository for the survey website',
    });

    // // prevent removal of the repository
    repo.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN);
    //     //attach the repo from if already existing codecommit
    // const repo = codecommit.Repository.fromRepositoryName(scope, 'SurveyRepo', 'survey-website-repo');

    // S3 Bucket for website hosting
    const websiteBucket = new s3.Bucket(scope, 'WebsiteBucket', {
        websiteIndexDocument: 'index.html',
        publicReadAccess: true,
        removalPolicy: cdk.RemovalPolicy.DESTROY,
        blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS, // Allow public access but block ACLs
    });
    //websiteBucket is already exist
    // const websiteBucket = s3.Bucket.fromBucketName(scope, 'WebsiteBucket', 'survey-webiste-bucket');
    // CloudFront Distribution
    const distribution = new cloudfront.Distribution(scope, 'WebsiteDistribution', {
        defaultBehavior: {
            origin: new origins.S3Origin(websiteBucket),
            viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
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
    const identityPool = new cognito.CfnIdentityPool(scope, 'SurveyIdentityPool', {
        allowUnauthenticatedIdentities: true,
    });

    // IAM Role for Unauthenticated Access to DynamoDB
    const unauthenticatedRole = new iam.Role(scope, 'SurveyCognitoDefaultUnauthenticatedRole', {
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

    // Reference existing DynamoDB tables
    const clientTable = Table.fromTableName(scope, 'SurveyClientTable', 'ClientTable');
    const responseTable = Table.fromTableName(scope, 'SurveyResponseTable', 'responseTable');

    // Add permissions to the role
    unauthenticatedRole.addToPolicy(new iam.PolicyStatement({
        actions: ['dynamodb:GetItem', 'dynamodb:Query'],
        resources: [clientTable.tableArn],
    }));

    unauthenticatedRole.addToPolicy(new iam.PolicyStatement({
        actions: ['dynamodb:PutItem'],
        resources: [responseTable.tableArn],
    }));

    // Attach the role to the Cognito Identity Pool
    new cognito.CfnIdentityPoolRoleAttachment(scope, 'IdentityPoolRoleAttachment', {
        identityPoolId: identityPool.ref,
        roles: {
            'unauthenticated': unauthenticatedRole.roleArn,
        },
    });

    // CodePipeline
    const pipeline = new codepipeline.Pipeline(scope, 'SurveyWebsitePipeline', {
        pipelineName: 'survey-website-pipeline',
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
    const buildProject = new codebuild.PipelineProject(scope, 'SurveyBuildProject', {
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

    new cdk.CfnOutput(scope, 'SurveyWebsiteURL', {
        value: distribution.distributionDomainName,
        description: 'The URL of the survey website',
    });

    return {
        repo,
        websiteBucket,
        distribution,
        identityPool,
        unauthenticatedRole,
        pipeline,
    };
};
