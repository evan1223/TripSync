// 系統提示框含有確定和取消功能

import { Button } from "@heroui/react";


interface AlertMessage {
    onCancel?: () => void,
    onConfirm: () => void,
    title: string,
    cancel?: string,
    action: string,
    cancelIcon?: React.ReactNode,
    confirmIcon?: React.ReactNode,
}

// 可以調整，當alert只需要確認按鈕，或是同時有「取消」或「確認」
// 解構元素

export default function AlertMessage({
    onConfirm,
    onCancel,
    title,
    cancel,
    action,
    cancelIcon,
    confirmIcon,
}: AlertMessage) {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[300px] min-h-[225px] text-center flex flex-col justify-center space-y-6">
                <div className="text-lg font-semibold text-black space-y-4">{title}
                </div>
                <div className="flex justify-center gap-5">
                    {onCancel && cancel && (
                        <Button onPress={onCancel} className="bg-white text-primary-blue2 border font-bold border-primary-blue2 px-4 py-2 rounded-md" startContent={cancelIcon}>
                            {cancel}
                        </Button>
                    )}
                    <Button onPress={onConfirm} className="font-bold px-4 py-2 rounded-md flex items-center gap-2 bg-primary-blue2 text-white" startContent={confirmIcon}>
                        {action}
                    </Button>
                </div>

            </div>
        </div >
    )
}