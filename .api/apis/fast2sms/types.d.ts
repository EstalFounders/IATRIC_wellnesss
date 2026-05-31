import type { FromSchema } from 'json-schema-to-ts';
import * as schemas from './schemas';
export type SendWhatsappMessageMetadataParam = FromSchema<typeof schemas.SendWhatsappMessage.metadata>;
export type SendWhatsappMessageResponse200 = FromSchema<typeof schemas.SendWhatsappMessage.response['200']>;
