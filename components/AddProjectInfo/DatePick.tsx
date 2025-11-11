"use client"
import { DatePicker } from "@heroui/react";
import { parseDate, CalendarDate } from "@internationalized/date";

interface DatePickProps {
    label: string;
    value: CalendarDate | null;
    onChange: (date: CalendarDate | null) => void;
    name: string;
}

export default function DatePick(props: DatePickProps) {
    return (
        <div className="mb-6 flex justify-start items-center mr-3">
            <label className="text-lg w-[100px] font-medium">{props.label}</label>
            <DatePicker
                value={props.value}
                onChange={props.onChange}
                className="w-[200px] md:w-[300px] lg:w-[145px]"
                size="lg"
                aria-label="date"
            />
            <input type="hidden" name={props.name} value={props.value ? props.value.toString() : ""} />
        </div>
    );
}
