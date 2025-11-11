"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/src/database/firebaseClient";
import { onAuthStateChanged } from "firebase/auth";
import ProjectCard from "./ProjectCard";
import Link from "next/link";
import Loading from "@/components/Loading";

// 此為測試資料，串資料庫後更換
// import { projects } from "@/src/data/projectTest";

export default function ProjectList() {
  const [launchProjects, setLaunchProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // unsubscribe是取消監聽，避免一直重複檢查
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        console.log("目前沒登入");
        router.push("/login");
        return;
      }

      const token = await user.getIdToken();
      const res = await fetch(`/api/launchProjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      // 檢查資料內容
      console.log("讀到", data);
      setLaunchProjects(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 判斷發起人是否有專案，大於0顯示卡片樣式，若數量為0，顯示文字
  const hasProjects = launchProjects && launchProjects.length > 0;

  return (
    <div className="w-full flex justify-evenly">
      {loading ? (
        <div className="text-center text-gray-2 mt-48">
          <Loading />
        </div>
      ) : hasProjects ? (
        //發起人擁有的專案數量卡片
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-12 mt-4">
          {launchProjects.map((project: any, index) => (
            //Link 連結指向發起專案進度頁，範本看/myproject/progress
            <Link
              href={`/myproject/progress/${project.id}`}
              key={project.id || index}
            >
              <ProjectCard
                key={project.id}
                id={project.id}
                imageSrc={project.projectImageUrl}
                category={project.skillTypeName}
                title={project.projectName}
                description={project.projectDescription}
                dateRange={project.dateRange}
                owner={project.ownerName}
              />
            </Link>
          ))}
        </div>
      ) : (
        //尚未發起專案時顯示
        <div className="text-center text-gray-2 mt-48">
          <h3>您目前未發起任何專案</h3>
        </div>
      )}
    </div>
  );
}
