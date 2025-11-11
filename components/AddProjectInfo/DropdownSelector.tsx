'use client';

import React, { useState, useMemo } from "react";
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button
} from "@heroui/react";


interface DropdownSelectorProps {
    label: string;
    name: string;
    value: string;
    onChange: (value: string) => void;
}

export default function DropdownSelector({ label, name, value, onChange }: DropdownSelectorProps) {
    const selectedKeys = useMemo(() => new Set([value || "請選擇專案類型"]), [value]);

    return (
        <div className="mb-6">
            <label className="text-lg w-[100px] font-medium mr-7">{label}</label>
            <Dropdown>
                <DropdownTrigger>
                    <Button className="w-[190px] md:w-[300px] lg:w-[400px] text-md" variant="bordered">
                        {value || "請選擇專案類型"}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    disallowEmptySelection
                    aria-label="Single selection example"
                    selectedKeys={selectedKeys}
                    selectionMode="single"
                    variant="flat"
                    onSelectionChange={keys => {
                        const picked = Array.from(keys)[0] as string;
                        onChange(picked);
                    }}
                    className=" w-[200px] md:w-[300px] lg:w-[400px]"
                >
                    <DropdownItem key="校園競賽">校園競賽</DropdownItem>
                    <DropdownItem key="商業競賽">商業競賽</DropdownItem>
                    <DropdownItem key="公家單位">公家單位</DropdownItem>
                    <DropdownItem key="企業提案">企業提案</DropdownItem>
                    <DropdownItem key="其他">其他</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <input type="hidden" name={name} value={value} />
        </div >
    );
}
