function StatBox({ label, count }: { label: string; count: number }) {
    return (
        <div className="flex-1 flex flex-col items-center justify-center whitespace-nowrap bg-white px-6 py-4 rounded min-w-[80px] space-y-2">
            <div className="text-5xl text-primary-blue1">{count}</div>
            <div className="text-sm text-black">{label}</div>
        </div>
    );
}

export default function ProgressStats({
    total,
    accepted,
    rejected,
}: {
    total: number;
    accepted: number;
    rejected: number;

}) {
    return (

        <div className="flex items-center justify-center bg-white rounded-xl shadow p-2">
      <div className="flex flex-wrap justify-center gap-6 sm:gap-1 w-full">
      <StatBox label="申請者" count={total} />
                <StatBox label="接受" count={accepted} />
                <StatBox label="婉拒" count={rejected} />
            </div>

        </div>
    );
}
