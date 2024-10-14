"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SURVEY_TYPES_TABLE = exports.RESPONSE_SETS_TABLE = exports.RESPONDENTS_TABLE = exports.RESPONDENT_SURVEY_TABLE = exports.RESPONSES_TABLE = exports.USERS_TABLE = exports.CLIENTS_TABLE = exports.docClient = exports.DynamoDBClient = exports.headers = exports.getEmailFromToken = exports.createOwnerUser = exports.getCurrentClient = exports.getCurrentUserByEmail = exports.getCurrentUser = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
const uuid_1 = require("uuid");
const faker_1 = require("@faker-js/faker");
const config_1 = __importDefault(require("./assets/config"));
const client_dynamodb_1 = require("@aws-sdk/client-dynamodb");
Object.defineProperty(exports, "DynamoDBClient", { enumerable: true, get: function () { return client_dynamodb_1.DynamoDBClient; } });
const client = new client_dynamodb_1.DynamoDBClient({});
const docClient = lib_dynamodb_1.DynamoDBDocumentClient.from(client);
exports.docClient = docClient;
const CLIENTS_TABLE = 'clientTable';
exports.CLIENTS_TABLE = CLIENTS_TABLE;
const USERS_TABLE = 'userTable';
exports.USERS_TABLE = USERS_TABLE;
const RESPONDENTS_TABLE = 'respondentTable';
exports.RESPONDENTS_TABLE = RESPONDENTS_TABLE;
const RESPONSES_TABLE = 'responseTable';
exports.RESPONSES_TABLE = RESPONSES_TABLE;
const RESPONSE_SETS_TABLE = 'responseSetTable';
exports.RESPONSE_SETS_TABLE = RESPONSE_SETS_TABLE;
const SURVEY_TYPES_TABLE = 'surveyTypeTable';
exports.SURVEY_TYPES_TABLE = SURVEY_TYPES_TABLE;
const RESPONDENT_SURVEY_TABLE = 'respondentSurveyTable';
exports.RESPONDENT_SURVEY_TABLE = RESPONDENT_SURVEY_TABLE;
const getEmailFromToken = async (token) => {
    if (!token)
        throw new Error("Access token is required.");
    const clientProvider = new client_cognito_identity_provider_1.CognitoIdentityProviderClient(config_1.default);
    const input = { AccessToken: token };
    const command = new client_cognito_identity_provider_1.GetUserCommand(input);
    const response = await clientProvider.send(command);
    const email = response.UserAttributes?.find(attr => attr.Name === 'email')?.Value;
    if (!email)
        throw new Error("Email not found in token.");
    return email;
};
exports.getEmailFromToken = getEmailFromToken;
const getCurrentUser = async (event) => {
    const token = event.headers.Authorization;
    if (!token)
        throw new Error("Authorization token is missing");
    const email = await getEmailFromToken(token);
    if (!email)
        throw new Error("Email not found in token");
    return getCurrentUserByEmail(email);
};
exports.getCurrentUser = getCurrentUser;
const getCurrentUserByEmail = async (email) => {
    const query = 'SELECT * FROM ' + USERS_TABLE + ' WHERE email = ?';
    const addItemStatementCommand = new lib_dynamodb_1.ExecuteStatementCommand({
        Statement: query,
        Parameters: [email],
    });
    const responseSetData = await docClient.send(addItemStatementCommand);
    if (!responseSetData.Items || responseSetData.Items.length === 0)
        return null;
    const user = responseSetData.Items[0];
    return user;
};
exports.getCurrentUserByEmail = getCurrentUserByEmail;
const createOwnerUser = async (email, clientid) => {
    const userid = (0, uuid_1.v4)();
    const params = {
        TableName: USERS_TABLE,
        Item: {
            accesslevel: "owner",
            email,
            userid,
            clientid,
            firstName: faker_1.faker.person.firstName(),
            lastName: faker_1.faker.person.lastName(),
            status: "Active"
        }
    };
    const command = new lib_dynamodb_1.PutCommand(params);
    await docClient.send(command);
    return;
};
exports.createOwnerUser = createOwnerUser;
const getCurrentClient = async (event) => {
    const token = event.headers.Authorization;
    if (!token)
        throw new Error("Authorization token is missing");
    const clientProvider = new client_cognito_identity_provider_1.CognitoIdentityProviderClient(config_1.default);
    const input = { AccessToken: token };
    const command = new client_cognito_identity_provider_1.GetUserCommand(input);
    const response = await clientProvider.send(command);
    if (!response)
        return null;
    const email = response.UserAttributes?.find(attr => attr.Name === 'email')?.Value;
    if (!email)
        return null;
    const query = `SELECT * FROM ${CLIENTS_TABLE} WHERE email = ?`;
    const params = {
        Statement: query,
        Parameters: [email]
    };
    const addItemStatementCommand = new lib_dynamodb_1.ExecuteStatementCommand(params);
    const responseSetData = await docClient.send(addItemStatementCommand);
    if (!responseSetData.Items || responseSetData.Items.length === 0)
        return null;
    return responseSetData.Items[0];
};
exports.getCurrentClient = getCurrentClient;
const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE",
    "Access-Control-Allow-Headers": "Content-Type"
};
exports.headers = headers;
