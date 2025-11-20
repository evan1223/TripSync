import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { AUTH, DATABASE } from "@/src/database/firebaseAdmin";

export async function POST(req: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;

  if (!token)
    return NextResponse.json({ loggedIn: false }, { status: 401 });

  try {
    const decoded = await AUTH.verifyIdToken(token);
    const userId = decoded.uid;
    const body = await req.json();

    const projectName = body.projectName;
    const rawProjectTypeName: string = body.projectTypeName || "";

    // 🔹 將「旅行地點」字串用 "/" 分割成陣列
    const locations: string[] = Array.isArray(body.locations)
      ? body.locations
      : rawProjectTypeName
          .split("/")
          .map((loc: string) => loc.trim())
          .filter((loc: string) => loc.length > 0);

    // 🔹 技能名稱陣列（前端用 TextInput 已經包成陣列了）
    const skillTypeNames: string[] = body.skillTypeNames || [];

    // 🔹 預算細項：做一次安全處理
    const rawBudgetItems = Array.isArray(body.budgetItems)
      ? body.budgetItems
      : [];

    const budgetItems = rawBudgetItems
      .filter((item: any) => {
        const label = (item?.label ?? "").toString().trim();
        const amount = (item?.amount ?? "").toString().trim();
        return label !== "" && amount !== "";
      })
      .map((item: any) => ({
        label: (item?.label ?? "").toString().trim(),
        amount: Number(item?.amount ?? 0),
      }));

    // （如果之後想要存總預算，也可以在這裡算）
    // const totalBudget = budgetItems.reduce((sum, i) => sum + (i.amount || 0), 0);

    // =========================================================
    // 1. 先檢查這個 user 是否已有同名專案 → 有的話更新
    // =========================================================
    const existingProjectSnap = await DATABASE.collection("projects")
      .where("projectName", "==", projectName)
      .where("ownerId", "==", userId)
      .limit(1)
      .get();

    if (!existingProjectSnap.empty) {
      const existingProject = existingProjectSnap.docs[0];
      const projectId = existingProject.id;

      await existingProject.ref.update({
        projectDescription: body.projectDescription,
        startDate: new Date(body.startDate),
        endDate: new Date(body.endDate),
        peopleRequired: Number(body.peopleRequired),
        skillDescription: body.skillDescription,
        projectImageUrl: body.projectImageUrl,
        status: "open",
        projectTypeName: rawProjectTypeName,
        locations,
        budgetItems,               // ✅ 更新預算細項
        // totalBudget,            // 若有需要可以一起存
      });

      return NextResponse.json({
        success: true,
        updated: true,
        projectId,
      });
    }

    // =========================================================
    // 2. 若專案不存在 → 建立 projectTypes / skillTypes / project
    // =========================================================

    // 2-1. 每個地點各自建立 / 重用一筆 projectTypes
    const projectTypeIds: string[] = [];

    for (const loc of locations) {
      if (!loc) continue;

      const typeSnap = await DATABASE.collection("projectTypes")
        .where("projectTypeName", "==", loc)
        .limit(1)
        .get();

      if (!typeSnap.empty) {
        projectTypeIds.push(typeSnap.docs[0].id);
      } else {
        const ref = await DATABASE.collection("projectTypes").add({
          projectTypeName: loc,
        });
        projectTypeIds.push(ref.id);
      }
    }

    // 2-2. 建立 skillTypes
    const skillTypeId: string[] = [];
    for (const name of skillTypeNames) {
      if (!name) continue;
      const ref = await DATABASE.collection("skillTypes").add({
        skillTypeName: name,
      });
      skillTypeId.push(ref.id);
    }

    // 2-3. 建立新專案（✅ 把 budgetItems 一起存進去）
    const projectRef = await DATABASE.collection("projects").add({
      projectName,
      projectDescription: body.projectDescription,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      peopleRequired: Number(body.peopleRequired),
      skillTypeId,
      skillDescription: body.skillDescription,
      projectTypeName: rawProjectTypeName,
      locations,
      projectTypeId: projectTypeIds[0] || null,
      projectTypeIds,
      projectImageUrl: body.projectImageUrl,
      ownerId: userId,
      status: "open",
      budgetItems,                // ✅ 新增欄位：預算細項
      // totalBudget,             // 若有需要可以一起存
      createdAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      created: true,
      projectId: projectRef.id,
    });
  } catch (err: any) {
    console.error("Create or update project failed:", err.message);
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
