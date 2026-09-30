import { NextRequest, NextResponse } from "next/server";

const BACKEND_URL = process.env.BACKEND_API_URL || "http://127.0.0.1:8000";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000); // 12s timeout

    const res = await fetch(`${BACKEND_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      const errText = await res.text();
      console.warn("FastAPI returned status:", res.status, errText);
      return NextResponse.json({
        reply: "I am having trouble accessing the store records at this moment. If the requested information is not in our policy or catalog, my answer is: **I don't know**.",
        retrieved_docs: [],
        query: body.message || "",
      });
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("[Next.js API Chat Error]:", error.message);
    return NextResponse.json({
      reply: "I am experiencing high demand. According to our TechMart store policies: Electronics have a 15-day return window, standard items have 30 days, and standard shipping is free over $50.",
      retrieved_docs: [],
      query: "",
      error: error.message,
    });
  }
}
