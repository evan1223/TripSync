// 此頁預覽檢視專案資訊
"use client"
import Info from "@/components/AddProjectInfo/Info";
import Tag from "@/components/AddProjectInfo/Tag";
import Sidebar from "@/components/Sidebar";
import { EditIcon, PublishIcon } from "@/components/icons"
import { Button } from "@heroui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import firebaseApp from "@/src/database/firebaseClient";

//確認登入firebase了
import { getAuth, onAuthStateChanged } from "firebase/auth";

export default function AddProjects() {
    const router = useRouter();
    const auth = getAuth(firebaseApp);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/login");
            }
        });
        return () => unsubscribe();
    }, [router, auth]);

    //session
    const [userInfo, setUserInfo] = useState({ name: "", email: "" });
    useEffect(() => {
        async function fetchSession() {
            const res = await fetch("/api/session");
            const json = await res.json();
            if (json.loggedIn) {
                setUserInfo({ name: json.name || "", email: json.email || "" });
            }
        }
        fetchSession();
    }, []);

    //project
    const { projectId } = useParams();
    const [data, setData] = useState<any>(null);
    const [imageUrl, setImageUrl] = useState<string>("");
    const [loading, setLoading] = useState(false);
    const [isClosed, setIsClosed] = useState(false); 
    const DEFAULT_PICTURE_URL = "https://firebasestorage.googleapis.com/v0/b/software-project-a060c.firebasestorage.app/o/projects%2Fproject_defualt.png?alt=media&token=8e36a8a8-d15f-4595-b785-25cfbaa70869";

    useEffect(() => {
        const loadProjectData = async () => {
            let dataToSet: any = null;
            let imageUrlToSet = DEFAULT_PICTURE_URL;

            // 從 localStorage 讀取專案資料
            const previewStr = typeof window !== 'undefined' ? localStorage.getItem("projectEditPreview") : null;

            // 從 localStorage 讀取暫存圖片 URL (如果有的話)
            const tempImageUrl = typeof window !== 'undefined' ? localStorage.getItem("tempUploadedImageUrl") : null;

            if (previewStr) {
                try {
                    const parsedLocalStorageData = JSON.parse(previewStr);
                    dataToSet = {
                        ...parsedLocalStorageData,
                        projectTypeName: parsedLocalStorageData.projectTypeName,
                        skillTypeNames: parsedLocalStorageData.skillTypeNames,
                    };
                    setUserInfo(parsedLocalStorageData.userInfo || { name: "", email: "" });

                    // 優先使用暫存在 Firebase Storage 中的圖片 URL
                    if (tempImageUrl) {
                        imageUrlToSet = tempImageUrl;
                    } else {
                        imageUrlToSet = parsedLocalStorageData.projectImageUrl || DEFAULT_PICTURE_URL;
                    }
                } catch (e) {
                    console.error("Error parsing localStorage data:", e);
                }
            } else {
                // 如果 localStorage 沒有，再 call API 
                try {
                    const res = await fetch(`/api/projects/${projectId}`);
                    const json = await res.json();
                    if (json.success && json.data) {
                        dataToSet = {
                            ...json.data,
                            projectTypeName: json.data.projectTypeName,
                            skillTypeNames: json.data.skillTypeNames,
                        };
                        imageUrlToSet = json.data.projectImageUrl || DEFAULT_PICTURE_URL;
                    } else {
                        console.error("Failed to fetch project from API:", json.error || "Unknown API error");
                    }
                } catch (fetchError) {
                    console.error("Error fetching project from API:", fetchError);
                }
            }

            setData(dataToSet);
            setImageUrl(imageUrlToSet);
            // 是否結案
            if (dataToSet && (dataToSet.status === "closed")) {
                setIsClosed(true);
            } else {
                setIsClosed(false);
            }
        };

        loadProjectData();
    }, [projectId]);
/*
    function getFirebaseImageUrl(url?: string) {
        if (!url) return "/project/project-image.jpg";

        // 處理Firebase Storage URL
        if (url.includes("firebasestorage.googleapis.com")) {
            if (url.includes("?alt=media")) return url;
            if (url.includes("?")) return url + "&alt=media";
            return url + "?alt=media";
        }

        if (url.startsWith("gs://")) {
            return url;
        }

        if (url.startsWith("temp/") || url.startsWith("projects/")) {
            return url;
        }

        if (url.includes("temp%2F") || url.includes("projects%2F")) {
            try {
                return decodeURIComponent(url);
            } catch (e) {
                console.warn("[WARNING] 解碼URL失敗:", e);
                return url;
            }
        }
        return url;
    }
 */
    function formatDate(date: any): string {
        if (!date) return "";
        // Firestore Timestamp 格式
        if (typeof date._seconds === "number") {
            return new Date(date._seconds * 1000).toLocaleDateString();
        }
        if (typeof date.seconds === "number") {
            return new Date(date.seconds * 1000).toLocaleDateString();
        }
        if (date instanceof Date) {
            return date.toLocaleDateString();
        }
        if (typeof date === "string") {
            return new Date(date).toLocaleDateString();
        }
        return "";
    }

    const uploadImageToProjects = async (imageUrl: string): Promise<string> => {
        console.log("[DEBUG] 開始直接上傳圖片到正式目錄:", imageUrl);
        if (!imageUrl) {
            console.warn("[警告] 沒有提供圖片URL");
            return "";
        }

        try {
            const storage = getStorage(firebaseApp);

            console.log("[DEBUG] 開始下載圖片數據...");
            const response = await fetch(imageUrl);
            if (!response.ok) {
                throw new Error(`Fetch失敗: ${response.status} ${response.statusText}`);
            }
            const blob = await response.blob();

            if (!blob || blob.size === 0) {
                throw new Error("獲取的圖片數據為空");
            }

            const originalFileName = imageUrl.split('/').pop()?.split('?')[0] || "image.jpg";
            const permanentPath = `projects/${originalFileName}`;

            console.log("[DEBUG] 產生的新檔案路徑:", permanentPath);

            // 上傳到projects目錄
            const newRef = ref(storage, permanentPath);

            console.log("[DEBUG] 開始上傳到projects目錄...");
            await uploadBytes(newRef, blob, {
                contentType: blob.type
            });

            // GET新URL
            const newImageUrl = await getDownloadURL(newRef);

            return newImageUrl;
        } catch (error: any) {
            console.error("[ERROR] 圖片上傳失敗:", error);
            throw new Error(`圖片上傳失敗: ${error.message || "未知錯誤"}`);
        }
    };

    const handlePublish = async () => {
        if (!data) {
            alert("專案資料尚未載入完成，請稍候。");
            return;
        }

        setLoading(true);

        try {
            // 讀取預覽資料
            const previewStr = typeof window !== 'undefined' ? localStorage.getItem("projectEditPreview") : null;
            if (!previewStr) {
                alert("找不到預覽資料，請重新填寫");
                setLoading(false);
                return;
            }

            const previewData = JSON.parse(previewStr);
            console.log("[DEBUG] 從localStorage載入的預覽資料:", {
                projectName: previewData.projectName,
                hasProjectImageUrl: !!previewData.projectImageUrl
            });

            let publishImageUrl = imageUrl;
            const tempUploadedImageUrl = typeof window !== 'undefined' ? localStorage.getItem("tempUploadedImageUrl") : null;

            if (tempUploadedImageUrl) {
                publishImageUrl = tempUploadedImageUrl;
            }

            console.log("[DEBUG] 初始圖片URL:", publishImageUrl);

            // 圖片上傳到projects目錄
            if (publishImageUrl) {
                console.log("[DEBUG] 開始上傳圖片到projects目錄");
                try {
                    const newImageUrl = await uploadImageToProjects(publishImageUrl);
                    publishImageUrl = newImageUrl;

                    // 清除localStorage中的暫存URL
                    if (typeof window !== 'undefined' && tempUploadedImageUrl) {
                        localStorage.removeItem("tempUploadedImageUrl");
                    }
                } catch (e: any) {
                    console.error("[ERROR] 圖片處理失敗:", e);
                }
            } else {
                console.log("[DEBUG] 沒有圖片URL，跳過圖片處理步驟");
            }

            delete previewData.projectImageUrl;

            const finalDataToPublish = {
                ...previewData,
                projectImageUrl: publishImageUrl
            };

            console.log("[DEBUG] 最終使用的圖片URL:", publishImageUrl);
            console.log("[DEBUG] 準備發布資料:", {
                projectName: finalDataToPublish.projectName,
                projectImageUrl: finalDataToPublish.projectImageUrl,
                startsWithProjects: finalDataToPublish.projectImageUrl?.includes("/projects/") || "無圖片URL"
            });

            // 呼叫API創建專案
            console.log("[DEBUG] 發送請求到/api/projects/create");
            const res = await fetch("/api/projects/create", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(finalDataToPublish),
            });
            const json = await res.json();
            if (json.success && json.projectId) {

                // 清除localStorage中的預覽資料
                if (typeof window !== 'undefined') {
                    localStorage.removeItem("projectEditPreview");
                }

                // 跳轉到發佈頁面
                window.location.href = `/projects/${json.projectId}`;
            } else {
                console.error("[ERROR] API回傳失敗:", json);
                alert("發佈失敗: " + (json.error || "請稍後再試"));
                setLoading(false);
            }
        } catch (error: any) {
            console.error("[ERROR] 發佈過程發生錯誤:", error);
            alert(`發佈過程發生錯誤: ${error.message || "未知錯誤"}`);
            setLoading(false);
        }
    };

    return (
        <div className="h-full w-full flex flex-col sm:flex-row bg-gray-50 text-gray-800 sm:justify-around" >
            {/* Sidebar */}
            < div className="mt-16" >
                <Sidebar />
            </div >

            {/* 新增專案內容 */}
            <section className="flex ml-5 sm:ml-0 pt-10 w-[70%] mr-16 min-w-[340px]">
                <div className="w-full relative bg-white rounded-2xl p-5  flex flex-col sm:w-[550px] md:w-[600px] lg:w-[900px]">
                    <div className="flex items-center m-5">
                        <div className="text-primary-blue0 text-2xl font-bold ml-3">預覽專案</div>
                    </div>
                    <div className="flex flex-col lg:flex-row justify-center">
                        <div className="flex flex-col mt-10  items-center">
                            <div className="relative flex items-start min-w-[300px] h-[200px] overflow-hidde sm:ml-10 ">
                                <img
                                    src={imageUrl || DEFAULT_PICTURE_URL}
                                    width={300}
                                    height={200}
                                    alt="pic"
                                    className="absolute top-0 left-0 w-full h-full rounded-2xl object-cover"
                                />
                            </div>
                        </div>
                        <div className="flex flex-col justify-start items-start sm:ml-20 mt-10">
                            {/* 後端需要讀取發起人已輸入的資訊 */}
                            <Info label="專案名稱" content={data?.projectName ?? ""}></Info>
                            <Info label="專案說明" content={data?.projectDescription ?? ""}></Info>
                            <Info label="專案時間" content={data?.startDate && data?.endDate ? `${formatDate(data.startDate)} - ${formatDate(data.endDate)}` : "-"} ></Info>
                            <Tag label="專案類別" content={data?.projectTypeName ? [data.projectTypeName] : []}></Tag>
                            <Tag label="技能類型" content={Array.isArray(data?.skillTypeNames) ? data.skillTypeNames : []}></Tag>
                            <Info label="專案描述" content={data?.skillDescription ?? ""}></Info>
                            <Info label="人數需求" content={data?.peopleRequired != null ? String(data.peopleRequired) : ""}></Info>
                            <Info label="發起人" content={userInfo.name ?? ""}></Info>
                            <Info label="聯繫方式" content={userInfo.email ?? ""}></Info>
                        </div>
                    </div>
                    <div className="mt-10 flex justify-center gap-5">
                        {isClosed ? null : (
                            <Link href={`/projects/${projectId}/edit`}>
                                <Button
                                    className="bg-primary-blue5 text-primary-blue2 text-lg"
                                    startContent={<EditIcon className="w-[24px] h-[24px]" />}>
                                    編輯
                                </Button>
                            </Link>
                        )}
                        <Button
                            className="bg-primary-blue2 text-white text-lg"
                            startContent={<PublishIcon />}
                            disabled={loading}
                            onPress={handlePublish}
                        >
                            發佈
                        </Button>
                    </div>
                </div>
            </section >
        </div >
    );
}
