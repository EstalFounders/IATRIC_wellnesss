import { CHANNEL_TYPE, WHATSAPP_CONFIRMATION_TEMPLATE, WHATSAPP_TYPE } from "../../utils/constants";

export function createWhatsAppTemplatePayload({
  channelId,
  recipientName,
  recipientPhone,
  templateName,
  bodyValues,
}) {
  return {
    channelId,
    channelType: CHANNEL_TYPE,
    recipient: {
      name: recipientName,
      phone: recipientPhone,
    },
    whatsapp: {
      type: WHATSAPP_TYPE,
      template: {
        templateName: templateName,
        bodyValues,
      },
    },
  };
}

