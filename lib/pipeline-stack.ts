import * as cdk from 'aws-cdk-lib';
import * as codecommit from 'aws-cdk-lib/aws-codecommit';
import { Construct } from 'constructs';
import { OdAppPipelineStage } from './pipeline-stage';
import { CodeBuildStep, CodePipeline, CodePipelineSource } from 'aws-cdk-lib/pipelines';

export class OdAppPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
         const stackProps: cdk.StackProps = {
             ...props,
             stackName: 'OdPipelineCdkStack' // Assign your custom stack name here
         };
        super(scope, id, stackProps);
        const repo = new codecommit.Repository(this, 'od-app-cdk', {
            repositoryName: 'od-app-cdk'
        });
   
        // const repo = codecommit.Repository.fromRepositoryName(this, 'od-app-cdk', 'od-app-cdk');
        repo.applyRemovalPolicy(cdk.RemovalPolicy.RETAIN_ON_UPDATE_OR_DELETE);

        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'ODReportsPipeline',
            synth: new CodeBuildStep('SynthStep', {
                input: CodePipelineSource.codeCommit(repo, 'master'),
                installCommands: ['npm install -g aws-cdk'],
                commands: ['npm ci', 'npm run build', 'npx cdk synth']
            }),selfMutation:true
        });
       

        const deploy = new OdAppPipelineStage(this, 'Deploy');
        
        const deployStage = pipeline.addStage(deploy);
    

   
      
    }
}
