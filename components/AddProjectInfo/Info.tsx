// 預覽專案 Components

interface InfoProps {
  label: string;
  content: string;
}
export default function Info({ label, content = "" }: InfoProps) {
  return (
    <div className="text-lg flex justify-between mb-10 border-l-2 border-primary-blue2">
      <div className="flex items-center h-auto">
        <div className="text-lg w-[100px] font-medium text-primary-blue2 ml-5">
          {" "}
          {label}
        </div>
      </div>
      <div className="text-primary-blue0 font-semibold w-[300px] break-words">
        {content}
      </div>
    </div>
  );
}
