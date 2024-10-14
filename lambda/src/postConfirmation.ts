import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

interface ConfirmSignUpRequestBody {
  email: string;
  confirmationCode: string;
}

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const cognito = new CognitoIdentityServiceProvider();

  try {
    const body: ConfirmSignUpRequestBody = JSON.parse(event.body || '{}');
    const { email, confirmationCode } = body;

    if (!email || !confirmationCode) {
      return {
        statusCode: 400,
        body: JSON.stringify({ message: 'Email and confirmation code are required.' }),
      };
    }

    const params: CognitoIdentityServiceProvider.ConfirmSignUpRequest = {
      ClientId: process.env.COGNITO_CLIENT_ID!,
      Username: email,
      ConfirmationCode: confirmationCode,
    };

    const result = await cognito.confirmSignUp(params).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ message: 'User confirmed', data: result }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: (error as Error).message,
        message: 'Error in confirmSignUp',
      }),
    };
  }
};
