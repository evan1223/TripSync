import { useState } from "react";
import AcceptButton from "@/components/ActionButtons/AcceptButton";
import RejectButton from "@/components/ActionButtons/RejectButton";
import { IconUserCircle } from "@tabler/icons-react";
import Image from "next/image";

import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import firebaseApp from "@/lib/firebaseClient"; // 確保這是你的 Firebase client 初始化位置

export default function ProgressUserCard({
  id,
  projectId,
  name,
  bio,
  avatarUrl,
  onAccept,
  onReject,
  completed,
  decision,
}: {
  id: string;
  projectId: string;
  name: string;
  bio: string;
  avatarUrl: string | null;
  onAccept: () => void;
  onReject: () => void;
  completed: boolean;
  decision: "accept" | "reject" | null;
}) {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStatusUpdate = async (status: "accepted" | "rejected") => {
    if (isUpdating) return;

    setIsUpdating(true);
    try {
      const db = getFirestore(firebaseApp);
      const auth = getAuth(firebaseApp);
      const user = auth.currentUser;

      if (!user) {
        throw new Error("使用者尚未登入");
      }

      console.log("目前登入的 UID:", user.uid);
      console.log("正在更新申請狀態:", { applicationId: id, projectId, status });

      const appRef = doc(db, "applications", id);
      const appSnap = await getDoc(appRef);

      if (!appSnap.exists()) {
        throw new Error("找不到申請文件");
      }

      await updateDoc(appRef, {
        applicationStatus: status,
      });

      if (status === "accepted") {
        onAccept();
      } else {
        onReject();
      }
    } catch (error) {
      console.error("更新狀態失敗:", error);
      alert(
        `更新狀態時發生錯誤：${
          error instanceof Error ? error.message : "未知錯誤"
        }`
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const getImageUrl = (url: string | null) => {
    if (!url) return null;
    if (url.includes("firebasestorage.googleapis.com")) {
      return url.includes("?alt=media") ? url : `${url}?alt=media`;
    }
    return url;
  };

  const processedAvatarUrl = getImageUrl(avatarUrl);

  return (
    <div className="bg-gray-4 shadow rounded p-6 flex gap-6 items-start">
      {processedAvatarUrl ? (
        <div className="w-12 h-12 rounded-full overflow-hidden">
          <Image
            src={processedAvatarUrl}
            alt={`${name} 的頭像`}
            width={48}
            height={48}
            className="w-full h-full object-cover"
            unoptimized
          />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-full bg-primary-blue5 flex items-center justify-center">
          <IconUserCircle
            className="w-8 h-8 text-primary-blue3 stroke-[1.5px]"
            aria-label="預設頭像"
          />
        </div>
      )}
      <div className="flex-1">
        <div className="text-primary-blue0 text-xl">{name}</div>
        <div className="w-full h-[1px] bg-gray-300 my-2" />
        <p className="text-sm text-black mt-1">
          {bio || "這位使用者尚未撰寫自我介紹。"}
        </p>
      </div>

      <div className="flex flex-col items-end justify-start gap-2 mt-1">
        <div className="flex flex-col gap-2 mt-2">
          <AcceptButton
            onConfirm={() => handleStatusUpdate("accepted")}
            disabled={completed || decision !== null || isUpdating}
            active={decision === "accept"}
          />

          <RejectButton
            onConfirm={() => handleStatusUpdate("rejected")}
            disabled={completed || decision !== null || isUpdating}
            active={decision === "reject"}
          />
        </div>
      </div>
    </div>
  );
}
