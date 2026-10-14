import { generateText, Output } from "ai";
import { z } from "zod";
import { sarvam } from "../sarvam";

const { output } = await generateText({
	model: sarvam("sarvam-105b", {
		reasoning_effort: "none",
	}),
	output: Output.object({
		name: "recipe",
		schema: z.object({
			name: z.string().describe("Name of recipe"),
			ingredients: z.array(z.string()),
			steps: z.array(z.string()),
		}),
	}),
	prompt: "Generate a South Indian recipe, in Malayalam",
});

console.log(output);

const { output: json_mode } = await generateText({
	model: sarvam("sarvam-105b", {
		reasoning_effort: "none",
		experimental_json_mode: true,
	}),
	output: Output.object({
		schema: z.object({
			name: z.string().describe("Name of recipe"),
			ingredients: z.array(z.string()),
			steps: z.array(z.string()),
		}),
	}),
	prompt: "Generate a South Indian recipe, in Malayalam",
});

console.log(json_mode);
