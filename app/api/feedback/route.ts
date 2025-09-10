// app/api/feedback/route.ts
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(request: Request) {
  try {
    const payload = await request.json().catch(() => ({}));

    // Ensure env var is present
    const keyEnv = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_JSON;
    if (!keyEnv) {
      throw new Error("Missing GOOGLE_SERVICE_ACCOUNT_KEY_JSON env var");
    }

    // Parse service account key JSON
    interface GoogleServiceAccountKey {
  client_email: string;
  private_key: string;
}

let key: GoogleServiceAccountKey;
try {
  key = JSON.parse(keyEnv) as GoogleServiceAccountKey;
} catch (err) {
  throw new Error("Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY_JSON: " + String(err));
}

    try {
      key = JSON.parse(keyEnv);
    } catch (err) {
      throw new Error("Failed to parse GOOGLE_SERVICE_ACCOUNT_KEY_JSON: " + String(err));
    }

    // Create JWT client using the modern options object shape
    const jwtClient = new google.auth.JWT({
      email: key.client_email,
      key: key.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    });

    await jwtClient.authorize();

    const sheets = google.sheets({ version: "v4", auth: jwtClient });
    const spreadsheetId = "1pJAUkdlXH7_W7Ip1k_G-BY2OrHsgvcp2vrEdCFFzinQ";

    const values = [
      [
        payload.timestamp || new Date().toISOString(),
        payload.rating || "",
        payload.feedback || "",
        payload.meta ? JSON.stringify(payload.meta) : "",
        payload.userAgent || "",
      ],
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: "Sheet1!A:E",
      valueInputOption: "RAW",
      requestBody: { values },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Sheets append error:", err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
