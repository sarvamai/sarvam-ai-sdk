import z from "zod";
import { sarvamErrorDataSchema } from "../error";

/**
 * @description Production models
 *
 * - `sarvam-105b`: Flagship chat model. Successor to the deprecated `sarvam-30b` and `sarvam-m`.
 *
 * @see https://docs.sarvam.ai/api/getting-started/models
 */
export type ChatModelId = "sarvam-105b" | (string & {});

export type ChatSettings = {
	/**
	 * The effort to use for reasoning
	 */
	reasoning_effort?: "low" | "medium" | "high";

	/**
	 * If set to true, the model response will be wiki grounded.
	 */
	wiki_grounding?: boolean;

	/**
	 * Number of chat completion choices to generate.
	 *
	 * @deprecated Sarvam returns exactly one completion per request. Since 2026-11-07
	 * the API rejects `n` greater than `1` with `400 invalid_request_error` on both
	 * `/v1` and `/v2`. Leave this unset or set it to `1`; send separate requests to get
	 * several completions.
	 */
	n?: number;
};

export const chatSettingsSchema = z.object({
	reasoning_effort: z.enum(["low", "medium", "high"]).nullish(),
	wiki_grounding: z.boolean().nullish(),
	n: z.number().min(1).max(1).nullish(),
});

export const chatResponseSchema = z.object({
	id: z.string().nullish(),
	created: z.number().nullish(),
	model: z.string().nullish(),
	object: z.string().nullish(),
	service_tier: z.string().nullish(),
	system_fingerprint: z.string().nullish(),
	choices: z.array(
		z.object({
			index: z.number(),
			finish_reason: z.string().nullish(),
			logprobs: z.object({}).nullish(),
			message: z.object({
				content: z.string().nullish(),
				reasoning_content: z.string().nullish(),
				refusal: z.string().nullish(),
				tool_calls: z
					.array(
						z.object({
							id: z.string().nullish(),
							type: z.literal("function"),
							function: z.object({
								name: z.string(),
								arguments: z.string(),
							}),
						}),
					)
					.nullish(),
			}),
		}),
	),
	usage: z
		.object({
			completion_tokens: z.number().nullish(),
			prompt_tokens: z.number().nullish(),
			total_tokens: z.number().nullish(),
		})
		.nullish(),
});

export const chatChunkSchema = z.union([
	z.object({
		id: z.string().nullish(),
		created: z.number().nullish(),
		model: z.string().nullish(),
		choices: z.array(
			z.object({
				delta: z
					.object({
						content: z.string().nullish(),
						reasoning: z.string().nullish(),
						tool_calls: z
							.array(
								z.object({
									index: z.number(),
									id: z.string().nullish(),
									type: z.literal("function").optional(),
									function: z.object({
										name: z.string().nullish(),
										arguments: z.string().nullish(),
									}),
								}),
							)
							.nullish(),
					})
					.nullish(),
				finish_reason: z.string().nullable().optional(),
				index: z.number(),
			}),
		),
		x_sarvam: z
			.object({
				usage: z
					.object({
						prompt_tokens: z.number().nullish(),
						completion_tokens: z.number().nullish(),
					})
					.nullish(),
			})
			.nullish(),
	}),
	sarvamErrorDataSchema,
]);
