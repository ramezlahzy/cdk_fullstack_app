import { createReportConstructs } from './constructs/report-pipeline';
import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { createSurveyWebsiteConstructs } from './constructs/survey-pipeline'; // Ensure this path is correct
import { createClientTable, createRespondentTable, createResponseSetTable, createSurveyTypeTable, createResponseTable, createUserTable, createRespondentSurveyTable } from './constructs/dynamodb';
import { createReportApiGateway } from './apigateway/report-apigateway';
import { createSurveyApiGateway } from './apigateway/survey-apigateway/survey-apigateway';
import { TableV2 } from 'aws-cdk-lib/aws-dynamodb';
import { createRDS } from './apigateway/constructs/rds-construct';


export interface tablesType {
  ClientTable: TableV2,
  RespondentTable: TableV2,
  ResponseSetTable: TableV2,
  SurveyTypeTable: TableV2,
  ResponseTable: TableV2,
  UserTable: TableV2,
  RespondentSurveyTable: TableV2
}

export class OdAppCdkStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const surveyWebsiteConstructs = createSurveyWebsiteConstructs(this);
    const surveyRepo = surveyWebsiteConstructs.repo;
    const surveyBucket = surveyWebsiteConstructs.websiteBucket;
    const surveyDistribution = surveyWebsiteConstructs.distribution;
    const surveyUnauthenticatedRole = surveyWebsiteConstructs.unauthenticatedRole;
    const surveyIdentityPool = surveyWebsiteConstructs.identityPool;
    const surveyIpipeline = surveyWebsiteConstructs.pipeline;

    const surveyResources = {
      surveyRepo,
      surveyBucket,
      surveyDistribution,
      surveyUnauthenticatedRole,
      surveyIdentityPool,
      surveyIpipeline
    };

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
    const RespondentTable = createRespondentTable(this);
    const ResponseSetTable = createResponseSetTable(this);
    const SurveyTypeTable = createSurveyTypeTable(this);
    const ResponseTable = createResponseTable(this);
    const UserTable = createUserTable(this);
    const RespondentSurveyTable = createRespondentSurveyTable(this);
    const RDSResponse= createRDS(this)


    const tables = {
      ClientTable,
      RespondentTable,
      ResponseSetTable,
      SurveyTypeTable,
      ResponseTable,
      UserTable,
      RespondentSurveyTable
    };

    createReportApiGateway(this, tables, reportResources);





    // createSurveyApiGateway(this,tables,surveyResources);

  }
}
