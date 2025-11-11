import { NextResponse } from 'next/server';
import { DATABASE, AUTH } from '@/src/database/firebaseAdmin';

export async function POST(
  req: Request,
  { params } : { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  // Get the authorization token
  const authHeader = req.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.split(" ")[1]
    : null;

  if (!token) {
    return NextResponse.json({ success: false, error: "未登入" }, { status: 401 });
  }

  try {
    // Verify the token and get user ID
    const decodedToken = await AUTH.verifyIdToken(token);
    const userId = decodedToken.uid;

    // Get project data
    const projectRef = DATABASE.collection('projects').doc(projectId);
    const projectSnap = await projectRef.get();

    if (!projectSnap.exists) {
      return NextResponse.json({ success: false, error: "找不到專案" }, { status: 404 });
    }

    const projectData = projectSnap.data();

    // Check if user is the project owner
    if (projectData?.ownerId === userId) {
      return NextResponse.json({ success: false, error: "不能加入自己發起的專案" }, { status: 400 });
    }

    // Check if user has already applied
    const existingApplication = await DATABASE.collection('applications')
      .where('projectId', '==', projectId)
      .where('userId', '==', userId)
      .get();

    if (!existingApplication.empty) {
      return NextResponse.json({ success: false, error: "已經申請過此專案" }, { status: 400 });
    }

    // Create new application
    const applicationData = {
      projectId,
      userId,
      appliedAt: new Date(),
      applicationStatus: 'waiting'
    };

    await DATABASE.collection('applications').add(applicationData);

    return NextResponse.json({
      success: true,
      message: "成功申請加入專案"
    });

  } catch (error) {
    console.error('加入專案失敗：', error);
    return NextResponse.json({ success: false, error: "加入專案時發生錯誤" }, { status: 500 });
  }
} 
