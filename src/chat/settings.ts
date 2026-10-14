import { z } from "zod";
import { sarvamErrorDataSchema } from "../error";

/**
 * @description Production models
 * @see https://docs.sarvam.ai/api-reference-docs/chat/chat-completions
 */
export type ChatModelId =
	| "sarvam-105b"
	| "sarvam-105b-conversations"
	| (string & {});

/**
 * @description Open weight models
 * @see https://docs.sarvam.ai/api/getting-started/models/openweight
 */
export type OpenWeightModelId = "glm5.3" | "gemma4" | "deepseekv4-flash";

export type EveryChatModelId = ChatModelId; // | OpenWeightModelId

export type ChatSettings<T extends EveryChatModelId = EveryChatModelId> = {
	/**
	 * Alongside its own models, Sarvam serves a small set of open-weight models.
	 *
	 * Open-weight models are served on v2.
	 *
	 * Sarvam chat models are on v1.
	 *
	 * @see https://docs.sarvam.ai/api/getting-started/models/openweight
	 *
	 * @default "v1"
	 */
	version?: T extends "sarvam-105b-conversations"
		? "v1"
		: T extends OpenWeightModelId
			? "v2"
			: "v1" | "v2";
	/**
	 * The effort to use for reasoning.
	 *
	 * Can be disabled by explicitly setting to "none".
	 *
	 * @default "medium"
	 */
	reasoning_effort?: "none" | "low" | "medium" | "high";

	/**
	 * If set to true, the model response will be wiki grounded.
	 */
	wiki_grounding?: boolean;

	/**
	 * How many chat completion choices to generate for each input message.
	 *
	 * Note that you will be charged based on the number of generated tokens across all of the choices.
	 * Keep `n` as `1` to minimize costs.
	 */
	n?: number;

	/**
	 * Extra body to be sent to the model.
	 *
	 * Only available on v2.
	 *
	 * @default {}
	 */
	extra_body?: Record<string, any>;

	/**
	 * Enables structured outputs, with or without a specified JSON schema.
	 *
	 * Early & Experimental, Sarvam model might not perform well.
	 *
	 * @example
	 * true: JSON is generated with response_format
	 * false: JSON is generated through tool calling argument
	 *
	 * @default false
	 */
	experimental_json_mode?: boolean;
};

export const chatSettingsSchema = z.object({
	reasoning_effort: z
		.enum(["none", "low", "medium", "high"])
		.transform((re) => (re === "none" ? null : re))
		.nullish(),
	wiki_grounding: z.boolean().nullish(),
	n: z.number().min(1).max(128).nullish(),
	extra_body: z.record(z.string(), z.any()).nullish(),
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
