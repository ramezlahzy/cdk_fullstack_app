"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const helpers_1 = require("./helpers");
const handler = async (event) => {
    try {
        const token = event.headers.Authorization;
        const email = await (0, helpers_1.getEmailFromToken)(token);
        let currentUser = await (0, helpers_1.getCurrentUserByEmail)(email);
        const currentClient = await (0, helpers_1.getCurrentClient)(event);
        if (currentClient) {
            if (!currentUser)
                await (0, helpers_1.createOwnerUser)(email, currentClient.clientid);
            const { demographic1, demographic2, businessname, billingEmail } = currentClient;
            if (!demographic1?.name || !demographic2?.name || !businessname || !billingEmail || demographic1?.values?.length === 0 || demographic2?.values?.length === 0)
                currentUser = null;
        }
        if (!currentUser && !currentClient)
            return {
                statusCode: 404,
                body: JSON.stringify({ message: 'User not found' }),
                headers: helpers_1.headers
            };
        const response = { currentUser, currentClient };
        return {
            statusCode: 200,
            body: JSON.stringify(response),
            headers: helpers_1.headers
        };
    }
    catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: error.message, body: event.body }),
            headers: helpers_1.headers
        };
    }
};
exports.handler = handler;
