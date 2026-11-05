import assert from "node:assert/strict";
import test from "node:test";
import { generateText, tool } from "ai";
import { z } from "zod";
import { createSarvam } from "../../src/index";

test("does not send internal toolWarnings in chat completion requests", async () => {
	const requestBodies: unknown[] = [];
	const sarvam = createSarvam({
		apiKey: "test-key",
		fetch: async (_url, init) => {
			requestBodies.push(JSON.parse(init?.body as string));
			return new Response(
				JSON.stringify({
					id: "chatcmpl-test",
					choices: [
						{
							index: 0,
							finish_reason: "stop",
							message: { content: "ok" },
						},
					],
					usage: {
						prompt_tokens: 1,
						completion_tokens: 1,
						total_tokens: 2,
					},
				}),
				{ headers: { "content-type": "application/json" } },
			);
		},
	});

	await generateText({
		model: sarvam("sarvam-105b"),
		prompt: "What is the weather in Mumbai?",
		tools: {
			weather: tool({
				description: "Gets the weather for a location.",
				inputSchema: z.object({ location: z.string() }),
			}),
		},
	});

	assert.equal(requestBodies.length, 1);
	assert.equal("toolWarnings" in (requestBodies[0] as object), false);
});
