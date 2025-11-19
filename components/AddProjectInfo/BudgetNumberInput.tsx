"use client";

import { Input } from "@heroui/react";

interface BudgetNumberInputProps {
  label: string;
  value: string;
  name: string;
  onChange: (value: string) => void;
}

export default function BudgetNumberInput({
  label,
  value,
  name,
  onChange,
}: BudgetNumberInputProps) {
  return (
    <div className="mb-6 flex items-center">
      {/* label 跟其他欄位一樣寬 */}
      <label className="text-lg w-[105px] font-medium mr-5 whitespace-nowrap">
        {label}
      </label>

      <div className="flex-1 min-w-0">
        <Input
          name={name}
          type="number"
          inputMode="numeric"
          aria-label="budget"
          variant="flat"
          size="lg"
          value={value}
          placeholder="請輸入預算金額"
          classNames={{
            inputWrapper: "w-full",
          }}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
    </div>
  );
}
