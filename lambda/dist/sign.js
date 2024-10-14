"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const aws_sdk_1 = require("aws-sdk");
const handler = async (event) => {
    const { email, password } = JSON.parse(event.body || '{}');
    const cognito = new aws_sdk_1.CognitoIdentityServiceProvider();
    const params = {
        ClientId: process.env.COGNITO_CLIENT_ID || '',
        Username: email,
        Password: password,
        UserAttributes: [
            {
                Name: 'email',
                Value: email,
            },
        ],
    };
    try {
        const result = await cognito.signUp(params).promise();
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'User signed up', data: result }),
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ error: error.message, body: event.body, message: "Signup function error" }),
        };
    }
};
exports.handler = handler;
