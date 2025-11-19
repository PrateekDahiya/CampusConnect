export default function StatusBadge({ status }: { status: string }) {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";
    const s = (status || "").toString();
    const key = s.trim().toLowerCase();

    if (key === "pending")
        return (
            <span className={`${base} bg-yellow-100 text-yellow-800`}>{s}</span>
        );
    if (key === "in progress" || key === "inprogress" || key === "in-progress")
        return <span className={`${base} bg-blue-100 text-blue-800`}>{s}</span>;
    if (key === "rejected" || key === "cancelled" || key === "cancel")
        return <span className={`${base} bg-red-100 text-red-800`}>{s}</span>;
    if (key === "resolved" || key === "done" || key === "completed")
        return (
            <span className={`${base} bg-green-100 text-green-800`}>{s}</span>
        );
    if (key === "active" || key === "available")
        return (
            <span className={`${base} bg-green-50 text-green-700`}>{s}</span>
        );
    if (key === "returned")
        return (
            <span className={`${base} bg-yellow-100 text-yellow-800`}>{s}</span>
        );

    return <span className={`${base} bg-slate-100 text-slate-700`}>{s}</span>;
}
