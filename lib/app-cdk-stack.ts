import { createConstructs } from './constructs/pipeline';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createTable } from './constructs/dynamodb';
import { createApiGateway } from './apigateway/apigateway';
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb';


export interface tablesType {
  table: TableV2,
}

export class AppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const websiteConstrcuts = createConstructs(this);
    const repo = websiteConstrcuts.repo;
    const bucket = websiteConstrcuts.websiteBucket;
    const distribution = websiteConstrcuts.distribution;
    const unauthenticatedRole = websiteConstrcuts.unauthenticatedRole;
    const identityPool = websiteConstrcuts.identityPool;
    const pipeline = websiteConstrcuts.pipeline;

    const reportResources = {
      repo,
      bucket,
      distribution,
      unauthenticatedRole,
      identityPool,
      pipeline
    }

    const table = createTable(this);


    const tables = {
      table,
    };

    createApiGateway(this, tables, reportResources);

  }
}
