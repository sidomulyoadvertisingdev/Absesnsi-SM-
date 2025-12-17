export default function SummaryCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="bg-[#1a3b52] p-4 rounded-xl text-center shadow">
      <div className="text-xl font-bold text-orange-400">{value}</div>
      <div className="text-sm text-gray-300 mt-1">{label}</div>
    </div>
  );
}
