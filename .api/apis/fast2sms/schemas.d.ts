declare const SendWhatsappMessage: {
    readonly metadata: {
        readonly allOf: readonly [{
            readonly type: "object";
            readonly properties: {
                readonly authorization: {
                    readonly type: "string";
                    readonly default: "YOUR_API_KEY";
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Your API Key.";
                };
                readonly message_id: {
                    readonly type: "integer";
                    readonly examples: readonly [9];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The unique ID of the template you want to send.";
                };
                readonly phone_number_id: {
                    readonly type: "string";
                    readonly examples: readonly ["579519398574288"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "The WABA Phone Number ID.";
                };
                readonly numbers: {
                    readonly type: "string";
                    readonly examples: readonly ["9999999999"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Destination mobile number.";
                };
                readonly variables_values: {
                    readonly type: "string";
                    readonly examples: readonly ["Var1|Var2|Var3"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Required if the template has variables ({{1}}, {{2}}). Join multiple values with a pipe `|`.";
                };
                readonly media_url: {
                    readonly type: "string";
                    readonly format: "uri";
                    readonly examples: readonly ["https://example.com/image.png"];
                    readonly $schema: "http://json-schema.org/draft-04/schema#";
                    readonly description: "Required if the template has a Header Media (Image/Video/PDF).";
                };
            };
            readonly required: readonly ["authorization", "message_id", "phone_number_id", "numbers"];
        }];
    };
    readonly response: {
        readonly "200": {
            readonly type: "object";
            readonly properties: {
                readonly status: {
                    readonly type: "boolean";
                    readonly examples: readonly [true];
                };
                readonly message: {
                    readonly type: "string";
                    readonly examples: readonly ["Message sent successfully"];
                };
                readonly request_id: {
                    readonly type: "string";
                    readonly examples: readonly ["6a3b2c1d"];
                };
            };
            readonly $schema: "http://json-schema.org/draft-04/schema#";
        };
    };
};
export { SendWhatsappMessage };
