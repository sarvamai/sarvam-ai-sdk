import type {
	LanguageModelV4,
	LanguageModelV4CallOptions,
	LanguageModelV4Content,
} from "@ai-sdk/provider";
import {
	combineHeaders,
	createJsonResponseHandler,
	postJsonToApi,
} from "@ai-sdk/provider-utils";
import type { SarvamConfig } from "../config";
import { sarvamFailedResponseHandler } from "../error";
import { sarvamLidResponseSchema } from "./lid-settings";
import { convertPromptToInput } from "./utils";

export class SarvamLidModel implements LanguageModelV4 {
	readonly specificationVersion = "v4";

	readonly modelId: "unknown";

	private readonly config: SarvamConfig;

	constructor(config: SarvamConfig) {
		this.modelId = "unknown";
		this.config = config;
	}

	get provider(): string {
		return this.config.provider;
	}

	get supportedUrls(): Record<string, RegExp[]> {
		// Sarvam models don't have native URL support for content
		return {};
	}

	private getArgs(
		options: LanguageModelV4CallOptions & {
			stream: boolean;
		},
	) {
		const { prompt } = options;

		return {
			args: {
				input: convertPromptToInput(prompt),
			},
			warnings: [],
		};
	}

	async doGenerate(
		options: LanguageModelV4CallOptions,
	): Promise<Awaited<ReturnType<LanguageModelV4["doGenerate"]>>> {
		const { args } = this.getArgs({
			...options,
			stream: false,
		});

		const {
			responseHeaders,
			value: response,
			rawValue: rawResponse,
		} = await postJsonToApi({
			url: this.config.url({
				path: "/text-lid",
				modelId: this.modelId,
			}),
			headers: combineHeaders(this.config.headers?.(), options.headers),
			body: args,
			failedResponseHandler: sarvamFailedResponseHandler,
			successfulResponseHandler: createJsonResponseHandler(
				sarvamLidResponseSchema,
			),
			abortSignal: options.abortSignal,
			fetch: this.config.fetch,
		});

		const languageCode = response.language_code ?? undefined;

		const content: LanguageModelV4Content[] = [
			{ type: "text", text: languageCode ?? "unknown" },
		];

		return {
			content,
			finishReason: {
				unified: "stop" as const,
				raw: undefined,
			},
			usage: {
				inputTokens: {
					total: undefined,
					noCache: undefined,
					cacheRead: undefined,
					cacheWrite: undefined,
				},
				outputTokens: {
					total: undefined,
					text: undefined,
					reasoning: undefined,
				},
			},
			request: {
				body: args,
			},
			response: {
				id: response.request_id ?? undefined,
				headers: responseHeaders,
				body: rawResponse,
			},
			providerMetadata: {
				sarvam: {
					request_id: response.request_id,
					script_code: response.script_code,
					language_code: response.language_code,
				},
			},
			warnings: [],
		};
	}

	async doStream(
		_options: LanguageModelV4CallOptions,
	): Promise<Awaited<ReturnType<LanguageModelV4["doStream"]>>> {
		throw new Error(
			"Language Identification feature doesn't support streaming yet",
		);
	}
}
