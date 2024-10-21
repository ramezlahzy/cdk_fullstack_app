# CDK Full Stack Project (Backend and Frontend)

This project contains both backend and frontend infrastructure defined using AWS CDK. It automates the deployment of your backend resources and frontend code using AWS CodePipeline, AWS CodeCommit, and AWS CodeBuild.

## Project Structure

The project consists of two main CDK stacks:
- **AppCdkStack**: This stack defines the backend infrastructure, including your Lambda functions, DynamoDB tables, API Gateway, etc.
- **AppPipelineStack**: This stack sets up the CI/CD pipeline for your project using AWS CodePipeline, CodeCommit, and CodeBuild. It automates the deployment process by managing source control and the backend infrastructure.

## Prerequisites

- AWS CDK installed globally ('npm install -g aws-cdk')
- AWS credentials configured on your machine
- Node.js installed ('npm ci' will run during the build process)
- Git set up for interacting with AWS CodeCommit

## Deployment Process

### Step 1: Deploy the Pipeline Stack

First, deploy the **AppPipelineStack**. This will create an AWS CodeCommit repository where you can push your backend and frontend code, and a CodePipeline that will manage your deployment.

```bash
cdk deploy AppPipelineStack
```

This creates a CodeCommit repository called 'cdkPipelineRepo'. The pipeline will also be set up, but you need to push your code to this repository before the pipeline can run.

### Step 2: Push Backend Code to the Repository

After the pipeline has been created, clone the newly created CodeCommit repository and push your backend CDK code.

1. Clone the CodeCommit repo:

```bash
git clone https://git-codecommit.<region>.amazonaws.com/v1/repos/cdkPipelineRepo
```

2. Push your existing **AppCdkStack** CDK code to the repo:

```bash
git add .
git commit -m 'Add AppCdkStack'
git push origin main
```

The pipeline will automatically pick up the changes and start deploying the **AppCdkStack**. You can monitor the deployment stages in the AWS CodePipeline console.

### Step 3: Deploy the Frontend Code

Once the backend has been deployed, a second repository for the frontend will appear in CodeCommit. Repeat the process to push your frontend code to the new repository.

1. Clone the frontend repo:

```bash
git clone https://git-codecommit.<region>.amazonaws.com/v1/repos/frontendRepo
```

2. Add and push your frontend code:

```bash
git add .
git commit -m 'Add frontend code'
git push origin main
```

The frontend pipeline will automatically deploy your frontend to the specified infrastructure.

## Pipeline Structure

The pipeline is defined as follows:

```typescript
const pipeline = new CodePipeline(this, 'Pipeline', {
    pipelineName: 'cdkPipeline',
    synth: new CodeBuildStep('SynthStep', {
        input: CodePipelineSource.codeCommit(repo, 'main'),
        installCommands: ['npm install -g aws-cdk'],
        commands: ['npm ci', 'npm run build', 'npx cdk synth']
    }),
    selfMutation: true
});
```

This ensures that your CDK code is automatically synthesized and deployed whenever new changes are pushed to the CodeCommit repository.

## Monitoring

You can monitor the pipeline's progress in the AWS Console under **CodePipeline > Pipelines > cdkPipeline**. Each stage, from source retrieval to build and deployment, is tracked.
