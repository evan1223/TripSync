"use client";

import { useEffect, useState } from "react";
import { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { onAuthStateChange } from "@/src/database/auth";
import { getUserProfile, UserProfile } from "@/src/database/userService";
import {
  UserCircleIcon,
  MailIcon,
  MessageChatbotIcon,
  WorldIcon,
} from "@/components/icons";
import EditButton from "@/components/ActionButtons/EditButton";

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState<UserProfile>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (firebaseUser) => {
      if (!firebaseUser) {
        // 未登入 → 導向 login 頁面
        window.location.href = "/login";
        return;
      }

      setUser(firebaseUser);

      try {
        const profile = await getUserProfile(firebaseUser.uid);
        if (profile) {
          setProfileData(profile);
        }
      } catch (err) {
        console.error("載入個人資料失敗：", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <main className="h-full flex items-center justify-center bg-gray-50 text-gray-800">
        <p className="text-xl">載入中...</p>
      </main>
    );
  }

  return (
    <main className="h-full flex bg-gray-50 text-gray-800 justify-around">
      {/* Sidebar */}
      <div className="mt-16">
        <Sidebar />
      </div>

      {/* Main Profile Card */}
      <section className="flex p-10 w-[70%] mr-16">
        <div className="bg-white rounded-2xl py-8 px-[50px] flex flex-col space-y-6 relative w-full">
          {/* 標題 */}
          <h1 className="text-2xl font-bold text-primary-blue0">個人名片</h1>
          <div className="border-t border-gray-200" />

          <div className="bg-white rounded-2xl shadow-md p-10 flex items-start space-x-6">
            <div className="w-24 h-24 rounded-full bg-primary-blue5 flex items-center justify-center text-4xl text-blue-500 overflow-hidden">
              {profileData.profilePicUrl && typeof profileData.profilePicUrl === "string" ? (
                <img
                  src={profileData.profilePicUrl}
                  alt="User Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <UserCircleIcon />
              )}
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-bold text-primary-blue0">
                {user?.displayName || "未命名使用者"}
              </h2>

              <div className="border-t border-gray-200 my-4" />

              <p className="text-sm text-black leading-relaxed">
                {profileData.bio || "尚未填寫自我介紹"}
              </p>

              <ul className="mt-6 space-y-3 text-sm text-primary-blue3">
                <li className="flex items-center space-x-2">
                  <MailIcon />
                  <span>{user?.email}</span>
                </li>
                {profileData.userCommunity && (
                  <li className="flex items-center space-x-2">
                    <MessageChatbotIcon />
                    <span>{profileData.userCommunity}</span>
                  </li>
                )}
                {profileData.user_pf_url && (
                  <li className="flex items-center space-x-2">
                    <WorldIcon />
                    <a
                      href={profileData.user_pf_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profileData.user_pf_url}
                    </a>
                  </li>
                )}
                {profileData.socialMedia && (
                  <li className="flex items-center space-x-2">
                    <MessageChatbotIcon />
                    <a
                      href={profileData.socialMedia}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {profileData.socialMedia}
                    </a>
                  </li>
                )}
              </ul>
            </div>
          </div>

          <div className="flex justify-end">
             {/* 編輯按鈕 */}
          <div className="flex justify-end">
            <EditButton onPress={() => router.push('/profile/edit')} />
          </div>


          </div>
        </div>
      </section>
    </main>
  );
}
