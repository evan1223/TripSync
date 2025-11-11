"use client";
import { Card, CardBody, CardFooter, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";
import Image from "next/image";
import Link from "next/link";
import { Calendar, User } from "@/components/icons";

type ProjectCardProps = {
  id: string;
  imageSrc: string;
  category: string[];
  title: string;
  description: string;
  dateRange: string;
  owner: string;
};

export default function ProjectCard({
  id,
  imageSrc,
  category,
  title,
  description,
  dateRange,
  owner,
}: ProjectCardProps) {
  return (
    <Card className="w-[300px] hover:shadow-xl transition-shadow cursor-pointer shadow-md p-3">
      <div className="relative w-full h-48 mb-4 ">
        <Image
          src={imageSrc}
          alt={title}
          fill
          unoptimized
          className="rounded-md object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
      </div>
      <CardBody className="pb-0 ">
        <div className="flex gap-2 flex-wrap">
          {category.map((skill, index) => (
            <span
              key={index}
              className="bg-primary-blue3 text-white text-xs font-medium gap-2 px-2.5 py-1 rounded"
            >
              {skill}
            </span>
          ))}
        </div>
      </CardBody>
      <CardHeader className="pb-0">
        <h3 className="font-semibold text-lg">{title}</h3>
      </CardHeader>
      <CardBody>
        <p className="text-sm text-gray-600 min-h-[40px]">{description}</p>
      </CardBody>
      <CardFooter className="text-xs text-gray-400 flex justify-between">
        <div className="flex justify-center items-center">
          <Calendar />
          {dateRange}
        </div>
        <div className="flex justify-center items-center">
          <User />
          {owner}
        </div>
      </CardFooter>
    </Card>
  );
}
