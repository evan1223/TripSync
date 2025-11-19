"use client"
import { DatePicker } from "@heroui/react";
import { CalendarDate } from "@internationalized/date";

interface DatePickProps {
  label: string;
  value: CalendarDate | null;
  onChange: (date: CalendarDate | null) => void;
  name: string;
}

export default function DatePick(props: DatePickProps) {
  return (
    <div className="mb-6 flex items-center flex-1 min-w-0">
      
      {/* 左側 label（固定寬度） */}
      <label className="text-lg w-[105px] font-medium mr-5 whitespace-nowrap">
        {props.label}
      </label>

      {/* DatePicker 全部寬度 RWD */}
      <div className="flex-1 min-w-0">
        <DatePicker
          value={props.value}
          onChange={props.onChange}
          aria-label="date"
          size="lg"
          className="w-full"     // <--- 關鍵！！！
        />
      </div>

      <input 
        type="hidden" 
        name={props.name} 
        value={props.value ? props.value.toString() : ""} 
      />
    </div>
  );
}
