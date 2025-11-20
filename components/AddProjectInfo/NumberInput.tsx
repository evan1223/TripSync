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
    <div className="mb-6 flex items-center">
      
      {/* label 固定寬度 */}
      <label className="text-lg w-[105px] font-medium mr-5 whitespace-nowrap">
        {label}
      </label>

      {/* input 吃掉剩餘所有空間 */}
      <div className="flex-1 min-w-0">
        <Input
          name={name}
          value={value}
          onChange={onChange}
          aria-label="number"
          placeholder="請輸入至少 1 人，最多 99 人"
          type="number"
          variant="flat"
          size="lg"
          max={100}
          min={1}
          classNames={{
            inputWrapper: "w-full",    // ← 完全 RWD，這才是關鍵！
          }}
        />
      </div>
    </div>
  );
}
