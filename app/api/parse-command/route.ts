import { NextRequest, NextResponse } from "next/server";
import { parseTransactionCommand } from "@/lib/gemini";
import { Transaction } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const text = typeof body.text === "string" ? body.text : "";
    const recentTransactions = Array.isArray(body.recentTransactions)
      ? (body.recentTransactions as Transaction[])
      : [];

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Missing required field: text" },
        { status: 400 }
      );
    }

    const data = await parseTransactionCommand(text, recentTransactions);

    return NextResponse.json({ data });
  } catch (error) {
    console.error("POST parse-command exception:", error);
    const message =
      error instanceof Error ? error.message : "Failed to parse command";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
