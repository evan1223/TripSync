"use client"
import { Input } from "@heroui/react";
import { UploadIcon } from "../icons";
import { ReactNode, CSSProperties, ChangeEvent } from "react";

interface TextInputProps {
    value?: string;
    onChange: (e: ChangeEvent<HTMLInputElement>) => void;
    label: string;
    name: string;
    placeholder?: string;
    type?: string;
    width?: string;
    endIcon?: ReactNode;
}

export default function TextInput(props: TextInputProps) {

    return (
        <div className="mb-6 flex justify-center items-center" >
            <label className="text-lg w-[105px] font-medium mr-5">{props.label}</label>
            <Input
                name={props.name}
                value={props.value}
                onChange={props.onChange}
                aria-label="text"
                maxLength={10}
                placeholder={props.placeholder}
                type={props.type}
                variant="flat"
                size="lg"
                classNames={{
                    inputWrapper: "w-[200px] md:w-[300px] lg:w-[400px]"
                }}
                endContent={props.endIcon}
            />
        </div>
    );
}

