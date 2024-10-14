import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

interface SignUpEventBody {
  email: string;
  password: string;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const { email, password }: SignUpEventBody = JSON.parse(event.body || '{}');
  
  const cognito = new CognitoIdentityServiceProvider();

  const params = {
    ClientId: process.env.COGNITO_CLIENT_ID || '',  // Ensure this environment variable is set
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
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message, body: event.body, message: "Signup function error" }),
    };
  }
};
