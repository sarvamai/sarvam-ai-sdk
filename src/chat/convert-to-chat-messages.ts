import {
	type LanguageModelV4Prompt,
	UnsupportedFunctionalityError,
} from "@ai-sdk/provider";
import { getToolResultContent } from "./prepare-tools";
import type { SarvamChatPrompt, SarvamMessageToolCall } from "./types";

export function convertToChatMessages(
	prompt: LanguageModelV4Prompt,
): SarvamChatPrompt {
	const messages: SarvamChatPrompt = [];

	for (const message of prompt) {
		switch (message.role) {
			case "system": {
				messages.push({ role: "system", content: message.content });
				break;
			}

			case "user": {
				for (const part of message.content) {
					if (part.type !== "text")
						throw new UnsupportedFunctionalityError({
							functionality: `Unsupported content part type: ${part.type}`,
						});

					const content = part.text.trim();

					if (content)
						messages.push({
							role: "user",
							content,
						});
				}

				break;
			}

			case "assistant": {
				let text = "";
				const toolCalls: SarvamMessageToolCall[] = [];

				for (const part of message.content) {
					switch (part.type) {
						case "text": {
							text += part.text;
							break;
						}
						case "tool-call": {
							toolCalls.push({
								id: part.toolCallId,
								type: "function",
								function: {
									name: part.toolName,
									arguments:
										typeof part.input === "string"
											? part.input
											: JSON.stringify(part.input),
								},
							});
							break;
						}
						case "tool-result": {
							// Tool results are handled separately in the tool role
							break;
						}
					}
				}

				messages.push({
					role: "assistant",
					content: text,
					tool_calls: toolCalls.length > 0 ? toolCalls : undefined,
				});

				break;
			}

			case "tool": {
				for (const part of message.content) {
					if (part.type === "tool-result") {
						messages.push({
							role: "tool",
							tool_call_id: part.toolCallId,
							content: getToolResultContent(part.output),
						});
					}
				}
				break;
			}

			default: {
				const _exhaustiveCheck: never = message;
				throw new Error(`Unsupported role: ${_exhaustiveCheck}`);
			}
		}
	}

	return messages;
}
