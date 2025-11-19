"use client"

import { Textarea } from "@heroui/react";
import { ChangeEvent } from "react";

interface TextAreaProps {
  label: string;
  value?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  name: string;
  placeholder: string;
}

export default function TextArea(props: TextAreaProps) {
  return (
    <div className="mb-6 flex items-start">
      
      {/* 左側 label 固定寬度 */}
      <label className="text-lg w-[105px] font-medium mr-5 whitespace-nowrap">
        {props.label}
      </label>

      {/* 右側 textarea（自適應寬度） */}
      <div className="flex-1 min-w-0">
        <Textarea
          name={props.name}
          value={props.value}
          onChange={props.onChange}
          aria-label="text"
          placeholder={props.placeholder}
          maxLength={100}
          variant="flat"
          size="lg"
          classNames={{
            inputWrapper: "w-full",   // ← 讓寬度完全吃滿，不會固定尺寸
          }}
        />
      </div>

    </div>
  );
}
