import { NextRequest, NextResponse } from "next/server";
import { DATABASE } from "@/src/database/firebaseAdmin";

export async function POST(req: NextRequest) {
  try {
    const { uid, nickname, userCommunity, bio, user_pf_url } = await req.json();

    if (!uid) {
      return NextResponse.json({ error: "缺少 uid" }, { status: 400 });
    }

    const DEFAULT_PICTURE_URL = "https://firebasestorage.googleapis.com/v0/b/saad-5ae18.firebasestorage.app/o/avatars%2Favatar_default.png?alt=media&token=bd7c3573-7223-4cda-b7be-a4d820e6987a";

    await DATABASE.collection("users").doc(uid).update({
      ...(nickname && { nickname }),
      ...(userCommunity && { userCommunity }),
      ...(bio && { bio }),
      ...(user_pf_url && { user_pf_url }),
      profilePicUrl: DEFAULT_PICTURE_URL,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("[/api/signup/step2] Error:", err);
    return NextResponse.json(
      { error: err.message || "更新資料失敗" },
      { status: 500 }
    );
  }
}