import type {
	LanguageModelV4,
	SpeechModelV4,
	TranscriptionModelV4,
} from "@ai-sdk/provider";

import type { ChatSettings, EveryChatModelId } from "./chat/settings";
import type { MoreSarvamLanguageCode, SarvamLanguageCode } from "./config";
import type {
	TranscriptionModelId,
	TranscriptionSettings,
} from "./stt/transcription-settings";
import type { SpeechModelId, SpeechSettings } from "./tts/speech-settings";
import type {
	TranslationModelId,
	TranslationSettings,
} from "./ttt/translation-settings";
import type { TransliterateSettings } from "./ttt/transliterate-settings";

export type SarvamProvider = {
	/**
	 * Creates a model for text generation.
	 *
	 * @example
	 * 	const { text } = await generateText({
	 * 		model: sarvam("sarvam-105b"),
	 * 		prompt: "Translate this to malayalam: 'Keep cooking, guys'",
	 * 	});
	 */
	<T extends EveryChatModelId>(
		modelId: T,
		settings?: ChatSettings<T>,
	): LanguageModelV4;

	/**
	 * Creates an Sarvam chat model for text generation.
	 *
	 * @example
	 * 	const { text } = await generateText({
	 * 		model: sarvam.languageModel("sarvam-105b"),
	 * 		prompt: "Translate this to malayalam: 'Keep cooking, guys'",
	 * 	});
	 */
	languageModel<T extends EveryChatModelId>(
		modelId: T,
		settings?: ChatSettings<T>,
	): LanguageModelV4;

	/**
	 * Creates a Sarvam model for chat.
	 *
	 * @example
	 * 	const { text } = await generateText({
	 * 		model: sarvam.chat("sarvam-105b"),
	 * 		prompt: "Translate this to malayalam: 'Keep cooking, guys'",
	 * 	});
	 */
	chat<T extends EveryChatModelId>(
		modelId: T,
		settings?: ChatSettings<T>,
	): LanguageModelV4;

	/**
	 * Creates a Sarvam model for transcription.
	 *
	 * @example
	 * 	const { text } = await transcribe({
	 *		model: sarvam.transcription("saaras:v4"),
	 *		audio: await readFile("./audio.wav"),
	 * 	});
	 */
	transcription<T extends TranscriptionModelId>(
		modelId: T,
		/**
		 * Audio source language code.
		 * Use "unknown" for automatic language detection.
		 *
		 * @default "unknown"
		 */
		languageCode?: SarvamLanguageCode | MoreSarvamLanguageCode | "unknown",
		settings?: TranscriptionSettings<T>,
	): TranscriptionModelV4;

	/**
	 * Creates a Sarvam model for speech.
	 * @example
	 *	const { audio } = await generateSpeech({
	 *		model: sarvam.speech("bulbul:v4-flash", "ml-IN"),
	 *		text: "പാചകം തുടരൂ, സുഹൃത്തുക്കളേ",
	 * 	});
	 *
	 * 	await writeFile("./audio.wav", Buffer.from(audio.base64, "base64"));
	 */
	speech<T extends SpeechModelId, L extends SarvamLanguageCode>(
		modelId: T,
		languageCode: L,
		settings?: SpeechSettings<T, L>,
	): SpeechModelV4;

	/**
	 * Creates an Sarvam model for transliterate.
	 *
	 * @example
	 * 	const { text } = await generateText({
	 *		model: sarvam.transliterate({
	 *			to: "ml-IN",
	 *			from: "en-IN", // Optional
	 *		}),
	 *		prompt: "eda mone, happy alle?",
	 *	});
	 */
	transliterate<T extends SarvamLanguageCode>(
		settings: TransliterateSettings<false, T>,
	): LanguageModelV4;

	/**
	 * Creates an Sarvam model for translation.
	 *
	 * @example
	 * 	const { text } = await generateText({
	 *		model: sarvam.translation("mayura:v1", {
	 *			to: "en-IN",
	 *			from: "ml-IN", // Optional
	 *		}),
	 *		prompt: "ഇതൊക്കെ ശ്രദ്ധിക്കണ്ടേ അംബാനെ?",
	 *	});
	 */
	translation<T extends TranslationModelId>(
		model: T,
		settings: TranslationSettings<T>,
	): LanguageModelV4;

	/**
	 * Creates an Sarvam model for language identification.
	 *
	 * @example
	 * 	const { text } = await generateText({
	 *		model: sarvam.languageIdentification(),
	 *		prompt: "ബുദ്ധിയാണ് സാറേ ഇവൻ്റെ മെയിൻ",
	 *	});
	 */
	languageIdentification(): LanguageModelV4;
};
