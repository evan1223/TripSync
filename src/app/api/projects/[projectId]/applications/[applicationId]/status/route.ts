import { NextRequest, NextResponse } from "next/server";
import { updateApplicationStatus, ApplicationStatus } from "@/src/database/db";

type Params = {
  params: {
    projectId: string;
    applicationId: string;
  };
};

export async function PATCH(
  request: NextRequest,
  { params } : { params : Promise<{projectId: string, applicationId: string}> }
) {
  const { projectId, applicationId } = await params;

  console.log('收到更新申請狀態請求:', { applicationId, projectId });

  try {
    const body = await request.json();
    const { status } = body;

    console.log('請求體中的狀態:', status);

    if (!status || !['waiting', 'accepted', 'rejected'].includes(status)) {
      console.error('無效的狀態值:', status);
      return NextResponse.json(
        { success: false, error: "無效的狀態值", details: { status } },
        { status: 400 }
      );
    }

    if (!applicationId) {
      console.error('缺少申請ID');
      return NextResponse.json(
        { success: false, error: "缺少申請ID" },
        { status: 400 }
      );
    }

    console.log('正在調用 updateApplicationStatus...', { applicationId, status });
    const success = await updateApplicationStatus(applicationId, status as ApplicationStatus);
    console.log('updateApplicationStatus 返回:', success);

    if (success) {
      console.log('申請狀態更新成功');
      return NextResponse.json({ success: true });
    } else {
      console.error('更新狀態失敗');
      return NextResponse.json(
        { 
          success: false, 
          error: "更新狀態失敗",
          details: {
            applicationId,
            status,
            projectId
          }
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("更新狀態時發生錯誤:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "更新狀態時發生錯誤",
        details: error instanceof Error ? error.message : '未知錯誤'
      },
      { status: 500 }
    );
  }
} 
