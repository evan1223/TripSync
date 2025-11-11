"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";

export default function SignUp() {
  const router = useRouter();

  //判斷輸入框是否被輸入
  const [nickname, setNickname] = useState("");
  const [userCommunity, setUserCommunity] = useState("");
  const [bio, setBio] = useState("");
  const [userPfUrl, setUserPfUrl] = useState("");
  const [isFormValid, setIsFormValid] = useState(false);

  const [isOpen, setIsOpen] = useState(false);

  // 表單驗證：只要全部欄位都有填，就啟用按鈕
  useEffect(() => {
    setIsFormValid(
      nickname.trim() !== "" &&
        userCommunity.trim() !== "" &&
        bio.trim() !== "" &&
        userPfUrl.trim() !== ""
    );
  }, [nickname, userCommunity, bio, userPfUrl]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const uid = localStorage.getItem("uid");
    const payload = {
      uid,
      nickname,
      userCommunity,
      bio,
      user_pf_url: userPfUrl,
    };

    try {
      const res = await fetch("/api/signup/step2", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        setIsOpen(true);
      } else {
        const data = await res.json();
        alert(data.error || "Registration failed. Please check your input.");
      }
    } catch (err) {
      console.error(err);
      alert("Network error. Please try again later.");
    }
  };

  return (
    <div className="flex h-screen">
      <div className="relative w-1/2 h-full">
        <Image
          src="/loginImage.png"
          alt="Login Illustration"
          fill
          className="object-cover"
        />
      </div>

      <div className="w-1/2 flex items-center justify-center min-h-screen">
        <div className="p-8 rounded w-3/4">
          <h2 className="text-2xl mb-3 text-primary-blue0 font-medium">
            Step2 填寫簡介資訊
          </h2>

          <div className="flex w-full items-center mb-6">
            <hr className="w-full border-t-4 border-primary-blue2" />
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-4 flex items-center">
              <label htmlFor="nickname" className="w-20">
                暱稱
              </label>
              <input
                type="text"
                id="nickname"
                name="nickname"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-4 bg-gray-4 px-3 py-2 shadow-sm"
                placeholder="顯示公開名稱"
              />
            </div>

            <div className="mb-4 flex items-center">
              <label htmlFor="userCommunity" className="w-20">
                社群
              </label>
              <input
                type="url"
                id="userCommunity"
                name="userCommunity"
                value={userCommunity}
                onChange={(e) => setUserCommunity(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-4 bg-gray-4 px-3 py-2 shadow-sm"
                placeholder="請貼上社群連結 https://"
              />
            </div>

            <div className="mb-4 flex items-center">
              <label htmlFor="bio" className="w-20">
                簡介
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-4 bg-gray-4 px-3 py-2 shadow-sm"
                placeholder="字數限 200 字以內"
              />
            </div>

            <div className="mb-6 flex items-center">
              <label htmlFor="user_pf_url" className="w-20">
                作品
                <br />
                連結
              </label>
              <input
                type="url"
                id="user_pf_url"
                name="user_pf_url"
                value={userPfUrl}
                onChange={(e) => setUserPfUrl(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-4 bg-gray-4 px-3 py-2 shadow-sm"
                placeholder="請貼上作品連結 https://"
              />
            </div>

            <div className="flex justify-center items-center gap-4 pt-6">
              <button
                type="submit"
                disabled={!isFormValid}
                className={`w-1/2 text-center py-2 rounded-lg text-white transition ${
                  isFormValid
                    ? "bg-primary-blue2 hover:bg-primary-blue1"
                    : "bg-gray-3 cursor-not-allowed"
                }`}
              >
                立即註冊
              </button>
            </div>
          </form>

          <Modal isOpen={isOpen} onOpenChange={setIsOpen} className="w-1/4">
            <ModalContent className="flex items-center">
              <ModalHeader>
                <h2 className="text-2xl text-primary-blue1 mt-6 mb-3">
                  已完成註冊！
                </h2>
              </ModalHeader>
              <ModalBody>
                <p className="mt-3 mb-3">將返回重新登入</p>
              </ModalBody>
              <ModalFooter>
                <Button
                  className="text-white bg-primary-blue2 mt-3 mb-6"
                  onClick={() => {
                    setIsOpen(false);
                    router.push("/login");
                  }}
                >
                  返回登入
                </Button>
              </ModalFooter>
            </ModalContent>
          </Modal>
        </div>
      </div>
    </div>
  );
}
