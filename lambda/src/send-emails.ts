import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import AWS from 'aws-sdk';
import { marshall } from '@aws-sdk/util-dynamodb';
import { ExecuteStatementCommand } from '@aws-sdk/lib-dynamodb';
import fs from 'fs';
import path from 'path';
import { getCurrentUser, headers } from './helpers';

const ses = new AWS.SES({ region: 'ap-southeast-2' });
const RESPONSES_TABLE = process.env.RESPONSES_TABLE;
const RESPONDENT_SURVEY_TABLE = process.env.RESPONDENT_SURVEY_TABLE;
const USER_TABLE = 'userTable'; // Hardcoded user table

const leftLogo = fs.readFileSync(path.resolve(__dirname, './assets/leftLogo.png')).toString('base64');

const docClient = DynamoDBDocumentClient.from(new DynamoDBClient());

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const currentUser = await getCurrentUser(event);
    const clientId = currentUser?.clientid || '';
    console.log('Processing follow-up emails:', event.body);
    
    const body = JSON.parse(event.body || '{}');
    console.log('Processing follow-up emails:', body);

    const { emails, surveyId } = body;

    for (const email of emails) {
      await sendEmail(email, surveyId, clientId);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'Follow-up emails processed successfully.' }),
      headers,
    };
  } catch (error) {
    console.error('Error processing follow-up emails:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Error processing follow-up emails.'),
    };
  }
};

// Helper function to send follow-up email using SES
const sendEmail = async (email: string, surveyId: string, clientid: string): Promise<void> => {
  try {
    const clientParams = {
      TableName: 'clientTable',
      KeyConditionExpression: 'clientid = :clientid',
      ExpressionAttributeValues: marshall({ ':clientid': clientid }),
    };
    console.log('clientParams:', clientParams);
    
    const clients = await docClient.send(new QueryCommand(clientParams));
    console.log('clients:', clients);
    
    const client = clients.Items?.[0];
    if (!client) throw new Error(`Client with ID ${clientid} not found`);
    
    const businessname = client.businessname;
    console.log('businessname:', businessname);

    const logoImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA
        AAAFCAYAAACNbyblAAAAHElEQVQI12P4
        //8/w38GIAXDIBKE0DHxgljNBAAO
        9TXL0Y4OHwAAAABJRU5ErkJggg==`;

    const defaultFollowUpContent = `
      <h1>Hello from ${businessname}!</h1>
      <p>We hope you're having a lovely day.</p>
      <p>A little while ago, we sent you an email requesting your valuable feedback. If you have completed the survey already, thank you.</p>
      <p>If you haven't yet, there is still time to complete the survey and make your voice heard.</p>
      <p>Our short survey takes about: <strong>5 Minutes</strong></p>
      <a href="https://d3nh4muq1akmia.cloudfront.net/${surveyId}" style="padding: 10px; background-color: #28a745; color: white; text-decoration: none;">Take the Survey</a>
      <p>Thanks for your help!!</p>
      <p>${businessname}</p>
      <br>
      <img src="${logoImage}" alt="Logo" style="width: 15px; height: auto;" />
      <br>
      <p>Powered by <strong>ODAPTIC</strong></p>
    `;

    const emailParams = {
      Destination: {
        ToAddresses: [email], // Recipient email
      },
      Message: {
        Body: {
          Html: { Data: defaultFollowUpContent },
        },
        Subject: { Data: 'Follow-up Survey Email' },
      },
      Source: 'your_verified_email@example.com', // Ensure this is a verified email in SES
    };
    
    console.log('emailParams:', emailParams);
    await ses.sendEmail(emailParams).promise();
    console.log(`Follow-up email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
    throw new Error(`Failed to send email to ${email}`);
  }
};
