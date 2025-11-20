//發起計畫
"use client";

import AlertMessage from "@/components/AlertMessage";
import Sidebar from "@/components/Sidebar";
import TextInput from "@/components/AddProjectInfo/TextInput";
import NumberInput from "@/components/AddProjectInfo/NumberInput";
import BudgetNumberInput from "@/components/AddProjectInfo/BudgetNumberInput";
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

type BudgetItem = {
  label: string;   // 預算項目名稱，例如：機票、住宿
  amount: string;  // 預算金額，先用字串記
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
  budgetItems: BudgetItem[];   // ⬅ 新增預算細項
};

export default function AddProjects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const [showAlert, setShowAlert] = useState(false);
  const [redirectOnAlert, setRedirectOnAlert] = useState(false);
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
    budgetItems: [
      { label: "", amount: "" }, // 預設一列空的預算項目
    ],
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
          setRedirectOnAlert(true);
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
        setRedirectOnAlert(true);
        setShowAlert(true);
      }
    }

    loadSession();
  }, []);

  const handleConfirm = () => {
  setShowAlert(false);

  if (redirectOnAlert) {
    router.replace("/login");
  }
};

  // 預算細項：更新單一列
  const handleBudgetItemChange = (
    index: number,
    field: "label" | "amount",
    value: string
  ) => {
    setForm((prev) => {
      const newItems = [...prev.budgetItems];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, budgetItems: newItems };
    });
  };

  // 預算細項：新增一列
  const handleAddBudgetItem = () => {
    setForm((prev) => ({
      ...prev,
      budgetItems: [...prev.budgetItems, { label: "", amount: "" }],
    }));
  };

  // 預算細項：刪除一列（至少保留一列）
  const handleRemoveBudgetItem = (index: number) => {
    setForm((prev) => {
      if (prev.budgetItems.length === 1) return prev;
      const newItems = prev.budgetItems.filter((_, i) => i !== index);
      return { ...prev, budgetItems: newItems };
    });
  };


  // 預覽：show localStorage
  const handlePreview = () => {
    // 長度限制檢查
    if (form.projectTypeName.length > 10) {
      setAlertMessage("計畫類別最多輸入10個字");
      setShowAlert(true);
      return;
    }

    if ((form.skillTypeNames[0] || "").length > 10) {
      setAlertMessage("技能類型最多輸入10個字");
      setShowAlert(true);
      return;
    }

    // 預算細項檢查
    const filledBudgetItems = form.budgetItems.filter(
      (item) => item.label.trim() !== "" || item.amount.trim() !== ""
    );

    for (let i = 0; i < filledBudgetItems.length; i++) {
      const item = filledBudgetItems[i];
      const rowNumber = i + 1;

      if (item.label.trim() === "" || item.amount.trim() === "") {
        setAlertMessage(`預算細項第 ${rowNumber} 列資料不完整`);
        setShowAlert(true);
        return;
      }

      // 預算金額格式檢查（正整數）
      const rawAmount = item.amount.trim();

      // 1) 格式必須全為數字
      if (!/^\d+$/.test(rawAmount)) {
        setAlertMessage(`預算細項第 ${rowNumber} 列的預算金額必須為正整數`);
        setShowAlert(true);
        return;
      }

      // 2) 轉成數字後檢查範圍：1 ~ 999,999,999
      const amountNum = Number(rawAmount);

      // NaN / 非整數 / 小於等於 0
      if (!Number.isFinite(amountNum) || !Number.isInteger(amountNum) || amountNum <= 0) {
        setAlertMessage(`預算細項第 ${rowNumber} 列的預算金額必須大於 0 的整數`);
        setShowAlert(true);
        return;
      }

      // 超過上限
      if (amountNum > 999_999_999) {
        setAlertMessage(`預算細項第 ${rowNumber} 列的預算金額不可超過 999,999,999`);
        setShowAlert(true);
        return;
      }

    }

    // 基本欄位驗證
    if (!form.projectName) {
      setAlertMessage("請填寫計畫名稱");
      setShowAlert(true);
      return;
    }
    if (!form.projectDescription) {
      setAlertMessage("請填寫計畫說明");
      setShowAlert(true);
      return;
    }
    if (!form.startDate) {
      setAlertMessage("請填寫開始日期");
      setShowAlert(true);
      return;
    }
    if (!form.endDate) {
      setAlertMessage("請填寫結束日期");
      setShowAlert(true);
      return;
    }
    if (!form.projectTypeName) {
      setAlertMessage("請選擇計畫類別");
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

    // 產生暫時 projectId
    const projectId = "newProject";

    // 先把「旅行地點」依照 "/" 切成陣列
    const locations = form.projectTypeName
      .split("/") // 用 "/" 分割
      .map((loc) => loc.trim()) // 去掉前後空白
      .filter((loc) => loc.length > 0); // 過濾掉空字串

    // 將 form(文字資料) 和 imageUrl(圖片資料) 存到 localStorage
    const previewData = {
      ...form,
      budgetItems: filledBudgetItems,
      startDate: form.startDate ? form.startDate.toString() : null,
      endDate: form.endDate ? form.endDate.toString() : null,
      projectImageUrl: imageUrl,
      userInfo,
      projectId,
      locations, // 把分好的地點陣列丟進去
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
            confirmIcon={<CheckIcon />}
          />
        </div>
      )}
      {/* Sidebar */}
      <div className="mt-16">
        <Sidebar />
      </div>
      {/* 新增計畫內容 */}
      <section className="flex ml-5 sm:ml-0 pt-10 w-[70%] mr-16 min-w-[340px]">
        <div className="w-full relative bg-white rounded-2xl p-5  flex flex-col sm:w-[550px] md:w-[600px] lg:w-[900px]">
          <div className="flex items-center mt-5">
            <Link href="/myproject">
              <BackIcon />
            </Link>
            <div className="text-primary-blue0 text-2xl font-bold ml-3">
              新增旅遊計畫
            </div>
          </div>

          <form>
            {/* 新增計畫 */}
            <div className="flex flex-col lg:flex-row justify-center">
              <div className="flex flex-col mt-8 items-center p-3">
                <div
                  role="button"
                  tabIndex={0}
                  className="relative overflow-hidden cursor-pointer bg-primary-blue5 w-[300px] h-[200px] rounded-2xl flex justify-center items-center flex-col text-gray-2"
                  onClick={() => setIsModalOpen(true)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
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
                  label="計畫名稱"
                  placeholder="請輸入計畫名稱，最多輸入10個字"
                  value={form.projectName}
                  onChange={(e) =>
                    setForm({ ...form, projectName: e.target.value })
                  }
                />
                <Textarea
                  name="projectDescription"
                  label="計畫說明"
                  placeholder="請說明計畫內容，最多100個字"
                  value={form.projectDescription}
                  onChange={(e) =>
                    setForm({ ...form, projectDescription: e.target.value })
                  }
                ></Textarea>
                {/* 日期區：跟 TextInput 一樣一行，右邊 400px 裡再放兩個 DatePicker */}
                <div className="mb-6 flex items-center">
                  {/* 左邊 label，寬度跟其他欄位一樣 */}
                  <label className="text-lg w-[105px] font-medium mr-5">開始日期</label>

                  {/* 右邊整塊跟其他 input 一樣寬：200/300/400 */}
                  <div className="flex items-center gap-4 w-[200px] md:w-[300px] lg:w-[400px]">
                    {/* 起始日期 */}
                    <DatePick
                      name="startDate"
                      label=""               // 這裡 label 留空就好
                      value={form.startDate}
                      onChange={(date) => setForm({ ...form, startDate: date })}
                    />

                    {/* 中間的「結束日期」文字 */}
                    <span className="text-lg font-medium whitespace-nowrap">
                      結束日期
                    </span>

                    {/* 結束日期 */}
                    <DatePick
                      name="endDate"
                      label=""               // 同樣 label 留空
                      value={form.endDate}
                      onChange={(date) => setForm({ ...form, endDate: date })}
                    />
                  </div>
                </div>

                <TextInput
                  name="projectTypeName"
                  label="旅行地點"
                  placeholder='請輸入旅行地點，地點間請用 "/" 分隔'
                  value={form.projectTypeName}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 10); // 限制 10 個字
                    setForm({ ...form, projectTypeName: value });
                  }}
                />
                <NumberInput
                  name="peopleRequired"
                  label="旅伴人數"
                  value={form.peopleRequired}
                  onChange={(e) =>
                    setForm({ ...form, peopleRequired: e.target.value })
                  }
                ></NumberInput>

                {/* 個人預算細項 */}
                <div className="mt-6 mb-8">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-lg font-medium">個人預算細項</div>
                      <div className="text-sm text-gray-500 mt-1">
                        可依照需要新增多筆，例如：住宿、交通、餐飲⋯⋯
                      </div>
                    </div>

                    <Button
                      type="button"
                      className="bg-primary-blue5 text-primary-blue2 text-sm whitespace-nowrap"
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
                        {/* 上排：項目名稱 + 刪除按鈕 */}
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

                          {/* 項目名稱輸入框（填滿可用空間） */}
                          <div className="flex-1 min-w-0">
                            <TextInput
                              name={`budgetLabel-${index}`}
                              label="項目名稱"
                              placeholder="例如：機票、住宿⋯⋯"
                              value={item.label}
                              onChange={(e) =>
                                handleBudgetItemChange(index, "label", e.target.value)
                              }
                            />
                          </div>

                          {/* 刪除按鈕 */}
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

                        {/* 下排：預算金額 */}
                        <div className="mt-3 flex-1 min-w-0">
                          <BudgetNumberInput
                            name={`budgetAmount-${index}`}
                            label="預算金額（元）"
                            value={item.amount}
                            onChange={(value) =>
                              handleBudgetItemChange(index, "amount", value)
                            }
                          />
                        </div>

                      </div>
                    ))}
                  </div>
                </div>

                {/* 技能類型 */}
                <TextInput
                  name="skillTypeNames"
                  label="技能需求"
                  placeholder="請輸入技能需求，最多輸入10個字"
                  value={form.skillTypeNames[0] || ""}
                  onChange={(e) => {
                    const value = e.target.value.slice(0, 10); // 限制 10 個字
                    setForm({ ...form, skillTypeNames: [value] });
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
      </section>
    </div>
  );
}
