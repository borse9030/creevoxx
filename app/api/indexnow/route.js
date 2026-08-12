import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url) {
      return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
    }

    const apiKey = process.env.INDEXNOW_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "IndexNow API Key not configured on server" }, { status: 500 });
    }

    const host = "creevoxx.store";
    const payload = {
      host: host,
      key: apiKey,
      keyLocation: `https://${host}/${apiKey}.txt`,
      urlList: [url],
    };

    console.log(`[IndexNow] Pinging URL: ${url}`);
    const response = await fetch("https://api.indexnow.org/IndexNow", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`IndexNow returned status: ${response.status}`);
    }

    return NextResponse.json({ success: true, message: "URL successfully submitted to IndexNow" });
  } catch (error) {
    console.error("[IndexNow Error] Submission failed:", error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
