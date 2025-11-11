"use client";

import React from "react";
import JoinProjectCard from "./JoinProjectCard";
import Link from "next/link";


// 此為測試資料，串資料庫後更換
import { projects } from "@/src/data/joinProjectTest";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/src/database/firebaseClient"; // Firebase client SDK
import { onAuthStateChanged } from "firebase/auth";
import Loading from "@/components/Loading"

export default function JoinProjectList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {

      if (!user) {
        router.push("/login");
        return;
      }
      const token = await user.getIdToken();

      const res = await fetch(`/api/joinProjects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      setProjects(data);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const hasProjects = projects.length > 0;

  return (
    <div className="w-full flex justify-evenly">
      {loading ? (
        <div className="text-center text-gray-2 mt-48">
          <Loading />
        </div>
      ) : hasProjects ? (
        //發起人加入的專案數量卡片
        <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-1 lg:grid-cols-2 gap-12 mt-4">
          {projects.map((project: any, index) => (
            //Link 連結指向專案的呈現頁
            <Link href={`/projects/${project.id}`} key={project.id || index}>
              <JoinProjectCard
                id={project.id}
                imageSrc={project.projectImageUrl}
                title={project.projectName}
                appliedAt={new Date(project.appliedAt)}
                applicationStatus={project.applicationStatus}
              />
            </Link>
          ))}
        </div>
      ) : (
        //尚未發起專案時顯示
        <div className="text-center text-gray-2 mt-48">
          <h3>您目前未加入任何專案</h3>
        </div>
      )}
    </div>
  );
}
