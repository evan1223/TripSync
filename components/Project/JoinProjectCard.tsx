"use client";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import Image, { StaticImageData } from "next/image";
import projectImage from "@/public/project/project-image.jpg";

type JoinProjectCardProps = {
  id: string;
  imageSrc: string | StaticImageData;
  title: string;
  appliedAt: Date;
  applicationStatus: string;
};

export default function JoinProjectCard({
  id,
  imageSrc,
  title,
  appliedAt,
  applicationStatus,
}: JoinProjectCardProps) {
  // 日期顯示格式
  const formattedDate = new Date(appliedAt).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Taipei"
  });

  // 自訂顏色樣式
  const statusClass = {
    等待回覆: "bg-primary-blue5 text-primary-blue2 rounded-xl",
    媒合成功: "bg-[#E8FAF0] text-[#31C471] rounded-xl",
    媒合失敗: "bg-[#FFEDED] text-[#FF5B5B] rounded-xl",
  };

  const statusMap: Record<string, { label: string; className: string }> = {
    accepted: {
      label: "媒合成功",
      className: "bg-[#E8FAF0] text-[#31C471] rounded-xl",
    },
    waiting: {
      label: "等待回覆",
      className: "bg-primary-blue5 text-primary-blue2 rounded-xl",
    },
    rejected: {
      label: "媒合失敗",
      className: "bg-[#FFEDED] text-[#FF5B5B] rounded-xl",
    },
  };
  const status = statusMap[applicationStatus] || statusMap.waiting;

  return (
    <Card className="max-w-[300px] flex hover:shadow-xl transition-shadow cursor-pointer shadow-md p-3">
      <Image
        src={imageSrc}
        alt={title}
        className="rounded-md w-full object-cover h-48"
        width={300}
        height={192}
        unoptimized
      />

      <CardHeader className="pb-0">
        <h3 className="font-semibold text-lg">{title}</h3>
      </CardHeader>
      <div className="grid md:grid-cols-3 grid-cols-1">
        <CardFooter className="text-xs text-gray-400 flex mt-2 col-span-2">
          <span>申請日期：</span>
          <span>{formattedDate}</span>
        </CardFooter>
        <CardBody className="pb-0 justify-center items-start md:items-end mx-2">
          <Chip
            className={`px-2 py-1 text-xs font-medium ${status.className}`}
            variant="flat"
          >
            {status.label}
          </Chip>
        </CardBody>
      </div>
    </Card>
  );
}
