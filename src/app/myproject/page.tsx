"use client";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { AddProjectIcon } from "@/components/icons";
import MyProjectList from "@/components/Project/MyProjectList";
import JoinProjectList from "@/components/Project/JoinProjectList";

import { Tabs, Tab } from "@heroui/tabs";
import { Divider } from "@heroui/divider";
import { Button } from "@heroui/react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function MyProjectPage() {
  // 此為 Tab 切換
  const [selectedTab, setSelectedTab] = useState("initiate");
  const router = useRouter();
  const [isLogIn, setIsLogIn] = useState<boolean | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const res = await fetch("/api/session");
        if (!res.ok) {
          router.replace("/login");
        } else {
          setIsLogIn(true);
        }
      } catch {
        setIsLogIn(false);
        router.replace("/login");
      }
    };
    checkSession();
  }, [router]);

  if (isLogIn === null) {
    return null; // Or return a loading spinner
  }

  return (
    <main className="h-full w-full flex bg-gray-50 text-gray-800 justify-around">
      {/* Sidebar */}
      <div className="mt-16">
        <Sidebar />
      </div>

      {/* Tab Section */}
      <section className="flex p-10 w-[70%] mr-16 ">
        <div className=" w-full bg-white  rounded-2xl p-8 flex flex-col space-y-6 relative ">
          {/* 切換 tab 樣式*/}
          <div className="flex flex-col ">
            <Tabs
              selectedKey={selectedTab}
              onSelectionChange={(key) => setSelectedTab(key.toString())}
              aria-label="Project Options"
              variant="light"
              classNames={{
                tabList:
                  "flex w-[200px] rounded-xl border border-primary-blue0 bg-white overflow-hidden p-0 gap-0",
                tab: "p-0 h-10 outline-none border-none focus:outline-none",
                tabContent:
                  "m-0 w-full h-full flex items-center justify-center text-base font-semibold transition-colors group-data-[selected=true]:bg-primary-blue0 group-data-[selected=true]:text-white group-data-[selected=false]:text-gray-2 group-data-[selected=false]:bg-white",
                cursor: "hidden",
              }}
            >
              {/* 發起計畫 Tab */}
              <Tab key="initiate" title={<h3>發起計畫</h3>}>
                <Divider className="my-4 w-full" />

                {/* 新增計畫按鈕 須連結至下一頁 */}
                <div className="flex  justify-end">
                  <Link href={"/myproject/new"}>
                    <Button className="bg-primary-blue2 text-white">
                      <AddProjectIcon />
                      新增
                    </Button>
                  </Link>
                </div>

                {/* 主要畫面呈現 */}
                <MyProjectList></MyProjectList>

                {/* 加入計畫 Tab */}
              </Tab>
              <Tab key="join" title={<h3>加入計畫</h3>}>
                <Divider className="my-4 w-full" />
                <JoinProjectList></JoinProjectList>
              </Tab>
            </Tabs>
          </div>

          {/* 編輯按鈕 */}
        </div>
      </section>
    </main>
  );
}
