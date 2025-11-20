"use client";
import AlertMessage from "@/components/AlertMessage";
import Info from "@/components/AddProjectInfo/Info";
import Tag from "@/components/AddProjectInfo/Tag";
import { CloseIcon, JoinIcon } from "@/components/icons";
import { Button } from "@heroui/react";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import { auth } from "@/src/database/firebaseClient";

type BudgetItem = {
  label: string;
  amount: string;
};

interface ProjectData {
  projectName: string;
  projectDescription: string;
  startDate: any;
  endDate: any;
  projectTypeName: string;     // 原始字串，例如 "台灣/新竹"
  locations?: string[];        // 後端存的旅行地點陣列（可選）
  skillTypeNames: string[];
  skillDescription: string;
  peopleRequired: number | string;
  projectImageUrl?: string;
  ownerName?: string;
  ownerEmail?: string;
  ownerId?: string;
  status?: string;
  budgetItems?: BudgetItem[];  // ✅ 新增：個人預算細項
}

// 日期格式化函數
const formatDate = (date: any): string => {
  if (!date) return "未提供";
  if (typeof date._seconds === "number") {
    return new Date(date._seconds * 1000).toLocaleDateString();
  }
  if (typeof date.seconds === "number") {
    return new Date(date.seconds * 1000).toLocaleDateString();
  }
  if (date instanceof Date) {
    return date.toLocaleDateString();
  }
  if (typeof date === "string") {
    const parsedDate = new Date(date);
    if (!isNaN(parsedDate.getTime())) {
      return parsedDate.toLocaleDateString();
    }
  }
  console.warn("Unsupported date format:", date);
  return "日期格式錯誤";
};

export default function ProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;

  const [projectData, setProjectData] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isClosed, setIsClosed] = useState(false);

  const [showAlert, setShowAlert] = useState(false);
  const [needLoginAlert, setNeedLoginAlert] = useState(false);
  const [join, setJoin] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const router = useRouter();

  const handleJoinClick = async () => {
    try {
      const res = await fetch("/api/session", {
        method: "GET",
      });

      if (!res.ok) {
        setNeedLoginAlert(true);
      } else {
        setShowAlert(true);
      }
    } catch (err) {
      console.error("檢查登入時發生錯誤", err);
    }
  };

  const handleCancel = () => {
    setShowAlert(false);
  };

  const handelConfirm = async () => {
    setShowAlert(false);

    try {
      const token = await auth.currentUser?.getIdToken();
      const res = await fetch(`/api/projects/${projectId}/join`, {
        method: "POST",
        headers: {
          Authorization: token ? `Bearer ${token}` : "",
        },
      });

      const data = await res.json();

      if (data.success) {
        setJoin(true);
      } else {
        setError(data.error || "加入計畫失敗");
      }
    } catch (err) {
      console.error("加入計畫失敗：", err);
      setError("加入計畫時發生錯誤");
    }
  };

  useEffect(() => {
    if (projectId) {
      setLoading(true);
      setError(null);
      fetch(`/api/projects/${projectId}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (data.success && data.data) {
            const d = data.data as ProjectData & {
              locations?: string[];
              budgetItems?: BudgetItem[];
            };

            // 旅行地點：優先用後端的 locations，沒有再用字串拆
            const locations =
              Array.isArray(d.locations) && d.locations.length > 0
                ? d.locations
                : (d.projectTypeName || "")
                    .split("/")
                    .map((loc) => loc.trim())
                    .filter((loc) => loc.length > 0);

            const merged: ProjectData = {
              ...d,
              locations,
              budgetItems: Array.isArray(d.budgetItems) ? d.budgetItems : [],
            };

            setProjectData(merged);

            // 判斷是否結案
            if (d.status === "closed" || d.status === "close") {
              setIsClosed(true);
            } else {
              setIsClosed(false);
            }
          } else {
            throw new Error(data.error || "無法獲取計畫資料");
          }
        })
        .catch((err) => {
          console.error("獲取計畫資料失敗:", err);
          setError(err.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }

    // 取得目前登入者 id
    fetch("/api/session")
      .then((res) => res.json())
      .then((data) => {
        if (data && (data.uid || (data.user && data.user.uid))) {
          setCurrentUserId(data.uid || data.user.uid);
        }
      })
      .catch(() => setCurrentUserId(null));
  }, [projectId]);

  // 檢查是否已申請過該計畫
  useEffect(() => {
    if (projectId && currentUserId) {
      fetch(`/api/projects/${projectId}/applications`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data)) {
            const hasApplied = data.data.some(
              (app: any) => app.userId === currentUserId
            );
            if (hasApplied) setJoin(true);
          }
        })
        .catch(() => {});
    }
  }, [projectId, currentUserId]);

  // ✅ 個人總預算（跟 preview page 一致的邏輯）
  const totalBudget = useMemo(() => {
    if (!projectData?.budgetItems || projectData.budgetItems.length === 0) {
      return 0;
    }
    return projectData.budgetItems.reduce((sum, item) => {
      const n = Number(item.amount);
      if (!Number.isFinite(n) || n < 0) return sum;
      return sum + n;
    }, 0);
  }, [projectData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        載入中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen text-red-500">
        錯誤: {error}
      </div>
    );
  }

  if (!projectData) {
    return (
      <div className="flex justify-center items-center h-screen">
        找不到計畫資料。
      </div>
    );
  }

  return (
    <div className="h-full w-full flex bg-gray-50 text-gray-800 justify-center">
      <section className="flex sm:ml-0 pt-10 w-[80%] min-w-[380px] justify-center">
        <div className="w-full relative bg-white rounded-2xl p-2 flex flex-col sm:w-[550px] md:w-[600px] lg:w-[900px] mb-5">
          {/* 申請媒合確認彈窗 */}
          {showAlert && (
            <div className="absolute z-50 inset-0 flex justify-center items-center">
              <AlertMessage
                onCancel={handleCancel}
                onConfirm={handelConfirm}
                title="確定要申請媒合嗎？"
                cancel="取消"
                action="媒合"
                cancelIcon={<CloseIcon />}
                confirmIcon={<JoinIcon />}
              />
            </div>
          )}

          {/* 需要登入提示彈窗 */}
          {needLoginAlert && (
            <div className="absolute z-50 inset-0 flex justify-center items-center">
              <AlertMessage
                onCancel={() => setNeedLoginAlert(false)}
                onConfirm={() => {
                  setNeedLoginAlert(false);
                  router.push("/login");
                }}
                title="此功能需要登入，是否前往登入頁？"
                cancel="取消"
                action="前往登入"
                cancelIcon={<CloseIcon />}
                confirmIcon={<JoinIcon />}
              />
            </div>
          )}

          <div className="flex flex-col lg:flex-row justify-center p-5">
            {/* 左側：圖片 + 加入媒合按鈕 */}
            <div className="flex flex-col mt-10 items-center">
              <div className="relative overflow-hidden bg-primary-blue5 w-[300px] h-[200px] rounded-2xl flex justify-center items-center">
                <Image
                  src={
                    projectData.projectImageUrl || "/project/project-image.jpg"
                  }
                  width={300}
                  height={200}
                  alt={projectData.projectName || "計畫圖片"}
                  className="absolute top-0 left-0 w-full h-full rounded-2xl object-cover"
                  unoptimized
                />
              </div>

              {/* 只有非計畫擁有者才顯示加入媒合按鈕，且計畫未結案才可按 */}
              {currentUserId && projectData.ownerId === currentUserId ? null : join ? (
                <Button
                  isDisabled
                  className="bg-primary-blue2/20 text-white text-lg mt-8"
                  startContent={<JoinIcon />}
                >
                  已加入媒合
                </Button>
              ) : (
                <Button
                  onPress={handleJoinClick}
                  className="bg-primary-blue2 text-white text-lg mt-8"
                  startContent={<JoinIcon />}
                  isDisabled={isClosed}
                >
                  加入媒合
                </Button>
              )}
            </div>

            {/* 右側：資訊區（跟 preview page 版型一致） */}
            <div className="flex flex-col justify-start items-start sm:ml-20 mt-10 w-[400px]">
              <Info
                label="旅遊計畫"
                content={projectData.projectName ?? ""}
              />
              <Info
                label="計畫說明"
                content={projectData.projectDescription ?? ""}
              />
              <Info
                label="計畫時間"
                content={
                  projectData.startDate && projectData.endDate
                    ? `${formatDate(projectData.startDate)} - ${formatDate(
                        projectData.endDate
                      )}`
                    : "-"
                }
              />

              {/* 旅行地點（多個 tag） */}
              <Tag
                label="旅行地點"
                content={
                  Array.isArray(projectData.locations)
                    ? projectData.locations
                    : projectData.projectTypeName
                    ? projectData.projectTypeName
                        .split("/")
                        .map((loc) => loc.trim())
                        .filter((loc) => loc.length > 0)
                    : []
                }
              />

              {/* 技能需求 tag 列表 */}
              <Tag
                label="技能需求"
                content={
                  Array.isArray(projectData.skillTypeNames)
                    ? projectData.skillTypeNames
                    : []
                }
              />

              <Info
                label="技能描述"
                content={projectData.skillDescription ?? ""}
              />

              {/* ✅ 個人總預算（有資料且 >0 才顯示） */}
              {totalBudget > 0 && (
                <Info
                  label="總預算"
                  content={`${totalBudget.toLocaleString()}  元 /人`}
                />
              )}

              <Info
                label="人數需求"
                content={
                  projectData.peopleRequired != null
                    ? String(projectData.peopleRequired)
                    : ""
                }
              />
              <Info label="發起人" content={projectData.ownerName ?? ""} />
              <Info
                label="聯繫方式"
                content={projectData.ownerEmail ?? ""}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
