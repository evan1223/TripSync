import { NextRequest, NextResponse } from "next/server";
import { DATABASE, AUTH } from "@/src/database/firebaseAdmin";

export async function GET(req: NextRequest) {
  // 測試userId資料
  // const userId = "jiULteWMC9hDuyOE4EZXZXxDGI823";

  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized: No token provided" }, { status: 401 });
  }
  
  const formatDate = (d: Date) =>
  d.toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).replaceAll("/", ".");


  try {

    const decodedToken = await AUTH.verifyIdToken(token);
    const userId = decodedToken.uid;
    console.log("讀到iD", userId)

    // Find the user's all lauchproject
    const appSnap = await DATABASE
      .collection('projects')
      .where('ownerId', '==', userId)
      .get();

    if (appSnap.empty) {
      return NextResponse.json([], { status: 200 });
    }
    // 找到技術分類
    const launchedProjects = await Promise.all(
      appSnap.docs.map(async (doc) => {
        const projectData = doc.data();
        const skillIds = projectData.skillTypeId || [];

        // 查詢userId 是誰
        const userData = DATABASE.collection("users").doc(projectData.ownerId);
        const userInfoSnap = await userData.get();
        const userDetail = userInfoSnap.data()
        if (!userDetail) {
          return null;
        };

        // 查詢多個技術分類
        const skillDocs = await Promise.all(
          skillIds.map((id: string) => DATABASE.collection("skillTypes").doc(id).get())
        );

        const skillNames = skillDocs.map(doc =>
          doc.exists ? doc.data().skillTypeName : "未知技能"
        );
        // 將專案時間dateRange格式化
        return {
          //修改確認
          id: doc.id,
          dateRange: `${formatDate(projectData.startDate.toDate())} - ${formatDate(projectData.endDate.toDate())}`,
          skillTypeName: skillNames,
          ownerName: userDetail.name,
          ...projectData,
        };
      })
    );

    // Filter out nulls (nonexistent projects)
    const results = launchedProjects.filter((p) => p !== null);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error("Error fetching launched projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch launched projects" },
      { status: 500 }
    );
  }
}


