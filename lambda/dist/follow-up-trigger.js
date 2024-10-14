"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const aws_sdk_1 = require("aws-sdk");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
const helpers_1 = require("./helpers");
const ses = new aws_sdk_1.SES({ region: 'ap-southeast-2' });
const leftLogo = fs.readFileSync(path.resolve(__dirname, './assets/leftLogo.png')).toString('base64');
const handler = async (event) => {
    console.log('Processing follow-up emails...');
    console.log(helpers_1.RESPONDENT_SURVEY_TABLE);
    const query1 = "SELECT * FROM respondentSurveyTable";
    const respondentsSurveyQuery = new lib_dynamodb_1.ExecuteStatementCommand({
        Statement: query1,
    });
    try {
        const responses = await helpers_1.docClient.send(respondentsSurveyQuery);
        for (const response of responses.Items) {
            if (!response.followUpEmail) {
                const currentTime = new Date();
                const followUpTime = new Date(response.followUpTime);
                const respondentid = response.respondentid;
                if (currentTime > followUpTime) {
                    await sendFollowUpEmail(respondentid);
                    let updateExpression = 'set ';
                    const expressionAttributeValues = {};
                    const expressionAttributeNames = {};
                    updateExpression += `#followUpEmail = :followUpEmail,`;
                    expressionAttributeValues[':followUpEmail'] = true;
                    expressionAttributeNames['#followUpEmail'] = 'followUpEmail';
                    updateExpression = updateExpression.slice(0, -1);
                    const updateFollowUpEmailParams = {
                        TableName: helpers_1.RESPONDENT_SURVEY_TABLE,
                        Key: {
                            respondentSurveyId: response.respondentSurveyId,
                            surveyid: response.surveyid
                        },
                        UpdateExpression: updateExpression,
                        ExpressionAttributeValues: expressionAttributeValues,
                        ExpressionAttributeNames: expressionAttributeNames,
                        ReturnValues: undefined,
                    };
                    await helpers_1.docClient.send(new lib_dynamodb_1.UpdateCommand(updateFollowUpEmailParams));
                }
            }
        }
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
const sendFollowUpEmail = async (respondentid) => {
    const params = {
        TableName: 'respondentTable',
        KeyConditionExpression: 'respondentid = :respondentid',
        ExpressionAttributeValues: {
            ':respondentid': respondentid,
        },
    };
    const respondents = await helpers_1.docClient.send(new lib_dynamodb_1.QueryCommand(params));
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
    const clients = await helpers_1.docClient.send(new lib_dynamodb_1.QueryCommand(clientParams));
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
    const emailParams = {
        Destination: {
            ToAddresses: ['rameznashaat9999@gmail.com'],
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
        console.log(`Follow-up email sent to ${emailParams.Destination.ToAddresses}`);
    }
    catch (error) {
        console.error(`Failed to send email to ${emailParams.Destination.ToAddresses}:`, error);
        throw new Error(`Failed to send email to ${emailParams.Destination.ToAddresses}`);
    }
};
const sendTestMail = async () => {
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
    const emailParams = {
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
    }
    catch (error) {
        console.error(`Failed to send email to ${email}:`, error);
        throw new Error(`Failed to send email to ${email}`);
    }
};
