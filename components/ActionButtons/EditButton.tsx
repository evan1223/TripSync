"use client";

import { Button } from "@heroui/button";
import { EditIcon } from "@/components/icons";

type EditButtonProps = {
  onPress: () => void;
};


export default function EditButton({ onPress }: EditButtonProps) {

  return (
    <Button
      onPress={onPress}
      className="mt-2 bg-primary-blue5 text-primary-blue2 font-bold px-4 py-2 rounded-lg flex items-center  hover:bg-primary-blue4 hover:text-white"
    >
      <EditIcon className="w-5 h-5 text-primary-blue2 group-hover:text-white transition-colors" />
      <span>編輯</span>
    </Button>
  );

}
