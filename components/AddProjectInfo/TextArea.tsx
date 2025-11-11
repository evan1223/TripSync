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
        <div className="mb-6 flex justify-center items-center">
            <label className="text-lg w-[105px] font-medium mr-5">{props.label}</label>
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
                    inputWrapper: "w-[200px] md:w-[300px] lg:w-[400px]"
                }}
            />
        </div>
    );
}
