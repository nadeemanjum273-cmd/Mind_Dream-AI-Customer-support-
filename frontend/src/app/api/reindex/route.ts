import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

export async function POST() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/reindex`, {
      method: "POST",
    });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
