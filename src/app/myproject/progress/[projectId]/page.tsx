"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";

import Sidebar from '@/components/Sidebar';
import ProjectCard from '@/components/Project/ProjectCard';
import { useRouter } from "next/navigation";


import ProgressStats from "@/components/Project/ProgressStats";
import ProgressUserCard from "@/components/Project/ProgressUserCard";

import EditButton from "@/components/ActionButtons/EditButton";
import { IconChevronLeft } from "@tabler/icons-react";
import DeleteProjectButton from "@/components/ActionButtons/DeleteProjectButton";
import CompleteProjectButton from "@/components/ActionButtons/CompleteProjectButton";


export default function ProjectProgressPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params?.projectId;

  const [project, setProject] = useState<any>(null);
  const [completed, setCompleted] = useState(false);
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  type Decision = "accept" | "reject" | null;

  type Applicant = {
    id: string;
    name: string;
    userBio: string;
    userAvatar: string | null;
    decision: Decision;
  };

  const handleEdit = () => {
    if (projectId) router.push(`/projects/${projectId}/edit`);
  };

  const [applicants, setApplicants] = useState<Applicant[]>([]);


  useEffect(() => {
    if (!projectId) return;
    // 取得計畫資料
    fetch(`/api/projects/${projectId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          console.log("project data", data.data);
          setProject(data.data);
          if (data.data.status === "closed") {
            setCompleted(true);
          }
        }
      });
    // 取得申請資料
    fetch(`/api/projects/${projectId}/applications`)
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) {
          setApplicants(
            data.data.map((app: any) => ({
              id: app.id,
              name: app.userName || app.name || "",
              userBio: app.userBio || "",
              userAvatar: app.userAvatar || null,
              decision:
                app.applicationStatus === "accepted"
                  ? "accept"
                  : app.applicationStatus === "rejected"
                    ? "reject"
                    : null,
            }))
          );
          setAcceptedCount(data.data.filter((app: any) => app.applicationStatus === "accepted").length);
          setRejectedCount(data.data.filter((app: any) => app.applicationStatus === "rejected").length);
        }
      });
  }, [projectId]);

  const totalCount = applicants.length;
  return (
    <main className="h-full w-full flex flex-col sm:flex-row bg-gray-50 text-gray-800 sm:justify-around">

      {/* Sidebar：左側導覽 */}
      <div className="mt-16">
        <Sidebar />
      </div>
      {/* Main Content */}
      <section className="flex ml-5 sm:ml-0 pt-10 w-[70%] mr-16 min-w-[340px]">
        <div className="w-full relative bg-white rounded-2xl p-5  flex flex-col sm:w-[550px] md:w-[650px] lg:w-[900px]">
          {/* 🔝 上面一行：返回、標題、按鈕 */}
          <div className="flex items-center justify-between">
            {/* 左：返回 + 標題 */}
            <div className="flex items-center gap-2 p-2">
              <IconChevronLeft
                stroke={2}
                className="w-6 h-6 text-primary-blue0 cursor-pointer"
                onClick={() => router.push('/myproject')}
              />
              <div className="text-2xl font-bold text-primary-blue0 w-[100px]">計畫進度</div>
            </div>

            {/* 右：按鈕們 */}
            <div className="flex items-center gap-4 mt-5">
              <DeleteProjectButton
                onDelete={async () => {
                  if (!projectId) return;

                  const res = await fetch(`/api/projects/${projectId}`, {
                    method: "DELETE",
                  });

                  const data = await res.json();

                  if (data.success) {
                    router.push("/myproject");
                  } else {
                    alert("刪除失敗：" + (data.error || "未知錯誤"));
                  }
                }}
                disabled={completed}
              />
              <CompleteProjectButton
                onComplete={async () => {
                  if (!projectId) return;

                  try {
                    const res = await fetch(`/api/projects/${projectId}/status`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ manual: true })
                    });
                    const json = await res.json();

                    if (json.success) {
                      //alert("計畫已成功結案！"); 再確認要不要alert
                      setCompleted(true);
                      //router.push("/myproject"); 再確認要不要跳頁
                    } else {
                      alert("結案失敗：" + (json.error || "未知錯誤"));
                    }
                  } catch (err: any) {
                    alert("發生錯誤：" + (err.message || "請稍後再試"));
                  }
                }}
                disabled={completed}
              />

            </div>
          </div>
          {/* 🔻 底下主要內容：橫排兩塊 */}
          <div className="flex flex-col lg:flex-row gap-10 w-full mt-10 ">
            {/* 左邊：計畫卡片 */}
            <div className="w-[35%] min-w-[260px] flex flex-col space-y-4">
              {project && (() => {
                let dateRange = "";
                if (project.startDate && project.endDate && project.startDate._seconds && project.endDate._seconds) {
                  const startDate = new Date(project.startDate._seconds * 1000);
                  const endDate = new Date(project.endDate._seconds * 1000);
                  const format = (d: Date) => `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`;
                  dateRange = `${format(startDate)} - ${format(endDate)}`;
                } else if (project.dateRange) {
                  dateRange = project.dateRange;
                }
                return (
                  <ProjectCard
                    id={project.id}
                    imageSrc={project.projectImageUrl}
                    title={project.projectName}
                    category={project.skillTypeName || []}
                    description={project.projectDescription || ""}
                    dateRange={dateRange}
                    owner={project.ownerName || ""}
                  />
                );
              })()}
              <div className="flex justify-center">
                {project && (project.status === "closed" ) ? null : (
                  <EditButton onPress={handleEdit} />
                )}
              </div>
            </div>

            {/* 右邊：進度區塊 */}
            <div className="flex-1 space-y-4 ml-2">
              <ProgressStats
                total={totalCount}
                accepted={acceptedCount}
                rejected={rejectedCount}
              />

              <div className="space-y-4">
                {applicants.map((applicant, idx) => (
                  <ProgressUserCard
                    key={idx}
                    id={applicant.id}
                    projectId={projectId as string}
                    name={applicant.name}
                    bio={applicant.userBio}
                    avatarUrl={applicant.userAvatar}
                    completed={completed}
                    decision={applicant.decision}
                    onAccept={() => {
                      if (applicant.decision === null) {
                        setAcceptedCount((prev) => prev + 1);
                        setApplicants((prev) =>
                          prev.map((a, i) =>
                            i === idx ? { ...a, decision: "accept" } : a
                          )
                        );
                      }
                    }}
                    onReject={() => {
                      if (applicant.decision === null) {
                        setRejectedCount((prev) => prev + 1);
                        setApplicants((prev) =>
                          prev.map((a, i) =>
                            i === idx ? { ...a, decision: "reject" } : a
                          )
                        );
                      }
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
