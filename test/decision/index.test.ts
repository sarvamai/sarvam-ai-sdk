import { experimental_decide as decide } from "ai";
import { sarvam } from "../sarvam";

const result = await decide({
	model: sarvam.decisionModel("sarvam-prism"),
	state: "അയ്യോ, എൻ്റെ പൈസ ആരോ അടിച്ചു കൊണ്ടു പോയേ",
	questions: {
		department: {
			type: "choice",
			instructions: "Which team should handle this?",
			criteria: {
				billing: "Payments or invoices",
				sales: "New business enquiries",
				technical: "Bugs or outages",
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
		},
	},
});

console.log(result.answers);
