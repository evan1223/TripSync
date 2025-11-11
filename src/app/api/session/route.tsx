import { cookies } from "next/headers";
import { AUTH } from "@/src/database/firebaseAdmin";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) 
    return NextResponse.json({ loggedIn: false }, { status: 401 });

  try {
    const decoded = await AUTH.verifyIdToken(token);
    return NextResponse.json({ loggedIn: true, email: decoded.email, name: decoded.name, uid: decoded.uid  });
  } catch {
    return NextResponse.json({ loggedIn: false }, { status: 403 });
  }
}

