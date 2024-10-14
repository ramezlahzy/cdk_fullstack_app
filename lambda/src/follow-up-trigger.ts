import { QueryCommand, UpdateCommand, ExecuteStatementCommand } from "@aws-sdk/lib-dynamodb";
import { SES } from 'aws-sdk';
import * as fs from 'fs';
import * as path from 'path';
import { docClient, RESPONDENT_SURVEY_TABLE } from "./helpers";

const ses = new SES({ region: 'ap-southeast-2' });
const leftLogo = fs.readFileSync(path.resolve(__dirname, './assets/leftLogo.png')).toString('base64');



interface ResponseItem {
  followUpEmail: boolean;
  followUpTime: string;
  respondentid: string;
  respondentSurveyId: string;
  surveyid: string;
}

export const handler = async (event: any): Promise<any> => {
  console.log('Processing follow-up emails...');
  console.log(RESPONDENT_SURVEY_TABLE)
  const query1 = "SELECT * FROM respondentSurveyTable";
  const respondentsSurveyQuery = new ExecuteStatementCommand({
    Statement: query1,
  });

  try {
    const responses = await docClient.send(respondentsSurveyQuery);
    for (const response of responses.Items as ResponseItem[]) {
      if (!response.followUpEmail) {
        const currentTime = new Date();
        const followUpTime = new Date(response.followUpTime);
        const respondentid = response.respondentid;

        if (currentTime > followUpTime) {
          await sendFollowUpEmail(respondentid);

          let updateExpression = 'set ';
          const expressionAttributeValues: { [key: string]: any } = {};
          const expressionAttributeNames: { [key: string]: any } = {};
          updateExpression += `#followUpEmail = :followUpEmail,`;
          expressionAttributeValues[':followUpEmail'] = true;
          expressionAttributeNames['#followUpEmail'] = 'followUpEmail';
          updateExpression = updateExpression.slice(0, -1);

          const updateFollowUpEmailParams = {
            TableName: RESPONDENT_SURVEY_TABLE,
            Key: {
              respondentSurveyId: response.respondentSurveyId,
              surveyid: response.surveyid // Sort key
            },
            UpdateExpression: updateExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            ExpressionAttributeNames: expressionAttributeNames,
            ReturnValues: undefined,
          };
          await docClient.send(new UpdateCommand(updateFollowUpEmailParams));
        }
      }
    }
  } catch (error) {
    console.error('Error processing follow-up emails:', error);
    return {
      statusCode: 500,
      body: JSON.stringify('Error processing follow-up emails.'),
    };
  }
};

// Helper function to send follow-up email using SES
const sendFollowUpEmail = async (respondentid: string): Promise<void> => {
  const params = {
    TableName: 'respondentTable',
    KeyConditionExpression: 'respondentid = :respondentid',
    ExpressionAttributeValues: {
      ':respondentid': respondentid,
    },
  };

  const respondents = await docClient.send(new QueryCommand(params));
  const respondent = respondents.Items?.[0];

  if (!respondent) {
    throw new Error('Respondent not found');
  }

  const clientid = respondent.clientid;

  const clientParams = {
    TableName: 'clientTable',
    KeyConditionExpression: 'clientid = :clientid',
    ExpressionAttributeValues: {
      ':clientid': clientid,
    },
  };
  const clients = await docClient.send(new QueryCommand(clientParams));
  const client = clients.Items?.[0];

  if (!client) {
    throw new Error('Client not found');
  }

  const businessname = client.businessname;
  let logoImage = `data:image/png;base64,${leftLogo}`;

  const defaultFollowUpContent = `
    <h1>Hello from ${businessname}!</h1>
    <p>We hope you're having a lovely day.</p>
    <p>A little while ago, we sent you an email requesting your valuable feedback. If you have completed the survey already, thank you.</p>
    <p>If you haven't yet, there is still time to complete the survey and make your voice heard.</p>
    <p>Our short survey takes about: <strong>5 Minutes</strong></p>
    <a href="https://d38i3gp5llp0ul.cloudfront.net/auth/login" style="padding: 10px; background-color: #28a745; color: white; text-decoration: none;">Take the Survey</a>
    <p>Thanks for your help!!</p>
    <p>${businessname}</p>
    <br>
    <img src=\"${logoImage}\" alt="ODAPTIC Logo" style="width: 15px; height: auto;" />
    <br>
    <p>Powered by <strong>ODAPTIC</strong></p>
  `;

  const emailParams: SES.SendEmailRequest = {
    Destination: {
      ToAddresses: ['rameznashaat9999@gmail.com'], // Add the recipient email
    },
    Message: {
      Body: {
        Html: { Data: defaultFollowUpContent },
      },
      Subject: { Data: 'debug Follow-up Survey Email' },
    },
    Source: 'rameznashaat9999@gmail.com', // Ensure this is a verified email in SES
  };

  try {
    await ses.sendEmail(emailParams).promise();
    console.log(`Follow-up email sent to ${emailParams.Destination.ToAddresses}`);
  } catch (error) {
    console.error(`Failed to send email to ${emailParams.Destination.ToAddresses}:`, error);
    throw new Error(`Failed to send email to ${emailParams.Destination.ToAddresses}`);
  }
};

// Helper function to send test email
const sendTestMail = async (): Promise<void> => {
  const email = 'rameznashaat9999@gmail.com';
  let logoImage = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUA
        AAAFCAYAAACNbyblAAAAHElEQVQI12P4
        //8/w38GIAXDIBKE0DHxgljNBAAO
        9TXL0Y4OHwAAAABJRU5ErkJggg==`;

  const defaultFollowUpContent = `
    <h1>Hello from!</h1>
    <p>We hope you're having a lovely day.</p>
    <p>A little while ago, we sent you an email requesting your valuable feedback. If you have completed the survey already, thank you.</p>
    <p>If you haven't yet, there is still time to complete the survey and make your voice heard.</p>
    <p>Our short survey takes about: <strong>5 Minutes</strong></p>
    <a href="https://d3nh4muq1akmia.cloudfront.net/performance" style="padding: 10px; background-color: #28a745; color: white; text-decoration: none;">Take the Survey</a>
    <p>Thanks for your help!!</p>
    <br>
    <img src="${logoImage}" alt="ODAPTIC Logo" style="width: 15px; height: auto;" />
    <br>
    <p>Powered by <strong>ODAPTIC</strong></p>
  `;

  const emailParams: SES.SendEmailRequest = {
    Destination: {
      ToAddresses: [email],
    },
    Message: {
      Body: {
        Html: { Data: defaultFollowUpContent },
      },
      Subject: { Data: 'debug Follow-up Survey Email' },
    },
    Source: 'rameznashaat9999@gmail.com',
  };

  try {
    await ses.sendEmail(emailParams).promise();
    console.log(`Follow-up email sent to ${email}`);
  } catch (error) {
    console.error(`Failed to send email to ${email}:`, error);
    throw new Error(`Failed to send email to ${email}`);
  }
};
