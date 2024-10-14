"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const util_dynamodb_1 = require("@aws-sdk/util-dynamodb");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const helpers_1 = require("./helpers");
const ses = new aws_sdk_1.default.SES({ region: 'ap-southeast-2' });
const RESPONSES_TABLE = process.env.RESPONSES_TABLE;
const RESPONDENT_SURVEY_TABLE = process.env.RESPONDENT_SURVEY_TABLE;
const USER_TABLE = 'userTable';
const leftLogo = fs_1.default.readFileSync(path_1.default.resolve(__dirname, './assets/leftLogo.png')).toString('base64');
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(new client_dynamodb_1.DynamoDBClient());
const handler = async (event) => {
    try {
        const currentUser = await (0, helpers_1.getCurrentUser)(event);
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
            headers: helpers_1.headers,
        };
    }
    catch (error) {
        console.error('Error processing follow-up emails:', error);
        return {
            statusCode: 500,
            body: JSON.stringify('Error processing follow-up emails.'),
        };
    }
};
exports.handler = handler;
const sendEmail = async (email, surveyId, clientid) => {
    try {
        const clientParams = {
            TableName: 'clientTable',
            KeyConditionExpression: 'clientid = :clientid',
            ExpressionAttributeValues: (0, util_dynamodb_1.marshall)({ ':clientid': clientid }),
        };
        console.log('clientParams:', clientParams);
        const clients = await docClient.send(new lib_dynamodb_1.QueryCommand(clientParams));
        console.log('clients:', clients);
        const client = clients.Items?.[0];
        if (!client)
            throw new Error(`Client with ID ${clientid} not found`);
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
                ToAddresses: [email],
            },
            Message: {
                Body: {
                    Html: { Data: defaultFollowUpContent },
                },
                Subject: { Data: 'Follow-up Survey Email' },
            },
            Source: 'your_verified_email@example.com',
        };
        console.log('emailParams:', emailParams);
        await ses.sendEmail(emailParams).promise();
        console.log(`Follow-up email sent to ${email}`);
    }
    catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        throw new Error(`Failed to send email to ${email}`);
    }
};
