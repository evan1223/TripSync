import { NextRequest, NextResponse } from "next/server";
import { DATABASE, STORAGE } from "@/src/database/firebaseAdmin";

type Params = {
  params: {
    projectId: string;
  };
};

export async function GET(request: NextRequest, { params } : { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  
  if (!projectId) {
    return NextResponse.json({ success: false, error: "缺少 projectId" }, { status: 400 });
  }
  try {
    const projectDoc = await DATABASE.collection("projects").doc(projectId).get();
    if (!projectDoc.exists) {
      return NextResponse.json({ success: false, error: "找不到專案" }, { status: 404 });
    }
    const projectData = projectDoc.data();
    let ownerName = "未提供";
    let ownerEmail = "未提供";
    if (projectData?.ownerId) {
      const userDoc = await DATABASE.collection("users").doc(projectData.ownerId).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        ownerName = userData?.name || "未提供";
        ownerEmail = userData?.email || "未提供";
      }
    }
    let projectTypeName = "";
    if (projectData?.projectTypeId) {
      const typeDoc = await DATABASE.collection("projectTypes").doc(projectData.projectTypeId).get();
      projectTypeName = typeDoc.exists ? typeDoc.data()?.projectTypeName : "";
    }
    let skillTypeNames: string[] = [];
    if (Array.isArray(projectData?.skillTypeId)) {
      skillTypeNames = await Promise.all(
        projectData.skillTypeId.map(async (id: string) => {
          const skillDoc = await DATABASE.collection("skillTypes").doc(id).get();
          return skillDoc.exists ? skillDoc.data()?.skillTypeName : null;
        })
      );
      skillTypeNames = skillTypeNames.filter((name) => !!name) as string[];
    }
    return NextResponse.json({
      success: true,
      data: {
        ...projectData,
        ownerId: projectData?.ownerId || null, // 新增 ownerId 回傳
        ownerName,
        ownerEmail,
        projectTypeName,
        skillTypeNames,
      },
    });
  } catch (error) {
    console.error("讀取專案失敗：", error);
    return NextResponse.json({ success: false, error: "伺服器錯誤" }, { status: 500 });
  }
}

// 刪除專案資料
export async function DELETE(
  req: NextRequest,
  { params } : { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  if (!projectId) {
    return NextResponse.json({ success: false, error: '缺少 projectId' }, { status: 400 });
  }

  try {
    const projectDocRef = DATABASE.collection('projects').doc(projectId);
    const projectDoc = await projectDocRef.get();

    if (!projectDoc.exists) {
      return NextResponse.json({ success: false, error: '找不到專案' }, { status: 404 });
    }

    const projectData = projectDoc.data();
    const imageUrl: string | undefined = projectData?.projectImageUrl;

    // 刪除 applications 中與此 projectId 相關的資料
    const appQuerySnapshot = await DATABASE.collection('applications')
      .where('projectId', '==', projectId)
      .get();

    const deleteApplicationPromises = appQuerySnapshot.docs.map((doc) => doc.ref.delete());
    await Promise.all(deleteApplicationPromises);

    // 刪除 Firebase Storage 中的圖片
    if (imageUrl) {
      const bucket = STORAGE.bucket();
      const match = imageUrl.match(/\/o\/(.*?)\?alt=/);
      if (match && match[1]) {
        const decodedPath = decodeURIComponent(match[1]);
        await bucket.file(decodedPath).delete();
        console.log(`成功刪除圖片: ${decodedPath}`);
      } else {
        console.warn('無法解析圖片路徑，未執行刪除圖片');
      }
    }

    // 刪除專案本身
    await projectDocRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('刪除專案錯誤：', error);
    return NextResponse.json({ success: false, error: '刪除失敗' }, { status: 500 });
  }
}
