//發起專案
"use client";

import AlertMessage from "@/components/AlertMessage";
import Sidebar from "@/components/Sidebar";
import TextInput from "@/components/AddProjectInfo/TextInput";
import NumberInput from "@/components/AddProjectInfo/NumberInput";
import {
  BackIcon,
  PreviewIcon,
  UploadIcon,
  JoinIcon,
  CheckIcon,
} from "@/components/icons";
import Link from "next/link";
import Textarea from "@/components/AddProjectInfo/TextArea";
import DatePick from "@/components/AddProjectInfo/DatePick";
import DropdownSelector from "@/components/AddProjectInfo/DropdownSelector";
import DropdownSelectorGroup from "@/components/AddProjectInfo/SkillSelector";
import { Button } from "@heroui/react";
import UploadPic from "@/components/UploadPic";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CalendarDate } from "@internationalized/date";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import firebaseApp from "@/src/database/firebaseClient";

type FormState = {
  projectName: string;
  projectDescription: string;
  startDate: CalendarDate | null;
  endDate: CalendarDate | null;
  projectTypeName: string;
  peopleRequired: string;
  skillDescription: string;
  skillTypeNames: string[];
};

export default function AddProjects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isLogIn, setIsLogIn] = useState<boolean | null>(null);

  // 圖片
  const [imageUrl, setImageUrl] = useState<string>("");
  // project
  const [form, setForm] = useState<FormState>({
    projectName: "",
    projectDescription: "",
    startDate: null,
    endDate: null,
    projectTypeName: "",
    peopleRequired: "",
    skillDescription: "",
    skillTypeNames: [""],
  });
  // session
  const [userInfo, setUserInfo] = useState({
    name: "",
    email: "",
  });
  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch("/api/session");
        const sessionData = await res.json();

        if (!sessionData.loggedIn) {
          setAlertMessage("請先登入");
          setShowAlert(true);
          return;
        }

        // ✔ 設定登入狀態
        setIsLogIn(true);

        // ✔ 設定使用者資訊
        setUserInfo({
          name: sessionData.name || "沒有填寫姓名",
          email: sessionData.email || "沒有填寫信箱",
        });

        // ✔ 拿回臨時圖片
        const tempUrl = localStorage.getItem("tempUploadedImageUrl");
        if (tempUrl) setImageUrl(tempUrl);

      } catch (err) {
        console.error("載入 session 時發生錯誤", err);
        setAlertMessage("載入登入狀態時發生錯誤");
        setShowAlert(true);
      }
    }

    loadSession();
  }, []);


  const handleConfirm = () => {
    setShowAlert(false);
    router.replace("/login");
  };
  // 預覽：show localStorage
  const handlePreview = () => {
    // 驗證
    if (!form.projectName) {
      setAlertMessage("請填寫專案名稱");
      console.log("檢查");
      setShowAlert(true);
      return;
    }
    if (!form.projectDescription) {
      setAlertMessage("請填寫專案說明");
      setShowAlert(true);
      return;
    }
    if (!form.startDate) {
      setAlertMessage("請填寫開始日期");
      setShowAlert(true);
      return;
    }
    if (!form.endDate) {
      // alert("請填寫結束日期");
      setAlertMessage("請填寫結束日期");
      setShowAlert(true);
      return;
    }
    if (!form.projectTypeName) {
      setAlertMessage("請選擇專案類別");
      setShowAlert(true);
      return;
    }
    if (!form.peopleRequired) {
      setAlertMessage("請輸入人數需求");
      setShowAlert(true);
      return;
    }
    if (!form.skillDescription) {
      setAlertMessage("請填寫技能描述");
      setShowAlert(true);
      return;
    }

    // 日期順序檢查
    if (
      form.startDate &&
      form.endDate &&
      form.startDate.compare(form.endDate) > 0
    ) {
      setAlertMessage("開始日期必須早於結束日期");
      setShowAlert(true);
      return;
    }

    // 產生暫時 projectId（）
    const projectId = "newProject";

    // 將 form(文字資料) 和 imageUrl(圖片資料) 存到 localStorage
    const previewData = {
      ...form,
      startDate: form.startDate ? form.startDate.toString() : null,
      endDate: form.endDate ? form.endDate.toString() : null,
      projectImageUrl: imageUrl,
      userInfo,
      projectId,
    };

    localStorage.setItem("projectEditPreview", JSON.stringify(previewData));

    router.push(`/projects/${projectId}/preview`);
  };

  return (
    <div className="h-full w-full flex flex-col sm:flex-row bg-gray-50 text-gray-800 sm:justify-around">
      {showAlert && (
        <div className="absolute inset-0 z-50 flex justify-center items-center">
          <AlertMessage
            onConfirm={handleConfirm}
            title={alertMessage}
            action="確定"
            confirmIcon={<CheckIcon />} />
        </div>)
      }
      {/* Sidebar */}
      <div className="mt-16">
        <Sidebar />
      </div>
      {/* 新增專案內容 */}
      <section className="flex ml-5 sm:ml-0 pt-10 w-[70%] mr-16 min-w-[340px]">
        <div className="w-full relative bg-white rounded-2xl p-5  flex flex-col sm:w-[550px] md:w-[600px] lg:w-[900px]">
          <div className="flex items-center mt-5">
            <Link href="/myproject">
              <BackIcon />
            </Link>
            <div className="text-primary-blue0 text-2xl font-bold ml-3">
              新增專案
            </div>
          </div>

          <form>
            {/* 新增專案 */}
            <div className="flex flex-col lg:flex-row justify-center">
              <div className="flex flex-col mt-8 items-center p-3">
                <div
                  role="button"
                  tabIndex={0}
                  className="relative overflow-hidden cursor-pointer bg-primary-blue5 w-[300px] h-[200px] rounded-2xl flex justify-center items-center flex-col text-gray-2"
                  onClick={() => setIsModalOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      setIsModalOpen(true);
                    }
                  }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      width={300}
                      height={200}
                      alt="pic"
                      className="absolute top-0 left-0 w-full h-full rounded-2xl object-cover"
                    />
                  ) : (
                    <>
                      <div className="mb-3">
                        <UploadIcon />
                      </div>
                      <div>上傳圖片</div>
                      <div>JPEG, PNG formats, up to 5MB</div>
                    </>
                  )}
                </div>
                <Button
                  type="button"
                  onPress={() => setIsModalOpen(true)}
                  className="bg-primary-blue5 text-primary-blue2 px-4 py-2 rounded-md font-medium mt-5"
                >
                  上傳圖片
                </Button>

                {isModalOpen && (
                  <UploadPic
                    onUploadSuccess={async (file: File) => {
                      try {
                        // 上傳到 Firebase Storage 的臨時目錄
                        const storage = getStorage(firebaseApp);
                        const fileName = `temp/${Date.now()}_${file.name}`;
                        const storageRef = ref(storage, fileName);
                        // 上傳文件
                        await uploadBytes(storageRef, file);
                        const downloadURL = await getDownloadURL(storageRef);

                        // 存到 localStorage
                        if (typeof window !== "undefined") {
                          localStorage.setItem(
                            "tempUploadedImageUrl",
                            downloadURL
                          );
                        }
                        setImageUrl(downloadURL);
                        console.log("圖片已上傳到臨時位置:", downloadURL);
                      } catch (error) {
                        console.error("圖片上傳失敗:", error);
                        alert("圖片上傳失敗，請稍後再試");
                      }
                      setIsModalOpen(false);
                    }}
                    onClose={() => setIsModalOpen(false)}
                  />
                )}
              </div>

              {/* 欄位 */}
              <div className="mt-10 pl-0 sm:pl-10 lg:pl-4">
                <TextInput
                  name="projectName"
                  label="專案名稱"
                  placeholder="請輸入專案名稱，最多輸入10個字"
                  value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                />
                <Textarea
                  name="projectDescription"
                  label="專案說明"
                  placeholder="請說明專案內容，最多100個字"
                  value={form.projectDescription}
                  onChange={(e) =>
                    setForm({ ...form, projectDescription: e.target.value })
                  }
                ></Textarea>
                <div className="flex flex-col lg:flex-row">
                  <DatePick
                    name="startDate"
                    label="開始日期"
                    value={form.startDate}
                    onChange={(date) => setForm({ ...form, startDate: date })}
                  ></DatePick>
                  <DatePick
                    name="endDate"
                    label="結束日期"
                    value={form.endDate}
                    onChange={(date) => setForm({ ...form, endDate: date })}
                  ></DatePick>
                </div>
                <DropdownSelector
                  name="projectTypeName"
                  label="專案類別"
                  value={form.projectTypeName}
                  onChange={(val) => setForm({ ...form, projectTypeName: val })}
                ></DropdownSelector>
                <NumberInput
                  name="peopleRequired"
                  label="人數需求"
                  value={form.peopleRequired}
                  onChange={(e) =>
                    setForm({ ...form, peopleRequired: e.target.value })
                  }
                ></NumberInput>
                {/* 技能類型 */}
                <DropdownSelectorGroup
                  value={form.skillTypeNames}
                  onChange={(arr) => {
                    setForm({ ...form, skillTypeNames: arr });
                  }}
                />
                <Textarea
                  name="skillDescription"
                  label="技能描述"
                  placeholder="請說明技能需求，最多100個字"
                  value={form.skillDescription}
                  onChange={(e) =>
                    setForm({ ...form, skillDescription: e.target.value })
                  }
                ></Textarea>

                <div className="flex flex-col justify-center items-start">
                  <div className="text-lg flex justify-between mb-6">
                    <div className="text-lg w-[100px] font-medium">發起人</div>
                    {/* 以下資訊為後端讀取資料庫user 姓名 */}
                    <div className="text-primary-blue0 font-semibold">
                      {userInfo.name}
                    </div>
                  </div>

                  <div className="text-lg flex justify-between mb-6">
                    <div className="text-lg w-[100px] font-medium">
                      電子信箱
                    </div>
                    {/* 以下資訊為後端讀取資料庫user 電子信箱 */}
                    <div className="text-primary-blue0 font-semibold">
                      {userInfo.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-center">
              {/* 當user按下預覽時，將資料存 localStorage 並跳轉到 preview */}
              <Button
                type="button"
                className="bg-primary-blue2 text-white text-lg"
                startContent={<PreviewIcon />}
                onPress={handlePreview}
              >
                預覽
              </Button>
            </div>
          </form>
        </div>
      </section >
    </div >
  );
}
