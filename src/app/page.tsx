"use client";
import ProjectList from "@/components/Project/ProjectList";
import Link from "next/link";
import { Search } from "lucide-react";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/react";
import { AddProjectIcon } from "@/components/icons";

export default function Home() {
  return (
    <div>
      {/* banner */}
      <div className="bg-[radial-gradient(circle_at_bottom,_#A9C4FF,_#FFFFFF)] w-full h-[60vh] flex justify-center items-center flex-col">
        {/* <div className="text-4xl font-bold text-primary-blue1 mx-10 justify-center">
          TeamUp 幫你<span className="text-primary-blue2">找到對的人</span>
          ，做對的事。
        </div> */}
        <div className="text-6xl font-extrabold text-primary-blue1 mx-10 text-center">
          TripSync
        </div>
        <div className="text-3xl font-bold text-primary-blue1 mx-10 text-center mt-4">
          Your journey, <span className="text-primary-blue2">matched smartly.</span>
        </div>

        {/* 之後下面這邊請放搜尋功能 */}
        {/* <div className="relative w-[40%] mt-5">
          <input
            type="text"
            placeholder="搜尋計畫"
            className="w-full bg-white placeholder-gray-400 rounded-lg pl-5 pr-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <button>
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary-blue2 rounded-2xl text-white p-1"
              size={24}
            />
          </button>
        </div> */}
      </div>

      {/* 首頁主要內容 */}
      <div className="w-full min-h-screen flex flex-col rounded-2xl bg-gray-4 justify-center overflow-y pb-5">
        <div className="grid justify-center mx-5">
          {/* <div className="mt-8 text-primary-blue1 text-xl pb-4 font-bold">
            <h2>計畫列表</h2>
            <Divider className="my-2" />
          </div> */}
          <div className="mt-8 text-primary-blue1 text-xl pb-4 font-bold">
            {/* 標題 + 按鈕區塊 */}
            <div className="flex items-center justify-between">
              <h2>計畫列表</h2>

              {/* 發起計畫按鈕 */}
              {/* <Link href="/myproject/new">
                <button className="bg-primary-blue2 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-primary-blue1 transition">
                  發起計畫
                </button>
              </Link> */}
              {/* 新增計畫按鈕 須連結至下一頁 */}
              <div className="flex  justify-end">
                <Link href={"/myproject/new"}>
                  <Button className="bg-primary-blue2 text-white">
                    <AddProjectIcon />
                    發起計畫
                  </Button>
                </Link>
              </div>
            </div>

            <Divider className="my-2" />
          </div>

          {/* 計畫勾選欄，之後請加計畫勾選搜尋功能 */}
          {/* <div className="justify-start flex flex-wrap gap-4">
            <label className="cursor-pointer ">
              <input type="checkbox" className="hidden peer" />
              <div className="bg-white px-4 py-1 border border-gray-1 text-gray-1 rounded-lg shadow-md peer-checked:bg-primary-blue4 peer-checked:text-primary-blue1 peer-checked:border-primary-blue1">
                前端
              </div>
            </label>

            <label className="cursor-pointer">
              <input type="checkbox" className="hidden peer" />
              <div className="bg-white px-4 py-1 border border-gray-1 text-gray-1 rounded-lg shadow-md peer-checked:bg-primary-blue4 peer-checked:text-primary-blue1 peer-checked:border-primary-blue1">
                UIUX
              </div>
            </label>

            <label className="cursor-pointer">
              <input type="checkbox" className="hidden peer" />
              <div className="bg-white px-4 py-1 border border-gray-1 text-gray-1 rounded-lg shadow-md peer-checked:bg-primary-blue4 peer-checked:text-primary-blue1 peer-checked:border-primary-blue1">
                後端
              </div>
            </label>

            <label className="cursor-pointer">
              <input type="checkbox" className="hidden peer" />
              <div className="bg-white px-4 py-1 border border-gray-1 text-gray-1 rounded-lg shadow-md peer-checked:bg-primary-blue4 peer-checked:text-primary-blue1 peer-checked:border-primary-blue1">
                計畫管理
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="checkbox" className="hidden peer" />
              <div className="bg-white px-4 py-1 border border-gray-1 text-gray-1 rounded-lg shadow-md peer-checked:bg-primary-blue4 peer-checked:text-primary-blue1 peer-checked:border-primary-blue1">
                平面設計
              </div>
            </label>
            <label className="cursor-pointer">
              <input type="checkbox" className="hidden peer" />
              <div className="bg-white px-4 py-1 border border-gray-1 text-gray-1 rounded-lg shadow-md peer-checked:bg-primary-blue4 peer-checked:text-primary-blue1 peer-checked:border-primary-blue1">
                3D建模
              </div>
            </label>
          </div> */}

          <ProjectList />
        </div>
      </div>
    </div>
  );
}
