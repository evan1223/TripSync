// src/app/api/signup/route.ts
import { NextRequest, NextResponse } from "next/server";
import { AUTH, DATABASE } from '@/database/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, gender } = await req.json();

    // AUTH
    const userRecord = await AUTH.createUser({
      email,
      password,
      displayName: name,
    });
    
    if (!userRecord?.uid) {
      throw new Error("Firebase 回傳無效的使用者 ID");
    }
    
    // 只有STEP1的寫入
    await DATABASE.collection("users").doc(userRecord.uid).set({
      name,
      email,
      gender,
      createdAt: new Date().toISOString(),
    });
  
    return NextResponse.json({ uid: userRecord.uid });
  
  } catch (err: any) {
    console.error("[/api/signup] Error:", err);
    let message = "註冊失敗";
    let errCode = "unknown";
    if(err.code === "auth/email-already-exists"){
      message = "此信箱已註冊，請使用其他信箱";
      errCode = "email-exists";
    }
    return NextResponse.json(
      { error: message, errCode },
      { status: 400 }
    );
  }
}


