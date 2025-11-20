"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AddressBookIcon,
  UserSearchIcon,
  ProjectIcon,
} from "@/components/icons";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="ml-4 mt-6 p-2 w-14  md:w-[180px] transition-all duration-300">
      <div className="bg-white rounded-2xl shadow-sm p-2 md:p-5 space-y-3 w-full  min-w-[50px]">
        {/* 個人名片 */}
        <Link
          href="/profile"
          className={`group justify-center flex items-center px-2 py-2 rounded-lg font-bold space-x-2 cursor-pointer transition-colors ${
            pathname.startsWith("/profile")
              ? "bg-primary-blue5 text-primary-blue0"
              : "text-gray-400 hover:bg-primary-blue5 hover:text-primary-blue0"
          }`}
        >
          <AddressBookIcon />
          <span className="hidden md:inline group-hover:inline pr-2">
            個人名片
          </span>
        </Link>

        {/* 會員資料 */}
        <Link
          href="/member"
          className={`group justify-center flex items-center px-2 py-2 rounded-lg font-bold space-x-2 cursor-pointer transition-colors ${
            pathname.startsWith("/member")
              ? "bg-primary-blue5 text-primary-blue0"
              : "text-gray-400 hover:bg-primary-blue5 hover:text-primary-blue0"
          }`}
        >
          <UserSearchIcon />
          <span className="hidden md:inline group-hover:inline pr-2">
            會員資料
          </span>
        </Link>

        {/* 我的計畫 */}
        <Link
          href="/myproject"
          className={`group justify-center  flex items-center px-2 py-2 rounded-lg font-bold space-x-2 cursor-pointer transition-colors ${
            pathname.startsWith("/myproject")
              ? "bg-primary-blue5 text-primary-blue0"
              : "text-gray-400 hover:bg-primary-blue5 hover:text-primary-blue0"
          }`}
        >
          <ProjectIcon />
          <span className="hidden md:inline group-hover:inline pr-2">
            我的計畫
          </span>
        </Link>
      </div>
    </aside>
  );
}
