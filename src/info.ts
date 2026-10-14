import type { ChatModelId, OpenWeightModelId } from "./chat/settings";
import type { TranscriptionModelId } from "./stt/transcription-settings";
import type { SpeechModelId } from "./tts/speech-settings";
import type { TranslationModelId } from "./ttt/translation-settings";

/**
 * Limits of Sarvam chat models.
 *
 * - context_window: maximum number of tokens the model can handle read
 * - max_completions: maximum number of completions (n) per request
 * - max_tokens: maximum number of tokens, by plan
 */
export const SarvamChatModelInfo = {
	"sarvam-105b": {
		context_window: 128_000,
		max_completions: 128,
		max_tokens: {
			starter: 4096,
			pro: 16384,
			business: 128000,
		},
	},
	"sarvam-105b-conversations": {
		context_window: 32_000,
		max_completions: 128,
		max_tokens: {
			starter: 4096,
			pro: 16384,
			business: 128000,
		},
	},
} as const satisfies Record<
	ChatModelId,
	{
		context_window: number;
		max_completions: number;
		max_tokens: {
			starter: number;
			pro: number;
			business: number;
		};
	}
>;

/**
 * Limits of Open Weight models served by Sarvam on /v2
 *
 * - context_window: maximum number of tokens the model can handle read
 * - max_tokens: maximum number of tokens
 */
const OpenWeightModelInfo = {
	gemma4: {
		context_window: 131_072,
	},
	"glm5.3": {
		context_window: 1_048_576,
		max_tokens: 2048,
	},
	"deepseekv4-flash": {
		context_window: 1_048_576,
		max_tokens: 2048,
	},
} as const satisfies Record<
	OpenWeightModelId,
	{
		context_window: number;
		max_tokens?: number;
	}
>;

/**
 * Limits of Sarvam transcription models (speech-to-text).
 *
 * - max_audio_duration: maximum audio length per real-time request (seconds)
 * - max_file_duration: maximum audio length per file in batch jobs (hours)
 * - max_files_per_job: maximum number of files in one batch job
 * - max_speakers: maximum number of speakers for diarization in a batch job
 */
export const SarvamTranscriptionModelInfo = {
	"saaras:v3": {
		max_audio_duration: 30,
		max_file_duration: 2,
		max_files_per_job: 20,
		max_speakers: 20,
	},
	"saaras:v4": {
		max_audio_duration: 30,
		max_file_duration: 2,
		max_files_per_job: 20,
		max_speakers: 20,
	},
} as const satisfies Record<
	TranscriptionModelId,
	{
		max_audio_duration: number;
		max_file_duration: number;
		max_files_per_job: number;
		max_speakers: number;
	}
>;

/**
 * Limits of Sarvam speech synthesis (text-to-speech).
 *
 * - max_characters: maximum number of input characters for REST API request
 * - max_characters_streaming: maximum number of input characters for HTTP streaming request
 * - max_characters_websocket: maximum number of input characters for WebSocket request
 */
export const SarvamSpeechModelInfo = {
	"bulbul:v3": {
		max_characters: 2500,
		max_characters_streaming: 3500,
		max_characters_websocket: 2500,
	},
	"bulbul:v4-flash": {
		max_characters: 2500,
		max_characters_streaming: 3500,
		max_characters_websocket: 2500,
	},
} as const satisfies Record<
	SpeechModelId,
	{
		max_characters: number;
		max_characters_streaming: number;
		max_characters_websocket: number;
	}
>;

/**
 * Limits of Sarvam translation.
 *
 * - max_input_length: maximum number of characters allowed in a request
 */
export const SarvamTranslationModelInfo = {
	"mayura:v1": {
		max_input_length: 1000,
	},
	"sarvam-translate:v1": {
		max_input_length: 2000,
	},
} as const satisfies Record<
	TranslationModelId,
	{
		max_input_length: number;
	}
>;

/**
 * Limits of Sarvam transliteration.
 *
 * - max_input_length: max characters allowed in a single request
 */
export const SarvamTransliterateInfo = {
	default: {
		max_input_length: 1000,
	},
} as const satisfies Record<
	"default",
	{
		max_input_length: number;
	}
>;
