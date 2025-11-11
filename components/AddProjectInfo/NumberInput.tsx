"use client"
import { Input } from "@heroui/react";
import { ChangeEvent } from "react";

interface NumberInputProps {
    label: string;
    value: string;
    name: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}


export default function NumberInput({ label, value, name, onChange }: NumberInputProps) {

    return (
        <div className="mb-6 flex justify-center items-center">
            <label className="text-lg w-[105px] font-medium mr-5">{label}</label>
            <Input
                name={name}
                value={value}
                onChange={onChange}
                aria-label="number"
                max={100}
                min={1}
                placeholder="請輸入至少 1 人，最多 99 人"
                type="number"
                variant="flat"
                size="lg"
                classNames={{
                    inputWrapper: "w-[200px] md:w-[300px] lg:w-[400px]"
                }}
            />
        </div>
    );
}
