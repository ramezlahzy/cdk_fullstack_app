import {
    CognitoIdentityProviderClient,
    GetUserCommand,
    GetUserCommandInput
} from "@aws-sdk/client-cognito-identity-provider";
import {
    PutCommand,
    DynamoDBDocumentClient,
    ExecuteStatementCommand,
    ExecuteStatementCommandInput,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';
import { APIGatewayProxyEvent } from "aws-lambda"; // Assuming you're using API Gateway events
import config from './assets/config';
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

import { User } from "@/shared-folders/types/user.types";
import { Client } from "@/shared-folders/types/client.types";

const CLIENTS_TABLE = 'clientTable' //|| process.env.CLIENTS_TABLE!;
const USERS_TABLE = 'userTable' //|| process.env.USER_TABLE!;
const RESPONDENTS_TABLE = 'respondentTable' //|| process.env.RESPONDENTS_TABLE;
const RESPONSES_TABLE = 'respondentSurveyTable'// || process.env.RESPONSES_TABLE;
const RESPONSE_SETS_TABLE = 'responseTable' //|| process.env.RESPONSE_SETS_TABLE;
const SURVEY_TYPES_TABLE = 'surveyTypeTable' //|| process.env.SURVEY_TYPES_TABLE;
const RESPONDENT_SURVEY_TABLE = 'respondentSurveyTable' //|| process.env.RESPONDENT_SURVEY_TABLE;


const getEmailFromToken = async (token: string): Promise<string> => {
    if (!token)
        throw new Error("Access token is required.");

    const clientProvider = new CognitoIdentityProviderClient(config);
    const input: GetUserCommandInput = { AccessToken: token };
    const command = new GetUserCommand(input);
    const response = await clientProvider.send(command);
    const email = response.UserAttributes?.find(attr => attr.Name === 'email')?.Value;

    if (!email)
        throw new Error("Email not found in token.");

    return email;
};

const getCurrentUser = async (event: APIGatewayProxyEvent): Promise<User | null> => {
    const token = event.headers.Authorization;
    if (!token) throw new Error("Authorization token is missing");
    const email = await getEmailFromToken(token);
    if (!email) throw new Error("Email not found in token");
    return getCurrentUserByEmail(email);
};

const getCurrentUserByEmail = async (email: string): Promise<User | null> => {
    const query = 'SELECT * FROM ' + USERS_TABLE + ' WHERE email = ?';
    const addItemStatementCommand = new ExecuteStatementCommand({
        Statement: query,
        Parameters: [email],
    });
    const responseSetData = await docClient.send(addItemStatementCommand);
    if (!responseSetData.Items || responseSetData.Items.length === 0)
        return null;

    const user = responseSetData.Items[0];
    return user as User;
};

const createOwnerUser = async (email: string, clientid: string): Promise<void> => {
    const userid = uuidv4();
    const params = {
        TableName: USERS_TABLE,
        Item: {
            accesslevel: "owner",
            email,
            userid,
            clientid,
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            status: "Active"
        }
    };

    const command = new PutCommand(params);
    await docClient.send(command);
    return;
};

const getCurrentClient = async (event: APIGatewayProxyEvent): Promise<
    Client | null
> => {
    const token = event.headers.Authorization;
    if (!token) throw new Error("Authorization token is missing");

    const clientProvider = new CognitoIdentityProviderClient(config);
    const input: GetUserCommandInput = { AccessToken: token };
    const command = new GetUserCommand(input);
    const response = await clientProvider.send(command);

    if (!response)
        return null;

    const email = response.UserAttributes?.find(attr => attr.Name === 'email')?.Value;

    if (!email)
        return null;

    const query = `SELECT * FROM ${CLIENTS_TABLE} WHERE email = ?`;
    const params: ExecuteStatementCommandInput = {
        Statement: query,
        Parameters: [email]
    };

    const addItemStatementCommand = new ExecuteStatementCommand(params);
    const responseSetData = await docClient.send(addItemStatementCommand);

    if (!responseSetData.Items || responseSetData.Items.length === 0)
        return null;

    return responseSetData.Items[0] as Client;
};

const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE",
    "Access-Control-Allow-Headers": "Content-Type"
};

export {
    getCurrentUser,
    getCurrentUserByEmail,
    getCurrentClient,
    createOwnerUser,
    getEmailFromToken,
    headers,
    DynamoDBClient,
    docClient,
    CLIENTS_TABLE,
    USERS_TABLE,
    RESPONSES_TABLE,
    RESPONDENT_SURVEY_TABLE,
    RESPONDENTS_TABLE,
    RESPONSE_SETS_TABLE,
    SURVEY_TYPES_TABLE

};
