"use client";

import { Button } from "@heroui/button";
import { IconTrash, IconCircleX } from "@tabler/icons-react";
import React from "react";

type ConfirmDialogProps = {
    open: boolean;
    onCancel: () => void;
    onConfirm: () => void;
    title?: string;
    confirmLabel?: string;
    cancelLabel?: string;
    confirmIcon?: React.ReactNode;
    confirmButtonClassName?: string;
};

export default function ConfirmDialog({
    open,
    onCancel,
    onConfirm,
    title = "",
    confirmLabel = "確認",
    cancelLabel = "取消",
    confirmIcon,
    confirmButtonClassName,
}: ConfirmDialogProps) {
    if (!open) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-[300px] min-h-[225px] text-center flex flex-col justify-center space-y-6">
                <div className="text-lg font-semibold text-black space-y-4">
                    {title && <p>{title}</p>}
                </div>

                <div className="flex justify-center gap-5">
                    <Button
                        onPress={onCancel}
                        className="bg-white text-primary-blue2 border font-bold border-primary-blue2 px-4 py-2 rounded-md"
                    >
                        <IconCircleX stroke={2} className="w-5 h-5" />
                        <span>{cancelLabel}</span>
                    </Button>

                    <Button
                        onPress={onConfirm}
                        className={`font-bold px-4 py-2 rounded-md flex items-center gap-2 ${confirmButtonClassName ?? "bg-primary-blue2 text-white px-4"
                            }`}
                    >
                        {confirmIcon}

                        <span>{confirmLabel}</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
