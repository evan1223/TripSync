import { useState } from "react";
import { IconCircleCheck, IconCircleX } from '@tabler/icons-react';
import { Button } from "@heroui/button";

type AcceptButtonProps = {
    onConfirm: () => void;
    disabled?: boolean;
    active?: boolean;
};

export default function AcceptButton({ onConfirm, disabled, active }: AcceptButtonProps) {
    const [showConfirm, setShowConfirm] = useState(false);

    const handleClick = () => {
        if (disabled) return;
        setShowConfirm(true);
    };

    const handleConfirm = () => {
        setShowConfirm(false);
        onConfirm();
    };

    const colorClass = disabled
        ? active
            ? "bg-gray-4 text-success border-gray-4"           // ✅ 接受 → 接受變綠色
            : "bg-gray-4 text-gray-3 border-gray-4"        // 婉拒 → 接受變灰色
        : "bg-primary-blue5 text-primary-blue2 border-primary-blue5"; // 🔵 初始狀態


    return (
        <div className="relative">
            <Button
                onPress={handleClick}
                isDisabled={disabled}
                className={`flex items-center gap-2 px-4 py-1 font-bold rounded border ${colorClass}`}
            >
                <IconCircleCheck stroke={2} className="w-5 h-5" />
                接受
            </Button>


            {/* 彈窗 */}
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[300px] min-h-[225px] text-center flex flex-col justify-center space-y-6">
                        <div className="text-lg font-semibold text-black text-center space-y-4">
                            <p>確定要接受嗎？</p>
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
                                <IconCircleCheck stroke={2} className="w-5 h-5" />
                                <span>接受</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )
            }



        </div >
    );
}
