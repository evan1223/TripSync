import { NextRequest, NextResponse } from 'next/server';
import { DATABASE } from '@/src/database/firebaseAdmin';

export async function PATCH(
  req: NextRequest,
  { params } : { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;
  let manual = false;

  try {
    const body = req.body ? await req.json() : null;
    if (body && body.manual === true) {
      manual = true;
    }
  } catch {
  }

  if (!projectId) {
    return NextResponse.json({ success: false, error: '缺少 projectId' }, { status: 400 });
  }

  try {
    // 專案資料
    const projectRef = DATABASE.collection('projects').doc(projectId);
    const projectSnap = await projectRef.get();
    if (!projectSnap.exists) {
      return NextResponse.json({ success: false, error: '找不到專案' }, { status: 404 });
    }
    const projectData = projectSnap.data();
    const peopleRequired = projectData?.peopleRequired;
    if (!peopleRequired) {
      return NextResponse.json({ success: false, error: '缺少 peopleRequired 欄位' }, { status: 400 });
    }

    // 目前 accepted 數量
    const acceptedSnap = await DATABASE.collection('applications')
      .where('projectId', '==', projectId)
      .where('applicationStatus', '==', 'accepted')
      .get();
    const acceptedCount = acceptedSnap.size;

    if (manual || acceptedCount >= peopleRequired) {
      // status 
      await projectRef.update({ status: 'closed' });

      // applicationStatus
      const appsSnapshot = await DATABASE.collection('applications')
        .where('projectId', '==', projectId)
        .where('applicationStatus', '==', 'waiting')
        .get();

      const updates = appsSnapshot.docs.map(doc =>
        doc.ref.update({ applicationStatus: 'rejected' })
      );
      await Promise.all(updates);

      return NextResponse.json({
        success: true,
        closed: true,
        autoClosed: !manual,
        rejectedCount: updates.length,
        acceptedCount,
        message: manual ? '手動結案成功' : '人數已額滿！自動結案'
      });
    } else {
      return NextResponse.json({
        success: true,
        closed: false,
        acceptedCount,
        peopleRequired,
        message: '尚未額滿'
      });
    }
  } catch (error) {
    console.error('結案失敗：', error);
    return NextResponse.json({ success: false, error: '結案時發生錯誤' }, { status: 500 });
  }
}
