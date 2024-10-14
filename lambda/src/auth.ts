import { Get } from '@aws-sdk/client-dynamodb';
import { getCurrentClient, createOwnerUser, getEmailFromToken, headers, getCurrentUserByEmail } from './helpers';
import { GetCurrentUserResponse } from '@/shared-folders/types/user.types';



export const handler = async (event: any): Promise<{
  statusCode: number;
  body: string;
  headers: { [key: string]: string };
}> => {
  try {
    const token = event.headers.Authorization;
    const email = await getEmailFromToken(token);
    let currentUser = await getCurrentUserByEmail(email);
    const currentClient = await getCurrentClient(event);

    if (currentClient) {
      if (!currentUser)
        await createOwnerUser(email, currentClient.clientid);

      const { demographic1, demographic2, businessname, billingEmail } = currentClient;
      if (!demographic1?.name || !demographic2?.name || !businessname || !billingEmail || demographic1?.values?.length === 0 || demographic2?.values?.length === 0)
        currentUser = null;
    }

    if (!currentUser && !currentClient)
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'User not found' }),
        headers
      };

    const response: GetCurrentUserResponse = { currentUser, currentClient };

    return {
      statusCode: 200,
      body: JSON.stringify(response),
      headers
    };

  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message, body: event.body }),
      headers
    };
  }
};
