import { cookies } from "next/headers";
import { AUTH } from "@/src/database/firebaseAdmin";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token) return new Response("Unauthorized", { status: 401 });

  try {
    const user = await AUTH.verifyIdToken(token); // Validate token again

    return Response.json({ email: user.email });
  } catch {
    return new Response("Invalid token", { status: 403 });
  }
}

