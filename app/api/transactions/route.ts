import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabaseServer";

const supabase = supabaseServer as any;

function isValidTransactionId(id: unknown) {
  return typeof id === "string" && id.trim().length > 0 && id !== "null";
}

export async function GET(request: NextRequest) {
  try {
    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .order("timestamp", { ascending: false });

    if (error) {
      console.error("GET transactions error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to fetch transactions" },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET transactions exception:", error);
    const errorMsg = error instanceof Error ? error.message : "Failed to fetch transactions";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { id, category, amount, item, customer_name, status, timestamp } = body;

    // Validate required fields
    if (!id || !category || amount === undefined || !timestamp) {
      return NextResponse.json(
        { error: "Missing required fields: id, category, amount, timestamp" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("transactions")
      .insert([
        {
          id,
          category,
          amount: parseFloat(amount),
          item: item || null,
          customer_name: customer_name || null,
          status: status || null,
          timestamp,
        },
      ])
      .select("*");

    if (error) {
      console.error("POST transaction error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to create transaction" },
        { status: 400 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    console.error("POST transaction exception:", error);
    const errorMsg = error instanceof Error ? error.message : "Failed to create transaction";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 }
      );
    }

    // Convert camelCase to snake_case for database
    const payload: any = {};
    if (updates.category !== undefined) payload.category = updates.category;
    if (updates.amount !== undefined) payload.amount = parseFloat(updates.amount);
    if (updates.item !== undefined) payload.item = updates.item || null;
    if (updates.customer_name !== undefined) payload.customer_name = updates.customer_name || null;
    if (updates.status !== undefined) payload.status = updates.status || null;
    if (updates.timestamp !== undefined) payload.timestamp = updates.timestamp;

    const { data, error } = await supabase
      .from("transactions")
      .update(payload)
      .eq("id", id)
      .select("*");

    if (error) {
      console.error("PUT transaction error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to update transaction" },
        { status: 400 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("PUT transaction exception:", error);
    const errorMsg = error instanceof Error ? error.message : "Failed to update transaction";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json(
        { error: "Invalid JSON in request body" },
        { status: 400 }
      );
    }

    const { id } = body;

    if (!isValidTransactionId(id)) {
      return NextResponse.json(
        { error: "Missing or invalid required field: id" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("transactions")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("DELETE transaction error:", error);
      return NextResponse.json(
        { error: error.message || "Failed to delete transaction" },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE transaction exception:", error);
    const errorMsg = error instanceof Error ? error.message : "Failed to delete transaction";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
