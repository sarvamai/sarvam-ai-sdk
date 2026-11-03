import { strict as assert } from "node:assert";
import test from "node:test";
import { UnsupportedFunctionalityError } from "@ai-sdk/provider";
import { experimental_decide } from "ai";
import { createSarvam } from "@/provider";

const decisionResponse = {
	model: "sarvam-prism",
	answers: {
		department: {
			type: "choice",
			choice: "billing",
			confidence: 0.7065,
			probabilities: {
				billing: 0.801210880279541,
				sales: 0.008307622745633125,
				technical: 0.19048148393630981,
			},
		},
		severity: {
			type: "score",
			confidence: 0.916,
			legend: {
				"0": "trivial",
				"1": "minor",
				"2": "moderate",
				"3": "major",
				"4": "critical",
			},
			probabilities: {
				"0": 0.0026251610834151506,
				"1": 0.0033498541451990604,
				"2": 0.011451262049376965,
				"3": 0.12446128576993942,
				"4": 0.8581123948097229,
			},
			score: 3.832085814792663,
		},
		urgent: {
			type: "noul",
			noul: 0.9782097339630127,
		},
	},
	usage: {
		input_tokens: 153,
		output_tokens: 0,
	},
};

const questions = {
	department: {
		type: "choice",
		instructions: "Which team should handle this?",
		criteria: {
			billing: "Payments or invoices",
			sales: "New business enquiries",
			technical: null,
		},
	},
	severity: {
		type: "score",
		instructions: "Rate the severity.",
		criteria: ["trivial", "minor", "moderate", "major", "critical"],
	},
	urgent: {
		type: "boolean",
		instructions: "Is this urgent and revenue-impacting?",
		criteria: { true: "Revenue is blocked" },
	},
} as const;

function createRecordingSarvam() {
	const requests: { url: string; body: unknown; headers: Headers }[] = [];

	const sarvam = createSarvam({
		apiKey: "test-api-key",
		fetch: async (url, init) => {
			requests.push({
				url: String(url),
				body: JSON.parse(String(init?.body)),
				headers: new Headers(init?.headers),
			});
			return Response.json(decisionResponse);
		},
	});

	return { sarvam, requests };
}

test("doDecide sends a systemone request with mapped questions", async () => {
	const { sarvam, requests } = createRecordingSarvam();

	await sarvam.decisionModel("sarvam-prism").doDecide({
		state: [{ type: "text", text: "My Razorpay integration is failing." }],
		questions,
	});

	const [request] = requests;
	assert.equal(request?.url, "https://api.sarvam.ai/v2/systemone");
	assert.equal(request?.headers.get("api-subscription-key"), "test-api-key");
	assert.deepEqual(request?.body, {
		model: "sarvam-prism",
		state: "My Razorpay integration is failing.",
		questions: {
			department: {
				type: "choice",
				instructions: "Which team should handle this?",
				criteria: {
					billing: "Payments or invoices",
					sales: "New business enquiries",
					technical: "",
				},
			},
			severity: {
				type: "score",
				instructions: "Rate the severity.",
				criteria: ["trivial", "minor", "moderate", "major", "critical"],
			},
			urgent: {
				type: "noul",
				instructions: "Is this urgent and revenue-impacting?",
				criteria: { true: "Revenue is blocked" },
			},
		},
	});
});

test("doDecide maps answers and confidence to AI SDK decision answers", async () => {
	const { sarvam } = createRecordingSarvam();

	const result = await sarvam.decisionModel("sarvam-prism").doDecide({
		state: [{ type: "text", text: "My Razorpay integration is failing." }],
		questions,
	});

	assert.deepEqual(result.answers, {
		department: {
			type: "choice",
			choice: "billing",
			probabilities: {
				billing: 0.801210880279541,
				sales: 0.008307622745633125,
				technical: 0.19048148393630981,
			},
		},
		severity: {
			type: "score",
			score: 3.832085814792663,
			probabilities: {
				"0": 0.0026251610834151506,
				"1": 0.0033498541451990604,
				"2": 0.011451262049376965,
				"3": 0.12446128576993942,
				"4": 0.8581123948097229,
			},
		},
		urgent: {
			type: "boolean",
			probability: 0.9782097339630127,
		},
	});
	assert.deepEqual(result.providerMetadata, {
		sarvam: { confidence: { department: 0.7065, severity: 0.916 } },
	});
	assert.equal(result.usage?.inputTokens, 153);
	assert.equal(result.usage?.outputTokens, 0);
	assert.equal(result.response?.modelId, "sarvam-prism");
});

test("experimental_decide accepts Sarvam decisions", async () => {
	const { sarvam } = createRecordingSarvam();

	const result = await experimental_decide({
		model: sarvam.decisionModel("sarvam-prism"),
		state: { message: "My Razorpay integration is failing." },
		questions,
	});

	assert.equal(result.answers.urgent.type, "boolean");
	assert.equal(result.answers.department.type, "choice");
	assert.equal(
		result.answers.department.type === "choice" &&
			result.answers.department.choice,
		"billing",
	);
});

test("doDecide rejects file parts in state", async () => {
	const { sarvam, requests } = createRecordingSarvam();

	await assert.rejects(
		async () =>
			sarvam.decisionModel("sarvam-prism").doDecide({
				state: [
					{ type: "text", text: "Inspect this package." },
					{
						type: "file",
						mediaType: "image/png",
						data: { type: "data", data: "AQ==" },
					},
				],
				questions,
			}),
		(error: unknown) => UnsupportedFunctionalityError.isInstance(error),
	);
	assert.equal(requests.length, 0);
});

test("doDecide rejects box questions", async () => {
	const { sarvam, requests } = createRecordingSarvam();

	await assert.rejects(
		async () =>
			sarvam.decisionModel("sarvam-prism").doDecide({
				state: [{ type: "text", text: "Inspect this package." }],
				questions: {
					damage: { type: "box", instructions: "Where is the damage?" },
				},
			}),
		(error: unknown) => UnsupportedFunctionalityError.isInstance(error),
	);
	assert.equal(requests.length, 0);
});
