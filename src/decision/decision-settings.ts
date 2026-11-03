import { z } from "zod";

/**
 * Specifies the decision model to use.
 *
 * - `sarvam-prism`: Answers choice, score, and yes/no questions about one input with calibrated probabilities.
 */
export type SarvamDecisionModelId = "sarvam-prism" | (string & {});

const probabilitiesSchema = z.record(z.string(), z.number());

export const sarvamDecisionAnswerSchema = z.discriminatedUnion("type", [
	z.object({
		type: z.literal("noul"),
		noul: z.number(),
	}),
	z.object({
		type: z.literal("choice"),
		choice: z.string(),
		confidence: z.number(),
		probabilities: probabilitiesSchema,
	}),
	z.object({
		type: z.literal("score"),
		score: z.number(),
		confidence: z.number(),
		legend: z.record(z.string(), z.string()).nullish(),
		probabilities: probabilitiesSchema,
	}),
]);

export const sarvamDecisionResponseSchema = z.object({
	model: z.string().nullish(),
	answers: z.record(z.string(), sarvamDecisionAnswerSchema),
	usage: z
		.object({
			input_tokens: z.number().nullish(),
			output_tokens: z.number().nullish(),
		})
		.nullish(),
});
