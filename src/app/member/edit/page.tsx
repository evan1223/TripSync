"use client";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {
  UserCircleIcon,
  MailIcon,
  MessageChatbotIcon,
  WorldIcon,
  SaveIcon,
  UploadIcon,
} from "@/components/icons";

export default function EditMemberPage() {
  const router = useRouter();

  const [name, setName] = useState("陳誠臣");
  const [gender, setGender] = useState("生理男");
  const [email, setEmail] = useState("111111@nccu.edu.tw");
  const [password, setPassword] = useState("******");

  const handleSave = () => {
    // 這邊可以加上呼叫 API 更新資料
    router.push("/member"); //  存完直接跳回 /member
  };

  return (
    <main className="h-full flex bg-gray-50 text-gray-800 justify-around">
      {/* Sidebar */}
      <div className="mt-16">
        <Sidebar />
      </div>

      <section className="flex p-10 w-[70%] mr-16">
        {/* 外層大白色容器 */}
        <div className="bg-white rounded-2xl py-8 px-[50px] flex flex-col space-y-6 relative w-full">
          {/* 標題 */}
          <h1 className="text-2xl font-bold text-primary-blue0">
            編輯會員資料
          </h1>

          {/* 灰色分隔線 */}
          <div className="border-t border-gray-200" />

          {/* 內層小白色卡片 */}
          <div className="bg-white rounded-2xl shadow-md p-8 w-full space-y-6">

            {/* 姓名 */}
            <div className="flex items-center space-x-6">
              <label htmlFor="name" className="text-sm font-semibold">姓名</label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm shadow-sm"
              />
            </div>

            {/* 性別 */}
            <div className="flex items-center space-x-6">
              <label htmlFor="gender" className="text-sm font-semibold">性別</label>
              <input
                type="text"
                value={gender}
                disabled
                className="flex-1 bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm shadow-sm text-gray-400"
              />
            </div>

            {/* 帳號 */}
            <div className="flex items-center space-x-6">
              <label htmlFor="email" className="text-sm font-semibold">帳號</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled
                className="flex-1 bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm shadow-sm text-gray-400"
              />
            </div>
            {/* 密碼 */}
            <div className="flex items-center space-x-6">
              <label htmlFor="password" className="text-sm font-semibold">密碼</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 bg-gray-100 border border-gray-300 rounded-lg p-3 text-sm shadow-sm"
              />
            </div>

            {/* 儲存按鈕 */}
            <div className="flex justify-end">
              <button
                onClick={handleSave}
                className="mt-6 px-6 py-2 bg-primary-blue2 text-white font-bold border rounded-lg hover:bg-primary-blue4 flex items-center space-x-2"
              >
                <SaveIcon />
                <span>儲存</span>
              </button>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
