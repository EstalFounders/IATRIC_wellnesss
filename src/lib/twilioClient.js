// In a separate file, e.g., twilioClient.js
import twilio from 'twilio';

const accountSid = 'AC3dc691ebd1b6511f20a1d53a55c7fb51';
const authToken = 'bb954620491f0f6acbdecd420de20f4e';
const client = twilio(accountSid, authToken);

export default client;
