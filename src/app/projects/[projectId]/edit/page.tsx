// 此頁要編輯專案資訊
"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TextInput from "@/components/AddProjectInfo/TextInput";
import NumberInput from "@/components/AddProjectInfo/NumberInput";
import Textarea from "@/components/AddProjectInfo/TextArea";
import DatePick from "@/components/AddProjectInfo/DatePick";
import DropdownSelector from "@/components/AddProjectInfo/DropdownSelector";
import DropdownSelectorGroup from "@/components/AddProjectInfo/SkillSelector";
import UploadPic from "@/components/UploadPic";
import AlertMessage from "@/components/AlertMessage";
import { BackIcon, PreviewIcon, UploadIcon, CheckIcon } from "@/components/icons";
import { Button } from "@heroui/react";
import Link from "next/link";
import { parseDate, CalendarDate } from "@internationalized/date";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
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

const toCalendarDate = (input: any): CalendarDate | null => {
  if (!input) return null;
  const seconds = input.seconds ?? input._seconds;
  if (typeof seconds !== "number") return null;
  const date = new Date(seconds * 1000);
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

export default function AddProjects() {
  const params = useParams();
  const projectId = params.projectId as string;
  const isNew = projectId === "newProject";
  const router = useRouter();

  const [showAlert, setShowAlert] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [userInfo, setUserInfo] = useState({ name: "", email: "" });

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

  useEffect(() => {
    if (isNew) {
      const previewStr = typeof window !== "undefined" ? localStorage.getItem("projectEditPreview") : null;
      if (previewStr) {
        try {
          const previewData = JSON.parse(previewStr);
          setForm({
            projectName: previewData.projectName || "",
            projectDescription: previewData.projectDescription || "",
            startDate: previewData.startDate ? parseDate(previewData.startDate) : null,
            endDate: previewData.endDate ? parseDate(previewData.endDate) : null,
            projectTypeName: previewData.projectTypeName || "",
            peopleRequired: previewData.peopleRequired || "",
            skillDescription: previewData.skillDescription || "",
            skillTypeNames: previewData.skillTypeNames || [""],
          });

          const tempUrl = typeof window !== "undefined" ? localStorage.getItem("tempUploadedImageUrl") : null;
          setImageUrl(tempUrl || previewData.projectImageUrl || "");

          setUserInfo(previewData.userInfo || { name: "", email: "" });
        } catch (e) {
          console.error("解析 localStorage 專案資料失敗", e);
        }
      }
    } else {
      const fetchProjectData = async () => {
        try {
          const res = await fetch(`/api/projects/${projectId}`);
          const json = await res.json();
          if (json.success && json.data) {
            setForm({
              projectName: json.data.projectName || "",
              projectDescription: json.data.projectDescription || "",
              startDate: json.data.startDate ? toCalendarDate(json.data.startDate) : null,
              endDate: json.data.endDate ? toCalendarDate(json.data.endDate) : null,
              projectTypeName: json.data.projectTypeName || "",
              peopleRequired: json.data.peopleRequired || "",
              skillDescription: json.data.skillDescription || "",
              skillTypeNames: json.data.skillTypeNames || [""],
            });
            setImageUrl(json.data.projectImageUrl || "");
            setUserInfo({
              name: json.data.ownerName || "",
              email: json.data.ownerEmail || "",
            });
          } else {
            console.error("無法取得此專案資料或資料錯誤");
          }
        } catch (e) {
          console.error("無法取得此專案", e);
        }
      };
      fetchProjectData();
    }
  }, [projectId]);

  const handleConfirm = () => {
    setShowAlert(false);
  };

  const handlePreview = () => {
    if (!form.projectName) return showAlertMessage("請填寫專案名稱");
    if (!form.projectDescription) return showAlertMessage("請填寫專案說明");
    if (!form.startDate) return showAlertMessage("請填寫開始日期");
    if (!form.endDate) return showAlertMessage("請填寫結束日期");
    if (!form.projectTypeName) return showAlertMessage("請選擇專案類別");
    if (!form.peopleRequired) return showAlertMessage("請輸入人數需求");
    if (!form.skillDescription) return showAlertMessage("請填寫技能描述");
    if (form.startDate.compare(form.endDate) > 0) return showAlertMessage("開始日期必須早於結束日期");

    const previewData = {
      ...form,
      startDate: form.startDate?.toString() || null,
      endDate: form.endDate?.toString() || null,
      projectImageUrl: imageUrl,
      projectId: isNew ? undefined : projectId,
      userInfo,
    };

    localStorage.setItem("projectEditPreview", JSON.stringify(previewData));
    router.push(`/projects/${projectId}/preview`);
  };

  const showAlertMessage = (msg: string) => {
    setAlertMessage(msg);
    setShowAlert(true);
  };

  return (
    <div className="h-full w-full flex flex-col sm:flex-row bg-gray-50 text-gray-800 sm:justify-around">
      {showAlert && (
        <div className="absolute inset-0 z-50 flex justify-center items-center">
          <AlertMessage onConfirm={handleConfirm} title={alertMessage} action="確定" confirmIcon={<CheckIcon />} />
        </div>
      )}
      <div className="mt-16">
        <Sidebar />
      </div>
      <section className="flex ml-5 sm:ml-0 pt-10 w-[70%] mr-16 min-w-[340px]">
        <div className="w-full relative bg-white rounded-2xl p-5  flex flex-col sm:w-[550px] md:w-[600px] lg:w-[900px]">
          <div className="flex items-center mt-5">
            <Link href="/myproject">
              <BackIcon />
            </Link>
            <div className="text-primary-blue0 text-2xl font-bold ml-3">編輯專案</div>
          </div>

          <form>
            <div className="flex flex-col  lg:flex-row justify-center">
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
                  <img
                    src={imageUrl || "/project/project-image.jpg"}
                    className="absolute top-0 left-0 w-full h-full rounded-2xl object-cover"
                    alt="Project"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(true)}
                  className="bg-primary-blue5 text-primary-blue2 px-4 py-2 rounded-md font-medium mt-5"
                >
                  選擇圖片
                </button>
                {isModalOpen && (
                  <UploadPic
                    onUploadSuccess={async (file: File) => {
                      try {
                        const storage = getStorage(firebaseApp);
                        const fileName = `temp/${Date.now()}_${file.name}`;
                        const storageRef = ref(storage, fileName);
                        await uploadBytes(storageRef, file);
                        const downloadURL = await getDownloadURL(storageRef);
                        localStorage.setItem("tempUploadedImageUrl", downloadURL);
                        setImageUrl(downloadURL);
                      } catch (error) {
                        console.error("圖片上傳失敗:", error);
                      }
                      setIsModalOpen(false);
                    }}
                    onClose={() => setIsModalOpen(false)}
                  />
                )}
              </div>

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
                  onChange={(e) => setForm({ ...form, projectDescription: e.target.value })}
                />
                <div className="flex flex-col lg:flex-row">
                  <DatePick name="startDate" label="開始日期" value={form.startDate} onChange={(date) => setForm({ ...form, startDate: date })} />
                  <DatePick name="endDate" label="結束日期" value={form.endDate} onChange={(date) => setForm({ ...form, endDate: date })} />
                </div>
                <DropdownSelector name="projectTypeName" label="專案類別" value={form.projectTypeName} onChange={(val) => setForm({ ...form, projectTypeName: val })} />
                <NumberInput name="peopleRequired" label="人數需求" value={form.peopleRequired} onChange={(e) => setForm({ ...form, peopleRequired: e.target.value })} />
                <DropdownSelectorGroup value={form.skillTypeNames} onChange={(arr) => setForm({ ...form, skillTypeNames: arr })} />
                <Textarea name="skillDescription" label="技能描述" placeholder="請說明技能需求，最多100個字" value={form.skillDescription} onChange={(e) => setForm({ ...form, skillDescription: e.target.value })} />

                <div className="text-lg flex justify-start mb-6">
                  <span className="w-[100px] font-medium">發起人</span>
                  <span className="text-primary-blue0 font-semibold">{userInfo.name}</span>
                </div>
                <div className="text-lg flex justify-start mb-6">
                  <span className="w-[100px] font-medium">電子信箱</span>
                  <span className="text-primary-blue0 font-semibold">{userInfo.email}</span>
                </div>
              </div>
            </div>
            <div className="mt-10 flex justify-center">
              <Button type="button" className="bg-primary-blue2 text-white text-lg" startContent={<PreviewIcon />} onPress={handlePreview}>
                預覽
              </Button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
