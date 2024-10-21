import { createReportConstructs } from './constructs/report-pipeline';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createClientTable } from './constructs/dynamodb';
import { createApiGateway } from './apigateway/apigateway';
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb';


export interface tablesType {
  ClientTable: TableV2,
}

export class OdAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);


    const reportWebsiteConstrcuts = createReportConstructs(this);
    const reportRepo = reportWebsiteConstrcuts.repo;
    const reportBucket = reportWebsiteConstrcuts.websiteBucket;
    const reportDistribution = reportWebsiteConstrcuts.distribution;
    const reportUnauthenticatedRole = reportWebsiteConstrcuts.unauthenticatedRole;
    const reportIdentityPool = reportWebsiteConstrcuts.identityPool;
    const reportPipeline = reportWebsiteConstrcuts.pipeline;

    const reportResources = {
      reportRepo,
      reportBucket,
      reportDistribution,
      reportUnauthenticatedRole,
      reportIdentityPool,
      reportPipeline
    }

    const ClientTable = createClientTable(this);


    const tables = {
      ClientTable,
    };

    createApiGateway(this, tables, reportResources);





    // createSurveyApiGateway(this,tables,surveyResources);

  }
}
