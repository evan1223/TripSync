"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import TextInput from "@/components/AddProjectInfo/TextInput";
import NumberInput from "@/components/AddProjectInfo/NumberInput";
import Textarea from "@/components/AddProjectInfo/TextArea";
import DatePick from "@/components/AddProjectInfo/DatePick";
import BudgetNumberInput from "@/components/AddProjectInfo/BudgetNumberInput";
import UploadPic from "@/components/UploadPic";
import AlertMessage from "@/components/AlertMessage";
import { BackIcon, PreviewIcon, UploadIcon, CheckIcon } from "@/components/icons";
import { Button } from "@heroui/react";
import Link from "next/link";
import { CalendarDate, parseDate } from "@internationalized/date";
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage";
import firebaseApp from "@/src/database/firebaseClient";

type BudgetItem = {
  label: string;
  amount: string;
};

type FormState = {
  projectName: string;
  projectDescription: string;
  startDate: CalendarDate | null;
  endDate: CalendarDate | null;
  projectTypeName: string;
  peopleRequired: string;
  skillDescription: string;
  skillTypeNames: string[];
  budgetItems: BudgetItem[];  // << 新增
};

const toCalendarDate = (input: any): CalendarDate | null => {
  if (!input) return null;
  const seconds = input.seconds ?? input._seconds;
  if (typeof seconds !== "number") return null;
  const date = new Date(seconds * 1000);
  return new CalendarDate(date.getFullYear(), date.getMonth() + 1, date.getDate());
};

export default function EditProject() {
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
    budgetItems: [{ label: "", amount: "" }],
  });

  const showAlertMessage = (msg: string) => {
    setAlertMessage(msg);
    setShowAlert(true);
  };

  /** -----------------------
   *  讀取資料（create / edit 共用）
   ------------------------ */
  useEffect(() => {
    if (isNew) {
      const str = localStorage.getItem("projectEditPreview");
      if (!str) return;

      try {
        const data = JSON.parse(str);

        setForm({
          projectName: data.projectName || "",
          projectDescription: data.projectDescription || "",
          startDate: data.startDate ? parseDate(data.startDate) : null,
          endDate: data.endDate ? parseDate(data.endDate) : null,
          projectTypeName: data.projectTypeName || "",
          peopleRequired: data.peopleRequired || "",
          skillDescription: data.skillDescription || "",
          skillTypeNames: data.skillTypeNames || [""],
          budgetItems: data.budgetItems || [{ label: "", amount: "" }],
        });

        setImageUrl(
          localStorage.getItem("tempUploadedImageUrl") ||
          data.projectImageUrl ||
          ""
        );

        setUserInfo(data.userInfo || { name: "", email: "" });
      } catch (e) {
        console.error("解析 localStorage 失敗", e);
      }
    } else {
      loadProjectFromFirebase();
    }
  }, [projectId]);

  /** -----------------------
   *  從 Firebase 載入專案資料
   ------------------------ */
  async function loadProjectFromFirebase() {
    try {
      const res = await fetch(`/api/projects/${projectId}`);
      const json = await res.json();

      if (!json.success || !json.data) return;

      const d = json.data;

      setForm({
        projectName: d.projectName || "",
        projectDescription: d.projectDescription || "",
        startDate: d.startDate ? toCalendarDate(d.startDate) : null,
        endDate: d.endDate ? toCalendarDate(d.endDate) : null,
        projectTypeName: d.projectTypeName || "",
        peopleRequired: d.peopleRequired || "",
        skillDescription: d.skillDescription || "",
        skillTypeNames: d.skillTypeNames || [""],
        budgetItems: d.budgetItems?.length ? d.budgetItems : [{ label: "", amount: "" }],
      });

      setImageUrl(d.projectImageUrl || "");
      setUserInfo({
        name: d.ownerName || "",
        email: d.ownerEmail || "",
      });
    } catch (e) {
      console.error("讀取專案失敗", e);
    }
  }

  /** -----------------------
   *  預算細項操作
   ------------------------ */
  const handleBudgetItemChange = (
    index: number,
    field: "label" | "amount",
    value: string
  ) => {
    setForm((prev) => {
      const copy = [...prev.budgetItems];
      copy[index] = { ...copy[index], [field]: value };
      return { ...prev, budgetItems: copy };
    });
  };

  const handleAddBudgetItem = () => {
    setForm((prev) => ({
      ...prev,
      budgetItems: [...prev.budgetItems, { label: "", amount: "" }],
    }));
  };

  const handleRemoveBudgetItem = (i: number) => {
    setForm((prev) => {
      if (prev.budgetItems.length === 1) return prev;
      return {
        ...prev,
        budgetItems: prev.budgetItems.filter((_, idx) => idx !== i),
      };
    });
  };

  /** -----------------------
   *  預覽
   ------------------------ */
  const handlePreview = () => {
    if (!form.projectName) return showAlertMessage("請填寫專案名稱");
    if (!form.projectDescription) return showAlertMessage("請填寫專案說明");
    if (!form.startDate) return showAlertMessage("請填寫開始日期");
    if (!form.endDate) return showAlertMessage("請填寫結束日期");
    if (form.startDate.compare(form.endDate) > 0)
      return showAlertMessage("開始日期必須早於結束日期");

    const filledBudget = form.budgetItems.filter(
      (x) => x.label.trim() !== "" || x.amount.trim() !== ""
    );

    for (let i = 0; i < filledBudget.length; i++) {
      const item = filledBudget[i];
      const row = i + 1;

      if (!item.label.trim() || !item.amount.trim())
        return showAlertMessage(`預算細項第 ${row} 列資料不完整`);

      if (!/^\d+$/.test(item.amount.trim()))
        return showAlertMessage(`預算細項第 ${row} 列預算必須為正整數`);

      const amt = Number(item.amount.trim());
      if (amt <= 0 || amt > 999_999_999)
        return showAlertMessage(`預算細項第 ${row} 列金額不符規則`);
    }

    const previewData = {
      ...form,
      budgetItems: filledBudget,
      startDate: form.startDate.toString(),
      endDate: form.endDate.toString(),
      projectImageUrl: imageUrl,
      projectId: isNew ? undefined : projectId,
      userInfo,
    };

    localStorage.setItem("projectEditPreview", JSON.stringify(previewData));

    router.push(`/projects/${projectId}/preview`);
  };

  /** -----------------------
   *  UI 渲染
   ------------------------ */
  return (
    <div className="h-full w-full flex flex-col sm:flex-row bg-gray-50 text-gray-800 sm:justify-around">
      {showAlert && (
        <div className="absolute inset-0 z-50 flex justify-center items-center">
          <AlertMessage
            onConfirm={() => setShowAlert(false)}
            title={alertMessage}
            action="確定"
            confirmIcon={<CheckIcon />}
          />
        </div>
      )}

      <div className="mt-16">
        <Sidebar />
      </div>

      <section className="flex ml-5 sm:ml-0 pt-10 w-[70%] mr-16 min-w-[340px]">
        <div className="w-full relative bg-white rounded-2xl p-5 flex flex-col sm:w-[550px] md:w-[600px] lg:w-[900px]">
          <div className="flex items-center mt-5">
            <Link href="/myproject">
              <BackIcon />
            </Link>
            <div className="text-primary-blue0 text-2xl font-bold ml-3">
              編輯專案
            </div>
          </div>

          <form>
            <div className="flex flex-col lg:flex-row justify-center">
              {/* 圖片區 */}
              <div className="flex flex-col mt-8 items-center p-3">
                <div
                  className="relative overflow-hidden cursor-pointer bg-primary-blue5 w-[300px] h-[200px] rounded-2xl flex justify-center items-center"
                  onClick={() => setIsModalOpen(true)}
                >
                  <img
                    src={imageUrl || "/project/project-image.jpg"}
                    className="absolute top-0 left-0 w-full h-full rounded-2xl object-cover"
                    alt="Project"
                  />
                </div>

                <Button
                  type="button"
                  onPress={() => setIsModalOpen(true)}
                  className="bg-primary-blue5 text-primary-blue2 px-4 py-2 rounded-md font-medium mt-5"
                >
                  選擇圖片
                </Button>

                {isModalOpen && (
                  <UploadPic
                    onUploadSuccess={async (file: File) => {
                      try {
                        const storage = getStorage(firebaseApp);
                        const fileName = `temp/${Date.now()}_${file.name}`;
                        const storageRef = ref(storage, fileName);

                        await uploadBytes(storageRef, file);
                        const url = await getDownloadURL(storageRef);

                        localStorage.setItem("tempUploadedImageUrl", url);
                        setImageUrl(url);
                      } catch (e) {
                        console.error("圖片上傳失敗：", e);
                      }
                      setIsModalOpen(false);
                    }}
                    onClose={() => setIsModalOpen(false)}
                  />
                )}
              </div>

              {/* 欄位區 */}
              <div className="mt-10 pl-0 sm:pl-10 lg:pl-4">
                <TextInput
                  name="projectName"
                  label="專案名稱"
                  placeholder="請輸入專案名稱（最多 10 字）"
                  value={form.projectName}
                  onChange={(e) => setForm({ ...form, projectName: e.target.value })}
                />

                <Textarea
                  name="projectDescription"
                  label="專案說明"
                  placeholder="請輸入內容（最多 100 字）"
                  value={form.projectDescription}
                  onChange={(e) =>
                    setForm({ ...form, projectDescription: e.target.value })
                  }
                />

                {/* 日期 */}
                <div className="mb-6 flex items-center">
                  <label className="text-lg w-[105px] font-medium mr-5">開始日期</label>

                  <div className="flex items-center gap-4 w-[200px] md:w-[300px] lg:w-[400px]">
                    <DatePick
                      name="startDate"
                      label=""
                      value={form.startDate}
                      onChange={(date) => setForm({ ...form, startDate: date })}
                    />

                    <span className="text-lg font-medium">結束日期</span>

                    <DatePick
                      name="endDate"
                      label=""
                      value={form.endDate}
                      onChange={(date) => setForm({ ...form, endDate: date })}
                    />
                  </div>
                </div>

                <TextInput
                  name="projectTypeName"
                  label="旅行地點"
                  placeholder='請輸入地點，用 "/" 分隔'
                  value={form.projectTypeName}
                  onChange={(e) =>
                    setForm({ ...form, projectTypeName: e.target.value.slice(0, 10) })
                  }
                />

                <NumberInput
                  name="peopleRequired"
                  label="旅伴人數"
                  value={form.peopleRequired}
                  onChange={(e) =>
                    setForm({ ...form, peopleRequired: e.target.value })
                  }
                />

                {/* 預算細項 */}
                <div className="mt-6 mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-lg font-medium">個人預算細項</div>
                      <div className="text-sm text-gray-500 mt-1">
                        例如：交通、住宿、餐飲⋯⋯
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="bg-primary-blue5 text-primary-blue2 text-sm"
                      onPress={handleAddBudgetItem}
                    >
                      ＋ 新增預算項目
                    </Button>
                  </div>

                  <div className="space-y-4 mt-3">
                    {form.budgetItems.map((item, index) => (
                      <div
                        key={index}
                        className="rounded-2xl border border-gray-200 bg-gray-50 px-4 py-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <TextInput
                              name={`budgetLabel-${index}`}
                              label="項目名稱"
                              placeholder="例如：機票、住宿"
                              value={item.label}
                              onChange={(e) =>
                                handleBudgetItemChange(index, "label", e.target.value)
                              }
                            />
                          </div>

                          <div className="sm:mt-6 self-end sm:self-auto">
                            <Button
                              type="button"
                              size="sm"
                              className="bg-red-100 text-red-600"
                              isDisabled={form.budgetItems.length === 1}
                              onPress={() => handleRemoveBudgetItem(index)}
                            >
                              刪除
                            </Button>
                          </div>
                        </div>

                        <div className="mt-3">
                          <BudgetNumberInput
                            name={`budgetAmount-${index}`}
                            label="預算金額（元）"
                            value={item.amount}
                            onChange={(v) =>
                              handleBudgetItemChange(index, "amount", v)
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <TextInput
                  name="skillTypeNames"
                  label="技能需求"
                  placeholder="請輸入技能需求（最多 10 字）"
                  value={form.skillTypeNames[0] || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      skillTypeNames: [e.target.value.slice(0, 10)],
                    })
                  }
                />

                <Textarea
                  name="skillDescription"
                  label="技能描述"
                  placeholder="請輸入技能描述（最多 100 字）"
                  value={form.skillDescription}
                  onChange={(e) =>
                    setForm({ ...form, skillDescription: e.target.value })
                  }
                />

                {/* 發起人資訊 */}
                <div className="flex flex-col justify-center items-start mt-5">
                  <div className="text-lg flex justify-between mb-6">
                    <div className="text-lg w-[100px] font-medium">發起人</div>
                    <div className="text-primary-blue0 font-semibold">
                      {userInfo.name}
                    </div>
                  </div>

                  <div className="text-lg flex justify-between mb-6">
                    <div className="text-lg w-[100px] font-medium">電子信箱</div>
                    <div className="text-primary-blue0 font-semibold">
                      {userInfo.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-center">
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
      </section>
    </div>
  );
}
