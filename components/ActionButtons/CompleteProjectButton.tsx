"use client";

import { useState } from "react";
import { Button } from "@heroui/button";
import { IconArchive, IconCircleX } from "@tabler/icons-react";

type CompleteProjectButtonProps = {
  onComplete: () => void;
  disabled?: boolean;
};

export default function CompleteProjectButton({ onComplete, disabled }: CompleteProjectButtonProps) {
  const [showConfirm, setShowConfirm] = useState(false);

  const handleConfirm = () => {
    setShowConfirm(false);
    onComplete(); // ✅ 執行傳入邏輯
  };

  const buttonClass = disabled
    ? "bg-primary-blue4 text-white border-primary-blue4 cursor-not-allowed"  // 灰色禁用
    : "bg-primary-blue2 text-white hover:bg-primary-blue3 border-transparent";  // 藍色正常


  return (
    <>
      {/* 結案按鈕 */}
      <div className="flex justify-end">
        <Button
          onPress={() => setShowConfirm(true)}
          isDisabled={disabled}
          className={`font-bold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border ${buttonClass}`}
        >
          <IconArchive stroke={2} className="w-5 h-5" />
          <span>結案</span>
        </Button>
      </div>

      {/* 彈窗 */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[300px] min-h-[225px] text-center flex flex-col justify-center space-y-6">
            <div className="text-lg font-semibold text-black text-center space-y-4">
              <p>確定要結案嗎？</p>
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
                onPress={handleConfirm}
                className="bg-primary-blue2 text-white px-4 py-2 font-bold rounded-md flex items-center gap-2"
              >
                <IconArchive stroke={2} className="w-5 h-5" />
                <span>結案</span>
              </Button>
            </div>
          </div>
        </div>
      )}


    </>
  );
}
