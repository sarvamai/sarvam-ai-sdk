import { lazySchema, zodSchema } from "@ai-sdk/provider-utils";
import { z } from "zod";
import { SarvamLanguageCodeSchema, SarvamScriptCodeSchema } from "../config";

export const sarvamLidResponseSchema = lazySchema(() =>
	zodSchema(
		z.object({
			script_code: SarvamScriptCodeSchema.nullish(),
			language_code: SarvamLanguageCodeSchema.nullish(),
			request_id: z.string().nullish(),
		}),
	),
);
