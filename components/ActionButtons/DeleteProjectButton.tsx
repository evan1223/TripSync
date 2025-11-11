"use client";

import { useState } from "react";
import { IconTrash, IconCircleX } from "@tabler/icons-react";
import { Button } from "@heroui/button";

type DeleteProjectButtonProps = {
    onDelete: () => void;
    disabled?: boolean;
  };

export default function DeleteProjectButton({ onDelete, disabled }: DeleteProjectButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false); // 控制彈窗顯示
 
    const buttonClass = disabled
    ? "bg-white text-gray-2 border border-gray-2 cursor-not-allowed"  
    : "bg-white text-primary-blue2 border border-primary-blue2 hover:bg-gray-100";


    return (
        <>
            {/* 刪除按鈕 */}
            <div className="flex justify-end">

                <Button
                    onPress={() => setShowConfirm(true)} // 點按鈕打開彈窗
                    isDisabled={disabled}

                    className={`!p-2 !min-w-0 !h-auto rounded-md flex items-center justify-center ${buttonClass}`}
                    >
                    <IconTrash stroke={2} className="w-5 h-5" />
                </Button>



            </div>

            {/* 彈窗區塊 */}
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[300px] min-h-[225px] text-center flex flex-col justify-center space-y-6">
                        <div className="text-lg font-semibold text-black text-center space-y-4">
                            <p>刪除專案後無法復原</p>
                            <p>確定要刪除嗎？</p>
                        </div>

                        {/* 按鈕區域 */}
                        <div className="flex justify-center gap-5">
                            <Button
                                onPress={() => setShowConfirm(false)}
                                className="bg-white text-primary-blue2 border font-bold border-primary-blue2 px-4 py-2 rounded-md "
                            >
                                <IconCircleX stroke={2} className="w-5 h-5" />
                                <span>取消</span>
                            </Button>

                            <Button
                                onPress={() => {
                                    setShowConfirm(false);
                                    onDelete(); // ✅ 執行外部傳進來的刪除邏輯
                                }}
                                className="bg-[#FFEDED] text-danger px-4 py-2 font-bold rounded-md flex items-center gap-2"
                            >
                                <IconTrash stroke={2} className="w-5 h-5" />
                                <span>刪除</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
