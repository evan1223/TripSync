"use client"
import { Input } from "@heroui/react";
import { ReactNode, ChangeEvent } from "react";

interface TextInputProps {
  value?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  label: string;
  name: string;
  placeholder?: string;
  type?: string;
  endIcon?: ReactNode;
}

export default function TextInput(props: TextInputProps) {
  return (
    <div className="mb-6 flex items-center">
      
      {/* 左側 Label 固定寬度 */}
      <label className="text-lg w-[105px] font-medium mr-5 whitespace-nowrap">
        {props.label}
      </label>

      {/* 右側 Input：吃滿剩餘空間 */}
      <div className="flex-1 min-w-0">
        <Input
          name={props.name}
          value={props.value}
          onChange={props.onChange}
          aria-label="text"
          placeholder={props.placeholder}
          type={props.type}
          variant="flat"
          size="lg"
          maxLength={10}
          classNames={{
            inputWrapper: "w-full",   // <-- 關鍵：自動寬度、完整 RWD！
          }}
          endContent={props.endIcon}
        />
      </div>

    </div>
  );
}
