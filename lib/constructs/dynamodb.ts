import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { TableV2, AttributeType, Billing } from 'aws-cdk-lib/aws-dynamodb';

export const createClientTable = (scope: Construct) => new TableV2(scope, 'clientTable', {
  partitionKey: { name: 'clientid', type: AttributeType.STRING },
  removalPolicy: cdk.RemovalPolicy.RETAIN, // Prevents table from being deleted
  tableName: 'clientTable',
  billing: Billing.onDemand(),
  globalSecondaryIndexes: [
    {
      indexName: 'nameIndex',
      partitionKey: { name: 'name', type: AttributeType.STRING }
    }
  ]
});