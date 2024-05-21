// In a separate file, e.g., twilioClient.js
import twilio from 'twilio';

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN);

export default twilioClient;
