"use client";

import React, { useEffect, useState } from "react";
import ProjectCard from "./ProjectCard";
import { Project } from "../../types/project";
import { fetchProjects } from "@/src/database/projectService";
import Link from "next/link";
import { Pagination } from "@heroui/react"; // HeroUI 元件

export default function ProjectList() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 分頁狀態
  const [currentPage, setCurrentPage] = useState(1);
  const projectsPerPage = 6;

  useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await fetchProjects();
        setProjects(projectsData);
      } catch (err: any) {
        console.error("Error fetching projects:", err);
        setError(err.message || "讀取資料失敗");
      } finally {
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const totalPages = Math.ceil(projects.length / projectsPerPage);
  const startIndex = (currentPage - 1) * projectsPerPage;
  const currentProjects = projects.slice(
    startIndex,
    startIndex + projectsPerPage
  );

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center min-h-[200px]">
        <div className="text-center text-gray-500">載入中...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full flex justify-center items-center min-h-[200px]">
        <div className="text-center text-red-500">{error}</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="w-full flex justify-center items-center min-h-[200px]">
        <div className="text-center text-gray-500">目前沒有專案</div>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-center">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 mt-4">
        {currentProjects.map((project) => (
          <Link href={`/projects/${project.id}`} key={project.id}>
            <ProjectCard
              id={project.id}
              imageSrc={project.imageSrc}
              category={project.skillTypeName}
              title={project.title}
              description={project.description}
              dateRange={project.dateRange}
              owner={project.owner}
            />
          </Link>
        ))}
      </div>

      {/* 分頁器 */}
      <div className="mt-10">
        <Pagination
          showControls
          total={totalPages}
          page={currentPage}
          onChange={(page) => setCurrentPage(page)}
          className="mb-2"
        />
      </div>
    </div>
  );
}
