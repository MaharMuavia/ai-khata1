import { GoogleGenAI, Type } from "@google/genai";
import { ParseResult, Transaction } from "./types";

export async function parseTransactionCommand(
  text: string,
  recentTransactions: Transaction[]
): Promise<ParseResult> {
  const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("Gemini API Key is missing.");
  }

  const ai = new GoogleGenAI({ apiKey });

  const recentContext = recentTransactions.length > 0 
    ? `Recent transactions context (for finding what to edit/delete):\n` + 
      recentTransactions.map(t => `- ID: ${t.id}, Category: ${t.category}, Amount: ${t.amount}, Item: ${t.item || 'N/A'}, Customer: ${t.customerName || 'N/A'}, Time: ${new Date(t.timestamp).toLocaleString()}`).join('\n')
    : "No recent transactions.";

  const prompt = `You are an AI financial assistant for small shopkeepers in Pakistan. 
Your task is to parse the shopkeeper's voice/text command (usually in mixed Urdu/English/Roman Urdu) and extract structured intent.

Command: "${text}"

${recentContext}

Determine what the user wants to do. It could be recording a new entry, deleting an entry, editing an entry, asking for a report, or something unclear.
Categories allowed: 'sales', 'expense', 'udhaar'.
Actions allowed: 'add', 'edit', 'delete', 'delete_last', 'report', 'unknown'.

If the amount is missing for an add/edit but needed, set needsClarification to true and return a clarificationMessage in Urdu/Roman Urdu.
If the command says "Aslam ka udhaar 800 kar do", lookup Aslam's recent transaction from context and provide its ID in targetId, action 'edit', amount 800.
If they say "delete last entry", set action 'delete_last'.

Return a JSON with the matching schema. Keep responseMessage short and conversational in Roman Urdu (e.g. "Theek hai, 500 ki sale add kar di.").
`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "add, edit, delete, delete_last, report, or unknown"
          },
          category: {
            type: Type.STRING,
            description: "sales, expense, or udhaar"
          },
          amount: {
            type: Type.NUMBER,
            description: "The parsed numerical amount"
          },
          item: {
            type: Type.STRING,
            description: "What was sold or bought"
          },
          customerName: {
            type: Type.STRING,
            description: "Name of the customer if it's udhaar or specific person"
          },
          targetId: {
            type: Type.STRING,
            description: "The ID of the transaction to edit/delete if found in context"
          },
          needsClarification: {
            type: Type.BOOLEAN,
            description: "True if critical information like amount is missing"
          },
          clarificationMessage: {
            type: Type.STRING,
            description: "Message asking for missing details"
          },
          responseMessage: {
            type: Type.STRING,
            description: "A short conversational confirmation in Roman Urdu"
          }
        },
        required: ["action", "needsClarification", "responseMessage"]
      }
    }
  });

  const parsedText = response.text;
  if (!parsedText) {
    throw new Error("Failed to generate response");
  }

  return JSON.parse(parsedText) as ParseResult;
}
