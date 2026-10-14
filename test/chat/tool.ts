import { generateText, tool } from "ai";
import { z } from "zod";
import { sarvam } from "../sarvam";

const { toolResults } = await generateText({
	model: sarvam("sarvam-105b", {
		reasoning_effort: "none",
	}),
	tools: {
		weather: tool({
			description: "Get the weather in a location",
			inputSchema: z.object({
				location: z.string(),
			}),
			execute: async ({ location }) => ({
				location,
				temperature: 72 + Math.floor(Math.random() * 21) - 10,
			}),
		}),
	},
	system: "Your are a helpful AI",
	prompt: "കൊച്ചിയിലെ കാലാവസ്ഥ എന്താണ്?",
});

console.log(toolResults);
