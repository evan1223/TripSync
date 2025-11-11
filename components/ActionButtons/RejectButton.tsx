import { useState } from "react";
import { IconCircleX, IconBan } from '@tabler/icons-react';
import { Button } from "@heroui/button";

type RejectButtonProps = {
    onConfirm: () => void;
    disabled?: boolean;
    active?: boolean;
};

export default function RejectButton({ onConfirm, disabled, active }: RejectButtonProps) {
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
            ? "bg-gray-4 text-danger border-gray-4"          // 婉拒 → 婉拒變紅色
            : "bg-gray-4 text-gray-3 border-gray-4"       // 接受 → 接受變灰色
        : "bg-gray-4 text-primary-blue2 border-primary-blue2"; // 🔵 初始狀態

    return (
        <div className="relative">
            <Button
                onPress={handleClick}
                isDisabled={disabled}
                className={`flex items-center gap-2 px-4 py-1 font-bold rounded border ${colorClass}`}
            >
                <IconBan stroke={2} className="w-5 h-5" />
                婉拒
            </Button>

            {/* 彈窗 */}
            {showConfirm && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white rounded-lg shadow-lg p-6 w-[300px] min-h-[225px] text-center flex flex-col justify-center space-y-6">
                        <div className="text-lg font-semibold text-black text-center space-y-4">
                            <p>確定要婉拒嗎？</p>
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
                                <IconBan stroke={2} className="w-5 h-5" />
                                <span>婉拒</span>
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
