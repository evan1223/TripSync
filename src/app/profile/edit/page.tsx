"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { onAuthStateChange, getCurrentUser } from "@/src/database/auth";
import {
  getUserProfile,
  updateUserProfile,
  uploadUserAvatar,
} from "@/src/database/userService";

import {
  UserCircleIcon,
  MailIcon,
  MessageChatbotIcon,
  WorldIcon,
  SaveIcon,
  UploadIcon,
} from "@/components/icons";

export default function EditProfilePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");
  const [socialMedia, setSocialMedia] = useState("");
  const [userCommunity, setUserCommunity] = useState("");
  const [user_pf_url, setUserPfUrl] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (user) => {
      if (!user) {
        router.push("/login");
        return;
      }

      setName(user.displayName || "");
      setEmail(user.email || "");

      const profileData = await getUserProfile(user.uid);
      if (profileData) {
        setBio(profileData.bio || "");
        setSocialMedia(profileData.socialMedia || "");
        setUserCommunity(profileData.userCommunity || "");
        setUserPfUrl(profileData.user_pf_url || "");
        setPreview(profileData.avatar || null);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("檔案太大了，請選擇小於 5MB 的圖片");
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
      setIsModalOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const user = await getCurrentUser();
    if (!user) {
      alert("請先登入");
      return;
    }

    try {
      let avatarUrl = preview;
      if (imageFile) {
        try {
          console.log("開始上傳圖片...", imageFile);
          avatarUrl = await uploadUserAvatar(imageFile);
          console.log("新頭像已上傳，URL:", avatarUrl);
        } catch (error) {
          console.error("圖片上傳失敗:", error);
          alert("圖片上傳失敗，請稍後再試");
          return;
        }
      }

      console.log("準備更新用戶資料，頭像URL:", avatarUrl);
      await updateUserProfile(user.uid, {
        bio,
        socialMedia,
        userCommunity,
        user_pf_url,
        profilePicUrl: avatarUrl || undefined,
      });
      console.log("用戶資料更新成功");

      alert("個人資料儲存成功！");
      router.push("/profile");
    } catch (error) {
      console.error("資料更新失敗:", error);
      alert("個人資料儲存失敗，請稍後再試");
    }
  };

  return (
    <main className="h-full flex bg-gray-50 text-gray-800 justify-around">
      <div className="mt-16">
        <Sidebar />
      </div>

      <section className="flex p-10 w-[70%] mr-16">
        {/* 外層大白色區塊 */}
        <div className=" bg-white rounded-2xl py-8 px-[50px] flex flex-col space-y-6 relative w-full">
          <h1 className="text-2xl font-bold text-primary-blue0">個人名片</h1>
          <div className="border-t border-gray-200" />

          <div className="bg-white rounded-2xl px-[50px] shadow-md p-8 space-y-10">
            <div className="flex space-x-2">
              <div className="flex flex-col items-center space-y-10 w-1/3">
                <div className="w-24 h-24 rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                  {preview ? (
                    <img
                      src={preview}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserCircleIcon />
                  )}
                </div>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="text-primary-blue2 bg-blue-100 text-sm font-bold px-3 py-1 rounded-lg hover:bg-primary-blue4"
                >
                  更換頭像
                </button>
              </div>

              <div className="flex-1 flex flex-col space-y-5">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-gray-4 text-gray-1 border shadow-sm rounded-lg px-4 py-3 text-sm"
                  disabled
                />

                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full bg-gray-4 border shadow-sm rounded-lg px-4 py-3 text-sm h-32 resize-none"
                />

                <div className="flex items-center space-x-4">
                  <MailIcon />
                  <input
                    type="email"
                    value={email}
                    className="flex-1 bg-gray-4 border shadow-sm rounded-lg px-4 py-3 text-sm"
                    disabled
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <MessageChatbotIcon />
                  <input
                    type="text"
                    value={userCommunity}
                    onChange={(e) => setUserCommunity(e.target.value)}
                    className="flex-1 bg-gray-4 border shadow-sm rounded-lg px-4 py-3 text-sm"
                    placeholder="社群"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <WorldIcon />
                  <input
                    type="text"
                    value={user_pf_url}
                    onChange={(e) => setUserPfUrl(e.target.value)}
                    className="flex-1 bg-gray-4 border shadow-sm rounded-lg px-4 py-3 text-sm"
                    placeholder="作品連結"
                  />
                </div>
              </div>
            </div>
          </div>

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
      </section>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white rounded-2xl p-8 w-96 space-y-6">
            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full border border-[#A9ACB4] flex items-center justify-center">
                  <UploadIcon />
                </div>
                <h2 className="text-xl font-bold">上傳圖片</h2>
              </div>
              <div className="border-t border-54575C w-full my-4" />
            </div>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center space-y-4">
              <UploadIcon />
              <h2 className="text-xl font-bold">上傳圖片</h2>
              <p className="text-gray-500 text-sm">
                JPEG, PNG format, up to 5MB
              </p>

              <input
                type="file"
                accept="image/jpeg, image/png"
                onChange={handleFileChange}
                className="hidden"
                id="upload"
              />
              <label
                htmlFor="upload"
                className="cursor-pointer px-4 py-2 border border-54575C text-54575C rounded-lg hover:bg-blue-50"
              >
                選擇圖片
              </label>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
