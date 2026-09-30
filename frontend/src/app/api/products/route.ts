import { NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

export async function GET() {
  try {
    const res = await fetch(`${BACKEND_URL}/api/products`);
    if (!res.ok) {
      throw new Error(`Failed to fetch products: ${res.statusText}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    return NextResponse.json({ products: [], total: 0, error: error.message }, { status: 500 });
  }
}
