import { NextRequest, NextResponse } from "next/server";
import { DATABASE } from "@/src/database/firebaseAdmin";
import { getUserData, processAvatarUrl } from "@/src/database/db";

export async function GET(request: NextRequest, { params } : { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  try {
    // 所有該專案的申請
    const appSnap = await DATABASE
    .collection("applications")
    .where("projectId", "==", projectId)
    .get();

    if (appSnap.empty) {
      return NextResponse.json({ success: true, data: [] }, { status: 200 });
    }

    const applications = await Promise.all(
      appSnap.docs.map(async (doc) => {
        const appData = doc.data();
        const userId = appData.userId;

        // 使用新的數據庫模塊獲取用戶數據
        const userData = await getUserData(userId);
        const avatarUrl = processAvatarUrl(userData?.avatarUrl || null);

        return {
          id: doc.id,
          ...appData,
          userName: userData?.name || "未知使用者",
          userAvatar: avatarUrl,
          userBio: userData?.bio || "",
        };
      })
    );

    return NextResponse.json({ success: true, data: applications }, { status: 200 });
  } catch (error) {
    console.error("Error loading applications:", error);
    return NextResponse.json({ success: false, error: "無法取得申請資料" }, { status: 500 });
  }
}
