import { NextRequest, NextResponse } from "next/server";
import { AUTH } from "@/src/database/firebaseAdmin"; // Firebase Admin SDK

export async function POST(req: NextRequest) {
  const { token } = await req.json(); // Receive token from frontend

  try {
    const decodedToken = await AUTH.verifyIdToken(token);

    const response = NextResponse.json({ success: true });

    response.cookies.set("session", token, {
      httpOnly: true,  // Not accessible via JavaScript
      secure: true,    // Only over HTTPS
      path: "/",
      maxAge: 60*60*12 , // 12 hours
    });
    return response;
  } catch (err) {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}

