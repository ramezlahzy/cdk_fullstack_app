#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { OdAppCdkStack } from '../lib/od-app-cdk-stack';
import { OdAppPipelineStack } from '../lib/pipeline-stack';

const app = new cdk.App();

new OdAppCdkStack(app, 'OdAppCdkStack', {});

new OdAppPipelineStack(app, 'OdAppPipelineStack', {});