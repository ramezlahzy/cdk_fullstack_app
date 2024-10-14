"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const handler = async (event) => {
    const cognito = new aws_sdk_1.CognitoIdentityServiceProvider();
    try {
        const body = JSON.parse(event.body || '{}');
        const { email, confirmationCode } = body;
        if (!email || !confirmationCode) {
            return {
                statusCode: 400,
                body: JSON.stringify({ message: 'Email and confirmation code are required.' }),
            };
        }
        const params = {
            ClientId: process.env.COGNITO_CLIENT_ID,
            Username: email,
            ConfirmationCode: confirmationCode,
        };
        const result = await cognito.confirmSignUp(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User confirmed', data: result }),
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message,
                message: 'Error in confirmSignUp',
            }),
        };
    }
};
exports.handler = handler;
