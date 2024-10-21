import * as cdk from 'aws-cdk-lib';
import { AppCdkStack } from '../lib/app-cdk-stack';
import { AppPipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

new AppCdkStack(app, 'AppCdkStack', {});

new AppPipelineStack(app, 'AppPipelineStack', {});