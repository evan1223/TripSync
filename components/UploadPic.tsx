// 這是上傳圖片的component

import { useState } from "react";
import { CloseIcon, UploadIcon } from "./icons"

interface UploadPicProps {
    onUploadSuccess: (file: File) => void;
    onClose: () => void;
}

export default function UploadPic({ onUploadSuccess, onClose }: UploadPicProps){
    const [preview, setPreview] = useState<string | null>(null);
    
    const close = () => {
        setPreview(null);
        onClose();
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            alert('檔案太大了，請選擇小於 5MB 的圖片');
            return;
        }

        //預覽
        const reader = new FileReader();
        reader.onloadend = () => {
            setPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
        onUploadSuccess(file);

    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl p-8 w-96 space-y-6">

                <div className="flex flex-col space-y-3">
                    <div className="flex justify-between">
                        <div className="flex justify-center items-center">
                            <div className="w-12 h-12 rounded-full border border-[#A9ACB4] flex items-center justify-center">
                                <UploadIcon />
                            </div>
                            <h2 className="text-xl font-bold ml-5">上傳圖片</h2>
                        </div>
                        <div className="flex items-start">
                            <button onClick={close}><CloseIcon /></button>
                        </div>
                    </div>
                    {/* 灰色分隔線 */}
                    <div className="border-t border-54575C w-full my-4" />
                </div>

                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center justify-center space-y-4">
                    <UploadIcon />
                    <h2 className="text-xl font-bold">上傳圖片</h2>
                    <p className="text-gray-500 text-sm">JPEG, PNG format, up to 5MB</p>
                    <input
                        type="file"
                        accept="image/jpeg, image/png"
                        onChange={handleFileChange}
                        className="hidden"
                        id="upload"
                    />
                    <label
                        htmlFor="upload"
                        className="cursor-pointer px-4 py-2 border border-54575C text-54575C rounded-lg hover:bg-blue-50"
                    >
                        選擇圖片
                    </label>
                </div>

            </div>
        </div>
    )
}
