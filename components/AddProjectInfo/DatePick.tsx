"use client";
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
    <div className="flex items-center">
      {/* 如果 label 是空字串，就不渲染文字，外面的 row 負責 label */}
      {props.label && (
        <label className="text-lg w-[100px] font-medium mr-3">
          {props.label}
        </label>
      )}

      {/* 自己這塊吃滿父容器給的寬度（flex-1），不去撐整行 */}
      <DatePicker
        value={props.value}
        onChange={props.onChange}
        className="w-full"
        size="lg"
        aria-label={props.name}
      />

      <input
        type="hidden"
        name={props.name}
        value={props.value ? props.value.toString() : ""}
      />
    </div>
  );
}
