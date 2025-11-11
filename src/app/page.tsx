import ProjectList from "@/components/Project/ProjectList";
import { Search } from "lucide-react";
import { Divider } from "@heroui/divider";

export default function Home() {
  return (
    <div>
      {/* banner */}
      <div className="bg-[radial-gradient(circle_at_bottom,_#A9C4FF,_#FFFFFF)] w-full h-[60vh] flex justify-center items-center flex-col">
        <div className="text-4xl font-bold text-primary-blue1 mx-10 justify-center">
          TeamUp 幫你<span className="text-primary-blue2">找到對的人</span>
          ，做對的事。
        </div>

        {/* 之後下面這邊請放搜尋功能 */}
        {/* <div className="relative w-[40%] mt-5">
          <input
            type="text"
            placeholder="搜尋專案"
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
          <div className="mt-8 text-primary-blue1 text-xl pb-4 font-bold">
            <h2>專案列表</h2>
            <Divider className="my-2" />
          </div>

          {/* 專案勾選欄，之後請加專案勾選搜尋功能 */}
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
                專案管理
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
