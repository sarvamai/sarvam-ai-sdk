import {
	createJsonErrorResponseHandler,
	type InferSchema,
	lazySchema,
	zodSchema,
} from "@ai-sdk/provider-utils";
import { z } from "zod";

// Raw zod object, composed into stream chunk unions (see chat/settings.ts).
export const sarvamErrorDataZodSchema = z.object({
	error: z.object({
		request_id: z.string().nullable().optional(),
		message: z.string(),
		code: z.string(),
	}),
});

export const sarvamErrorDataSchema = lazySchema(() =>
	zodSchema(sarvamErrorDataZodSchema),
);

export type SarvamErrorData = InferSchema<typeof sarvamErrorDataSchema>;

export const sarvamFailedResponseHandler = createJsonErrorResponseHandler({
	errorSchema: sarvamErrorDataSchema,
	errorToMessage: (data) => data.error.message,
});
