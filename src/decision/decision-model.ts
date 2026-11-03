import type {
	Experimental_DecisionModelV4 as DecisionModelV4,
	Experimental_DecisionModelV4Answer as DecisionModelV4Answer,
	Experimental_DecisionModelV4CallOptions as DecisionModelV4CallOptions,
	Experimental_DecisionModelV4Result as DecisionModelV4Result,
} from "@ai-sdk/provider";
import {
	combineHeaders,
	createJsonResponseHandler,
	postJsonToApi,
} from "@ai-sdk/provider-utils";
import type { SarvamConfig } from "../config";
import { sarvamFailedResponseHandler } from "../error";
import {
	type SarvamDecisionModelId,
	sarvamDecisionResponseSchema,
} from "./decision-settings";
import { convertQuestions, convertState } from "./utils";

export class SarvamDecisionModel implements DecisionModelV4 {
	readonly specificationVersion = "v4";

	readonly modelId: SarvamDecisionModelId;

	readonly supportedQuestionTypes = ["choice", "score", "boolean"] as const;

	private readonly config: SarvamConfig;

	constructor(modelId: SarvamDecisionModelId, config: SarvamConfig) {
		this.modelId = modelId;
		this.config = config;
	}

	get provider(): string {
		return this.config.provider;
	}

	async doDecide(
		options: DecisionModelV4CallOptions,
	): Promise<DecisionModelV4Result> {
		const body = {
			model: this.modelId,
			state: convertState(options.state),
			questions: convertQuestions(options.questions),
		};

		const {
			responseHeaders,
			value: response,
			rawValue: rawResponse,
		} = await postJsonToApi({
			url: this.config.url({
				path: "/v2/systemone",
				modelId: this.modelId,
			}),
			headers: combineHeaders(this.config.headers?.(), options.headers),
			body,
			failedResponseHandler: sarvamFailedResponseHandler,
			successfulResponseHandler: createJsonResponseHandler(
				sarvamDecisionResponseSchema,
			),
			abortSignal: options.abortSignal,
			fetch: this.config.fetch,
		});

		const answers: Record<string, DecisionModelV4Answer> = {};
		const confidence: Record<string, number> = {};

		for (const [questionId, answer] of Object.entries(response.answers)) {
			switch (answer.type) {
				case "noul":
					answers[questionId] = {
						type: "boolean",
						probability: answer.noul,
					};
					break;
				case "choice":
					answers[questionId] = {
						type: "choice",
						choice: answer.choice,
						probabilities: answer.probabilities,
					};
					confidence[questionId] = answer.confidence;
					break;
				case "score":
					answers[questionId] = {
						type: "score",
						score: answer.score,
						probabilities: answer.probabilities,
					};
					confidence[questionId] = answer.confidence;
					break;
			}
		}

		return {
			answers,
			usage: {
				inputTokens: response.usage?.input_tokens ?? undefined,
				outputTokens: response.usage?.output_tokens ?? undefined,
			},
			warnings: [],
			providerMetadata: {
				sarvam: {
					confidence,
				},
			},
			response: {
				modelId: response.model ?? this.modelId,
				headers: responseHeaders,
				body: rawResponse,
			},
		};
	}
}
