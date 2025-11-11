"use client";

import Sidebar from "@/components/Sidebar";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import db from "@/src/database/firestore";
import { User } from "firebase/auth";

interface UserData {
  name?: string;
  gender?: string;
  email?: string;
}

export default function MemberPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [isLogIn, setIsLogIn] = useState<boolean | null>(null);

  useEffect(() => {
    const fetchUserSession = async () => {
      try {
        const res = await fetch("/api/session");
        if (!res.ok) {
          throw new Error("尚未登入");
        }

        const session = await res.json(); // assume this returns { uid: string }
        const { uid } = session;

        const userRef = doc(db, "users", uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setUserData(userSnap.data() as UserData);
          setIsLogIn(true);
        } else {
          setError("找不到會員資料。");
        }
      } catch (err: any) {
        console.error("會話或會員資料錯誤:", err);
        setError(err.message || "驗證失敗，請重新登入");
        router.replace("/login");
      } finally {
        setLoading(false);
        setAuthChecked(true);
      }
    };

    fetchUserSession();
  }, [router]);

  if (!authChecked) return null;

  if (loading) {
    return (
      <main className="h-full flex bg-gray-50 text-gray-800 justify-around">
      <div className="mt-16">
      <Sidebar />
      </div>
      <section className="flex p-10 w-[70%] mr-16">
      <div className="bg-white rounded-2xl p-8 flex flex-col space-y-6 w-full">
      <div className="text-center text-gray-500">載入會員資料中...</div>
      </div>
      </section>
      </main>
    );
  }

  if (error || !userData) {
    return (
      <main className="h-full flex bg-gray-50 text-gray-800 justify-around">
      <div className="mt-16">
      <Sidebar />
      </div>
      <section className="flex p-10 w-[70%] mr-16">
      <div className="bg-white rounded-2xl p-8 flex flex-col space-y-6 w-full">
      <div className="text-center text-red-500">{error || "找不到會員資料。"}</div>
      </div>
      </section>
      </main>
    );
  }

  return (
    <main className="h-full flex bg-gray-50 text-gray-800 justify-around">
      {/* Sidebar */}
      <div className="mt-16">
        <Sidebar />
      </div>

      {/* Main Content */}
      <section className="flex p-10 w-[70%] mr-16">
        {/* 外層大白色區塊 */}
        <div className="bg-white rounded-2xl py-8 px-[50px] flex flex-col space-y-6 relative w-full">
          {/* 標題 */}
          <h1 className="text-2xl font-bold text-primary-blue0">會員資料</h1>
          <div className="border-t border-gray-200" />

          <div className="bg-white rounded-2xl shadow-md p-8 space-y-6">
            {/* 會員資料列 */}
            <div className="flex justify-between border-b border-gray-200 pb-4">
              <span className="font-semibold">姓名</span>
              <span>{userData.name || "未提供"}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-4">
              <span className="font-semibold">性別</span>
              <span>{userData.gender || "未提供"}</span>
            </div>
            <div className="flex justify-between border-b border-gray-200 pb-4">
              <span className="font-semibold">帳號</span>
              <span className="text-blue-600">{userData.email || "未提供"}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold">密碼</span>
              <span>******</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
