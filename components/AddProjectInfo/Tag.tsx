// 類別 component

interface TagProps {
    label: string;
    content: string[];
}


export default function Tag({ label, content = [] }: TagProps) {
    return (
        <div className="text-lg flex justify-between mb-10 border-l-2 border-primary-blue2">
            <div className="flex items-center">
                < div className="text-lg w-[100px] font-medium text-primary-blue2 ml-5">{label}</div >
            </div >
            <div className="flex gap-2">
                {content.map((item, index) => (
                    <span key={index} className="text-primary-blue0 font-medium bg-primary-blue5 border-1 rounded-lg p-1 pr-3 pl-3 border-primary-blue0">{item}</span>
                ))}
            </div>
        </div >
    )
}
