---
name: sarvam-ai-sdk
description: >-
  Set up and use the sarvam-ai-sdk provider for Vercel AI SDK v7 — install,
  SARVAM_API_KEY, the sarvam instance and createSarvam() factory, every model
  constructor (chat, transcription, speech, translation, transliterate,
  language identification), providerOptions/settings merge order, and the
  sarvam-ai-sdk/info export. Use this when a project needs Sarvam (Indic LLM,
  STT, TTS, or translation) inside the AI SDK. For the raw Sarvam REST/SDK
  (sarvamai package) instead of the provider, use the separate Sarvam API skills.
license: Apache-2.0
metadata:
  author: sarvam-ai
  version: "1.0"
---

# Sarvam provider for the Vercel AI SDK

`sarvam-ai-sdk` is a **provider package** for the AI SDK (the `ai` package). It does not wrap the raw `sarvamai` client — it plugs Sarvam models into AI SDK primitives like `generateText`, `streamText`, `generateSpeech`, and `transcribe`.

> [!IMPORTANT]
> This package targets **AI SDK v7** (`ai@7`). Do not mix it with v8. Import the `ai` package for the primitives and `sarvam-ai-sdk` only for the provider.

## Install

```bash
npm i sarvam-ai-sdk ai@7
```

```bash
# .env
SARVAM_API_KEY="your_api_key"   # from https://dashboard.sarvam.ai/
```

Node >= 22. `zod` is a peer dependency (`^3.25 || ^4`) — only needed if you use structured output.

## Provider instance

```ts
import { sarvam } from "sarvam-ai-sdk";

// or override the key / base URL / fetch (useful in tests):
import { createSarvam } from "sarvam-ai-sdk";
const custom = createSarvam({ apiKey: "…", baseURL: "…" });
```

Auth comes from `SARVAM_API_KEY` unless `apiKey` is passed. The provider sends the key as **both** `Authorization: Bearer` and `api-subscription-key`; do not add those headers yourself.

## Model constructors

| Call | Returns | Pairs with |
|------|---------|------------|
| `sarvam(modelId, settings?)` / `sarvam.chat(...)` / `sarvam.languageModel(...)` | `LanguageModelV4` | `generateText`, `streamText`, agents |
| `sarvam.transcription(modelId, languageCode?, settings?)` | `TranscriptionModelV4` | `transcribe` |
| `sarvam.speech(modelId, languageCode, settings?)` | `SpeechModelV4` | `generateSpeech` |
| `sarvam.translation(modelId, { from, to, … })` | `LanguageModelV4` | `generateText` only |
| `sarvam.transliterate({ to, from? })` | `LanguageModelV4` | `generateText` only |
| `sarvam.languageIdentification()` | `LanguageModelV4` | `generateText` only |
| `sarvam.decisionModel(modelId)` | `DecisionModelV4` | `decide` |

```ts
import { sarvam } from "sarvam-ai-sdk";

sarvam("sarvam-105b");                              // chat
sarvam("sarvam-105b", { version: "v2" });           // open-weight models live on v2
sarvam.speech("bulbul:v4-flash", "hi-IN", { speaker: "aparna_hi_customer" });
sarvam.transcription("saaras:v4");                  // language defaults to "unknown" (auto-detect)
sarvam.translation("mayura:v1", { from: "hi-IN", to: "en-IN" });
sarvam.transliterate({ to: "ml-IN", from: "en-IN" });
sarvam.languageIdentification();
sarvam.decisionModel("sarvam-prism");               // decide (choice, score, boolean)
```

Decisions (`experimental_decide` from `ai`) answer typed questions about one shared state:

```ts
import { experimental_decide as decide } from "ai";
import { sarvam } from "sarvam-ai-sdk";

const { answers } = await decide({
  model: sarvam.decisionModel("sarvam-prism"),
  state: "My Razorpay integration stopped working and all checkout payments are failing.",
  questions: {
    department: {
      type: "choice",
      instructions: "Which team should handle this?",
      criteria: { billing: "Payments or invoices", sales: "New business enquiries", technical: "Bugs or outages" },
    },
    severity: { type: "score", instructions: "Rate the severity.", criteria: ["trivial", "minor", "moderate", "major", "critical"] },
    urgent: { type: "boolean", instructions: "Is this urgent and revenue-impacting?" },
  },
});

answers.department.choice;        // "billing" | "sales" | "technical"
answers.urgent.probability;       // P(yes) in [0, 1]
```

Supported language codes are the BCP-47 Indian set (`hi-IN`, `bn-IN`, `ta-IN`, `ml-IN`, `en-IN`, …) plus an extended set for translation/transcription; `"unknown"` means auto-detect for transcription.

## Settings and merge order

Per-model settings can be given in the constructor (`sarvam("sarvam-105b", { … })`) or per call via `providerOptions.sarvam`. They merge as:

```
built-in option  →  providerOptions.sarvam  →  model-constructor settings
```

The **constructor wins**, so put durable config there and per-call overrides in `providerOptions.sarvam`.

```ts
await generateText({
  model: sarvam("sarvam-105b"),
  prompt: "…",
  providerOptions: { sarvam: { reasoning_effort: "low" } },
});
```

## Limits (`sarvam-ai-sdk/info`)

Context windows and per-model limits are published as a separate entry point — import them instead of hardcoding numbers:

```ts
import { SarvamChatModelInfo } from "sarvam-ai-sdk/info";

SarvamChatModelInfo["sarvam-105b"].context_window; // 128_000
```

Also exports `SarvamTranscriptionModelInfo`, `SarvamSpeechModelInfo`, `SarvamTranslationModelInfo`, and `SarvamTransliterateInfo`.

## Gotchas

| Gotcha | Detail |
|--------|--------|
| **AI SDK v7 only** | Pairs with `ai@7`. Package `0.4.x` → `ai@7`; `0.3.x` → `ai@6`; `0.5.x` (beta) → `ai@8` (beta). Do not cross versions. |
| **`sarvam-105b-conversations` is v1-only** | It cannot be switched to `version: "v2"`. Open-weight models (`glm5.3`, `gemma4`, `deepseekv4-flash`) live on v2. |
| **Chat defaults to `/v1`** | The provider appends `/v1` for chat and switches to `/v2` only when `settings.version === "v2"`. The other endpoints (STT/TTS/translate/transliterate/LID) are unprefixed. |
| **`sarvam-30b` is retired** | Don't generate code using it; use `sarvam-105b` or `sarvam-105b-conversations`. |
| **Reasoning is on by default** | Sarvam chat models think before answering. `reasoning_effort` accepts `"none" \| "low" \| "medium" \| "high"` (`"none"` is sent as `null` to disable). Low `maxOutputTokens` can let reasoning eat the whole budget and leave `text` empty. See the chat skill. |
| **This package is REST-only for speech** | `speech` and `transcription` call the REST endpoints. There is no Batch API, WebSocket streaming, diarization job, or dubbing surface here — use the raw `sarvamai` SDK for those. |
| **Translation / transliteration / LID don't stream** | Their `doStream()` throws. Use `generateText`, never `streamText`. Chat is the only streaming model. |
| **Decisions are text/JSON only** | `sarvam.decisionModel` supports `choice`, `score`, and `boolean` questions. `box` questions and file (image) parts in `state` throw `UnsupportedFunctionalityError`. Boolean maps to Sarvam's yes/no question and returns `probability`. |

## Related skills

- `sarvam-ai-sdk-chat` — text generation, streaming, agents, reasoning.
- `sarvam-ai-sdk-tools` — tool calling and structured output.
- `sarvam-ai-sdk-speech` — speech-to-text (`transcribe`) and text-to-speech (`generateSpeech`).
- `sarvam-ai-sdk-text` — translation, transliteration, language identification.
- `sarvam-ai-sdk-eve` — Eve agents and the info export.

## Docs

- [Sarvam provider docs](https://docs.sarvam.ai/api/integration/vercel-ai-sdk)
- [AI SDK providers](https://ai-sdk.dev/docs/foundations/providers-and-models)
- [Sarvam API docs index](https://docs.sarvam.ai/llms.txt)
