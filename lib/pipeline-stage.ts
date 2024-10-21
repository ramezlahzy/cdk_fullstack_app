import { AppCdkStack } from './app-cdk-stack';
import { Stage, StageProps } from 'aws-cdk-lib';
import { Construct } from 'constructs';

export class OdAppPipelineStage extends Stage {
    constructor(scope: Construct, id: string, props?: StageProps) {
        super(scope, id, props);

        // Pass the stackName to OdAppCdkStack
        new AppCdkStack(this, 'OdAppCdkStack', {
            stackName: 'OdAppCdkStack',
            env: props?.env // Ensure to pass the environment properties if needed
        });
    }
}
