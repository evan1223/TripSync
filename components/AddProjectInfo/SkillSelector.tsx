// components/AddProjectInfo/SkillSelector.tsx

'use client';

import React, { useState, useMemo, useEffect, useRef } from "react"; // 引入 useRef
import {
    Dropdown,
    DropdownTrigger,
    DropdownMenu,
    DropdownItem,
    Button
} from "@heroui/react";
import { MinusIcon, PlusIcon } from "@/components/icons";

interface DropdownSelectorProps {
    label: string;
    selectedKeys: Set<string>;
    onSelectionChange: (keys: Set<string>) => void;
    onAdd: () => void;
    onRemove: () => void;
    disableAdd: boolean;
    disableRemove: boolean;
}

interface DropdownSelectorGroupProps {
    value: string[];
    onChange: (arr: string[]) => void;
}

function DropdownSelector({
    label,
    selectedKeys,
    onSelectionChange,
    onAdd,
    onRemove,
    disableAdd,
    disableRemove,
}: DropdownSelectorProps) {
    const selectedValue = useMemo(() => {
        return Array.from(selectedKeys).join(", ").replace(/_/g, "");
    }, [selectedKeys]);

    return (
        <div className="mb-5 flex items-center">
            <label className="text-lg w-[100px] font-medium">{label}</label>
            <Dropdown>
                <DropdownTrigger>
                    <Button className="w-[130px] md:w-[220px] lg:w-[320px] text-md" variant="bordered">
                        {selectedValue}
                    </Button>
                </DropdownTrigger>
                <DropdownMenu
                    disallowEmptySelection
                    aria-label="Single selection example"
                    selectedKeys={selectedKeys}
                    selectionMode="single"
                    variant="flat"
                    onSelectionChange={(keys) => onSelectionChange(new Set(keys as Set<string>))}
                    className="w-[20px] sm:w-[400px]"
                >
                    <DropdownItem key="設計">設計</DropdownItem>
                    <DropdownItem key="前端">前端</DropdownItem>
                    <DropdownItem key="後端">後端</DropdownItem>
                    <DropdownItem key="PM">PM</DropdownItem>
                    <DropdownItem key="其他">其他</DropdownItem>
                </DropdownMenu>
            </Dropdown>
            <div className="flex">
                <Button
                    onPress={onRemove}
                    isDisabled={disableRemove}
                    variant="light"
                    isIconOnly
                >
                    <MinusIcon />
                </Button>
                <Button
                    onPress={onAdd}
                    isDisabled={disableAdd}
                    variant="light"
                    isIconOnly
                >
                    <PlusIcon />
                </Button>
            </div>
        </div>
    );
}

export default function DropdownSelectorGroup({ value, onChange }: DropdownSelectorGroupProps) {
    const [selectors, setSelectors] = useState<{ id: number, selectedKeys: Set<string> }[]>([]);
    const isSyncingFromOutside = useRef(false);

    // 外部 value 變動時同步 selectors
    useEffect(() => {
        // 只在 value 跟目前 selectors 不同時才同步
        const currentValues = selectors.map(sel => Array.from(sel.selectedKeys)[0]).filter(v => v && v !== "請選擇技術類型");
        if (JSON.stringify(currentValues) !== JSON.stringify(value)) {
            isSyncingFromOutside.current = true;
            const valueAsSelectors = Array.isArray(value) && value.length > 0 && value.some(v => v && v !== "請選擇技術類型")
                ? value.map((v, i) => ({
                    id: Date.now() + i,
                    selectedKeys: new Set([v])
                }))
                : [{ id: Date.now(), selectedKeys: new Set(["請選擇技術類型"]) }];
            setSelectors(valueAsSelectors);
        }
        // eslint-disable-next-line
    }, [value]);

    useEffect(() => {
        // 避免外部同步時觸發 onChange 造成 loop
        if (isSyncingFromOutside.current) {
            isSyncingFromOutside.current = false;
            return;
        }
        const currentValues = selectors
            .map(sel => Array.from(sel.selectedKeys)[0])
            .filter(v => v && v !== "請選擇技術類型");
        if (JSON.stringify(currentValues) !== JSON.stringify(value)) {
            onChange(currentValues);
        }
    }, [selectors, value, onChange]);

    // Helper function to emit changes
    // 此函數不再直接在 useEffect 中，只在用戶互動觸發的函數中調用
    const handleSelectorsChange = (updatedSelectors: { id: number, selectedKeys: Set<string> }[]) => {
        setSelectors(updatedSelectors);
        // setState 後，useEffect([selectors]) 會觸發 onChange
    };


    const addSelectorAt = (index: number) => {
        if (selectors.length >= 5) return;
        const newSelector = { id: Date.now(), selectedKeys: new Set(["請選擇技術類型"]) };
        const updated = [...selectors];
        updated.splice(index + 1, 0, newSelector);
        handleSelectorsChange(updated);
    };

    const removeSelectorAt = (index: number) => {
        if (selectors.length <= 1) return;
        const updated = selectors.filter((_, i) => i !== index);
        handleSelectorsChange(updated);
    };

    const updateSelector = (index: number, keys: Set<string>) => {
        const updated = [...selectors];
        updated[index] = { ...updated[index], selectedKeys: keys };
        handleSelectorsChange(updated);
    };

    return (
        <div>
            {selectors.map((selector, index) => (
                <DropdownSelector
                    key={selector.id}
                    label="技術類型"
                    selectedKeys={selector.selectedKeys}
                    onSelectionChange={(keys) => updateSelector(index, keys)}
                    onAdd={() => addSelectorAt(index)}
                    onRemove={() => removeSelectorAt(index)}
                    disableAdd={selectors.length >= 5}
                    disableRemove={selectors.length <= 1}
                />
            ))}
            {/* 隱藏欄位 */}
            {selectors.map((selector) =>
                Array.from(selector.selectedKeys).map((value) =>
                    value !== "請選擇技術類型" ? (
                        <input
                            key={`${selector.id}-${value}`}
                            type="hidden"
                            name="skillTypeNames"
                            value={value}
                        />
                    ) : null
                )
            )}
        </div>
    );
}
