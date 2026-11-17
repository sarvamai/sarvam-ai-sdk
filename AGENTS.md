# AGENTS.md

`sarvam-ai-sdk` is the Sarvam provider for Vercel AI SDK **v7**. It is a Bun-managed, ESM-only TypeScript library published to npm.

## Commands

- `bun i` — install (lockfile is `bun.lock`; do not introduce npm/pnpm lockfiles).
- `bun test` — unit tests only. `bunfig.toml` sets `[test] root = "test/unit"`, so nothing else under `test/` runs.
- `bun test test/unit/language-model.test.ts` — single test file.
- `bun run check` — `tsc --noEmit` (the only typecheck; run it before finishing).
- `bun run build` — `tsdown`, writes `dist/` (gitignored). Entries: `src/index.ts` and `src/info.ts` only.
- `bunx biome check <paths>` — lint/format, but there is **no `lint` script** in `package.json`.
- `bun run test/chat/index.ts` (or any other file in `test/`) — live-API integration script, requires `SARVAM_API_KEY`; not part of CI.

## Architecture

- `src/provider.ts` — `createSarvam()` factory and the default `sarvam` instance. All model constructors are wired here; add new models here and in `src/type.ts`.
- `src/chat/` — chat completions (`LanguageModelV4`), including tool calling, structured output, and SSE streaming.
- `src/stt/` — speech-to-text (`TranscriptionModelV4`).
- `src/tts/` — text-to-speech (`SpeechModelV4`).
- `src/ttt/` — translation, transliteration, and language ID. These are text-to-text APIs but implement `LanguageModelV4` so they work with `generateText`. Their `doStream()` intentionally throws; only chat supports streaming.
- `src/info.ts` — model limits/context windows, published as the separate `sarvam-ai-sdk/info` export. Update it when adding models.
- `src/config.ts` — base URL, API key, headers, language/script enums. `src/error.ts` — shared API error schema/handler.

## Consumer skills (keep in sync)

- `skills/` holds the **user-facing** skills developers install with the `skills` CLI (`npx skills add <owner>/<repo>`). `skills.sh.json` (repo root) only controls how they are grouped on the skills.sh repo page — it is **display-only** and does not affect installs.
- These skills are shipped documentation: they embed exact method signatures, settings keys, defaults, endpoints, model IDs, the settings merge order, and gotchas. They go stale the moment the code changes.
- **Whenever you change observable behavior in `src/`, update the matching `skills/**/SKILL.md` in the same change — treat it like updating the README.** Map changes as follows:
  - provider methods / model constructors / install + version-compat → `skills/sarvam-ai-sdk/SKILL.md`
  - chat settings, defaults, `v1`/`v2` routing, reasoning → `skills/sarvam-ai-sdk-chat/SKILL.md`
  - tool calling, `tool_choice`, structured output → `skills/sarvam-ai-sdk-tools/SKILL.md`
  - STT/TTS params, speakers, codecs, limits → `skills/sarvam-ai-sdk-speech/SKILL.md`
  - translation / transliteration / LID settings and validation → `skills/sarvam-ai-sdk-text/SKILL.md`
  - Eve integration or `src/info.ts` limits → `skills/sarvam-ai-sdk-eve/SKILL.md`
- `.agents/skills/` holds internal dev skills (raw `sarvamai` API + generic AI SDK) used to build this package. They are marked `metadata.internal: true` so `npx skills add` never ships them to consumers, while OpenCode still loads them locally. Do not edit them when changing consumer behavior, and never assume external users can install them.
- Validate skill changes with `npx skills add . --list` (should list only the consumer skills, no errors) and `bunx biome check skills.sh.json`.

## Gotchas

- This branch targets AI SDK v7 / provider spec **V4** (`LanguageModelV4`, `specificationVersion = "v4"`). Do not copy types or APIs from older `LanguageModelV1`-style providers.
- Chat requests go to `/v1` by default; `settings.version: "v2"` switches to `/v2` (open-weight models live on v2). `sarvam-105b-conversations` is v1-only.
- Settings merge order is `built-in option -> providerOptions.sarvam -> model-constructor settings`, so constructor settings win over per-call `providerOptions`.
- The provider sends the key as both `Authorization: Bearer` and `api-subscription-key`; auth comes from `SARVAM_API_KEY` unless `apiKey` is passed.
- `bun run build` must succeed for published behavior: `dist/` is the package output, and `package.json` exports only `.` and `./info`. Never edit `dist/` by hand.
- Most tracked files are checked out with CRLF while Biome expects LF, so `biome check` reports many pre-existing formatting errors on a clean tree. Do not bulk-run `biome format --write`/`--write` across the repo; it creates huge line-ending diffs.
- Node >= 22 is required.

## Testing

- Unit tests live in `test/unit/` and must use the AI SDK test helpers, e.g. `createSarvam({ apiKey: "test", fetch: async () => new Response(...) })` with `convertReadableStreamToArray` from `@ai-sdk/provider-utils/test`. They never call the real API.
- Files directly under `test/` and `test/chat/` are manual integration scripts that hit Sarvam; do not rely on them for verification.
- No test covers STT/TTS/translation/transliteration/LID or non-streaming chat yet — add unit tests in `test/unit/` when changing those paths.
