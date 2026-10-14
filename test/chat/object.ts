import { generateObject } from "ai";
import { z } from "zod";
import { sarvam } from "../sarvam";

const { object } = await generateObject({
	model: sarvam("sarvam-105b", {
		reasoning_effort: "none",
		// experimental_json_mode: true,
	}),
	schema: z.object({
		name: z.string().describe("Name of recipe"),
		ingredients: z.array(z.string()),
		steps: z.array(z.string()),
	}),
	prompt: "Generate a South Indian recipe, in Malayalam",
});

console.log({ object });

const { object: json_mode } = await generateObject({
	model: sarvam("sarvam-105b", {
		reasoning_effort: "none",
		experimental_json_mode: true,
	}),
	schema: z.object({
		name: z.string().describe("Name of recipe"),
		ingredients: z.array(z.string()),
		steps: z.array(z.string()),
	}),
	prompt: "Generate a South Indian recipe, in Malayalam",
});

console.log({ json_mode });
