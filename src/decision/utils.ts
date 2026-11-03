import {
	type Experimental_DecisionModelV4Input as DecisionModelV4Input,
	type Experimental_DecisionModelV4Question as DecisionModelV4Question,
	type Experimental_DecisionModelV4State as DecisionModelV4State,
	type JSONValue,
	UnsupportedFunctionalityError,
} from "@ai-sdk/provider";

export function convertState(
	state: DecisionModelV4State,
): string | JSONValue[] {
	if (state.length === 0) {
		return "";
	}

	if (state.length === 1 && state[0].type === "text") {
		return state[0].text;
	}

	return state.map((part) => {
		switch (part.type) {
			case "text":
				return part.text;
			case "json":
				return part.value;
			default:
				throw new UnsupportedFunctionalityError({
					functionality: "file parts in decision state",
				});
		}
	});
}

export function convertQuestions(
	questions: Readonly<Record<string, DecisionModelV4Question>>,
) {
	return Object.fromEntries(
		Object.entries(questions).map(([questionId, question]) => [
			questionId,
			convertQuestion(question),
		]),
	);
}

function convertQuestion(question: DecisionModelV4Question) {
	switch (question.type) {
		case "choice":
			return {
				type: "choice",
				instructions: question.instructions,
				criteria: Object.fromEntries(
					Object.entries(question.criteria).map(([optionId, description]) => [
						optionId,
						toText(description),
					]),
				),
			};
		case "score":
			return {
				type: "score",
				instructions: question.instructions,
				criteria: question.criteria.map(toText),
			};
		case "boolean": {
			const { true: yes, false: no } = question.criteria ?? {};
			return {
				type: "noul",
				instructions: question.instructions,
				...(question.criteria && {
					criteria: {
						...(yes != null && { true: toText(yes) }),
						...(no != null && { false: toText(no) }),
					},
				}),
			};
		}
		case "box":
			throw new UnsupportedFunctionalityError({
				functionality: "box questions",
			});
	}
}

function toText(value: DecisionModelV4Input | null): string {
	if (value == null) {
		return "";
	}

	return typeof value === "string" ? value : JSON.stringify(value);
}
