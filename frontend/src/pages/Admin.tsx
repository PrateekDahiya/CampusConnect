import { useEffect, useMemo, useState } from "react";
import { useStore } from "../stores/useStore";
import { useAppStore } from "../stores/useAppStore";
import Button from "../components/Button";
import { useUiStore } from "../stores/useUiStore";

function StatCard({ title, value }: { title: string; value: string | number }) {
    return (
        <div className="bg-white p-4 rounded shadow-sm border">
            <div className="text-sm text-slate-500">{title}</div>
            <div className="text-2xl font-semibold mt-1">{value}</div>
        </div>
    );
}

function Sparkline({
    points,
    width = 200,
    height = 40,
}: {
    points: number[];
    width?: number;
    height?: number;
}) {
    if (!points.length) return <div className="text-slate-500">No data</div>;
    const max = Math.max(...points);
    const min = Math.min(...points);
    const range = max - min || 1;
    const step = width / (points.length - 1 || 1);
    const d = points
        .map(
            (p, i) =>
                `${i === 0 ? "M" : "L"} ${i * step} ${
                    height - ((p - min) / range) * height
                }`
        )
        .join(" ");
    return (
        <svg
            width={width}
            height={height}
            viewBox={`0 0 ${width} ${height}`}
            className="block"
        >
            <path
                d={d}
                fill="none"
                stroke="#2563eb"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}

function Donut({
    values,
    labels: _labels,
    size = 120,
}: {
    values: number[];
    labels?: string[];
    size?: number;
}) {
    const total = values.reduce((a, b) => a + b, 0) || 1;
    let angle = -90;
    const radius = size / 2;
    const stroke = 18;
    return (
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
            {values.map((v, idx) => {
                const portion = v / total;
                const dash = Math.PI * 2 * (radius - stroke / 2) * portion;
                const cx = size / 2;
                const cy = size / 2;
                const r = radius - stroke / 2;
                // use stroke-dasharray technique with rotation
                const color = ["#2563eb", "#10b981", "#f59e0b", "#ef4444"][
                    idx % 4
                ];
                const offset = (angle / 360) * Math.PI * 2 * r;
                angle += portion * 360;
                return (
                    <circle
                        key={idx}
                        r={r}
                        cx={cx}
                        cy={cy}
                        fill="transparent"
                        stroke={color}
                        strokeWidth={stroke}
                        strokeDasharray={`${dash} ${Math.PI * 2 * r - dash}`}
                        transform={`rotate(${
                            (offset * 180) / Math.PI
                        } ${cx} ${cy})`}
                        strokeLinecap="butt"
                    />
                );
            })}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={radius - stroke}
                fill="white"
            />
        </svg>
    );
}

export default function Admin() {
    const {
        lostFound,
        loadLostFound,
        approveClaim,
        complaints,
        loadComplaints,
        cycles,
        loadCycles,
        books,
        queryBooks,
    } = useStore();
    const { user } = useAppStore();

    const [, setLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);

    useEffect(() => {
        // load available collections used for admin metrics + users
        (async () => {
            try {
                setLoading(true);
                const base =
                    import.meta.env.VITE_API_URL || "http://localhost:5000/api";
                const token = localStorage.getItem("authToken");

                const fetchUsers = async () => {
                    try {
                        const res = await fetch(`${base}/users`, {
                            headers: {
                                "Content-Type": "application/json",
                                ...(token
                                    ? { Authorization: `Bearer ${token}` }
                                    : {}),
                            },
                        });
                        if (!res.ok) {
                            // ignore failure (backend may not expose users to non-admins)
                            console.warn("Failed to fetch users:", res.status);
                            return;
                        }
                        const data = await res.json();
                        if (Array.isArray(data)) setUsers(data);
                    } catch (e) {
                        console.warn("fetchUsers error:", e);
                    }
                };

                await Promise.all([
                    loadLostFound(),
                    loadComplaints(),
                    loadCycles(),
                    queryBooks(),
                    fetchUsers(),
                ]);
            } finally {
                setLoading(false);
            }
        })();
    }, []);

    const pending = lostFound.filter(
        (i: any) => i.claim && i.claim.status === "pending"
    );

    // Compute simple metrics
    const totalComplaints = complaints?.length || 0;
    const totalCycles = cycles?.length || 0;
    const totalBooks = books?.length || 0;
    const totalLostFound = lostFound?.length || 0;

    // Weekly activity: count items per day for last 7 days across resources
    const weeklyPoints = useMemo(() => {
        const days = Array.from({ length: 7 }).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            d.setHours(0, 0, 0, 0);
            return d;
        });
        const counts = days.map((d) => {
            const next = new Date(d);
            next.setDate(d.getDate() + 1);
            const inRange = (dt?: string) => {
                if (!dt) return 0;
                const t = new Date(dt);
                return t >= d && t < next ? 1 : 0;
            };
            const c = (complaints || []).reduce(
                (s: number, it: any) => s + inRange(it.createdAt),
                0
            );
            const l = (lostFound || []).reduce(
                (s: number, it: any) => s + inRange(it.createdAt),
                0
            );
            const b = (books || []).reduce(
                (s: number, it: any) => s + inRange(it.createdAt),
                0
            );
            const cy = (cycles || []).reduce(
                (s: number, it: any) =>
                    s + (it.createdAt ? inRange(it.createdAt) : 0),
                0
            );
            return c + l + b + cy;
        });
        return counts;
    }, [complaints, lostFound, books, cycles]);

    const distribution = [
        totalComplaints,
        totalLostFound,
        totalBooks,
        totalCycles,
    ];

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
            <p className="text-slate-600 mb-6">
                Overview and usage metrics (derived from loaded data).
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
                <StatCard title="Complaints" value={totalComplaints} />
                <StatCard title="Lost & Found" value={totalLostFound} />
                <StatCard title="Books" value={totalBooks} />
                <StatCard title="Cycles" value={totalCycles} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white p-4 rounded shadow-sm border">
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <div className="text-sm text-slate-500">
                                Activity (last 7 days)
                            </div>
                            <div className="text-lg font-semibold">
                                {weeklyPoints.reduce((a, b) => a + b, 0)} events
                            </div>
                        </div>
                        <div className="text-sm text-slate-500">Sparkline</div>
                    </div>
                    <Sparkline points={weeklyPoints} width={600} height={80} />
                </div>

                <div className="bg-white  p-4 rounded shadow-sm border flex flex-col items-center">
                    <div className="text-sm text-slate-500">
                        Resource Distribution
                    </div>
                    <div className="my-3">
                        <Donut values={distribution} size={140} />
                    </div>
                    <div className="text-sm w-full">
                        <div className="flex items-center justify-between">
                            <div>Complaints</div>
                            <div>{totalComplaints}</div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>Lost & Found</div>
                            <div>{totalLostFound}</div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>Books</div>
                            <div>{totalBooks}</div>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>Cycles</div>
                            <div>{totalCycles}</div>
                        </div>
                    </div>
                </div>
            </div>

            <h2 className="text-xl font-semibold mb-3">
                Pending Lost & Found Claims
            </h2>
            {pending.length === 0 && (
                <div className="text-slate-500">No pending claims</div>
            )}
            <div className="space-y-3">
                {pending.map((i: any) => (
                    <div
                        key={i.id}
                        className="p-3 border rounded flex items-start justify-between"
                    >
                        <div>
                            <div className="font-medium">{i.title}</div>
                            <div className="text-xs text-slate-500">
                                Reported by: {i.reportedBy} • {i.location}
                            </div>
                            <div className="text-sm mt-2">
                                Claim proof: {(i as any).claim?.proof}
                            </div>
                        </div>
                        <div className="flex flex-col gap-2">
                            {(user?.role === "staff" ||
                                user?.role === "admin") && (
                                <>
                                    <Button
                                        variant="primary"
                                        className="btn-sm"
                                        onClick={async () => {
                                            const ok = await useUiStore
                                                .getState()
                                                .confirmDialog(
                                                    "Approve this claim?"
                                                );
                                            if (!ok) return;
                                            try {
                                                await approveClaim(
                                                    i.id,
                                                    (i as any).claim.id,
                                                    true
                                                );
                                                useUiStore
                                                    .getState()
                                                    .notify(
                                                        "Claim approved",
                                                        "success"
                                                    );
                                                await loadLostFound();
                                            } catch (err: any) {
                                                useUiStore
                                                    .getState()
                                                    .notify(
                                                        "Failed to approve claim: " +
                                                            (err?.message ||
                                                                err),
                                                        "error"
                                                    );
                                            }
                                        }}
                                    >
                                        Approve
                                    </Button>
                                    <Button
                                        variant="danger"
                                        className="btn-sm"
                                        onClick={async () => {
                                            const ok = await useUiStore
                                                .getState()
                                                .confirmDialog(
                                                    "Reject this claim?"
                                                );
                                            if (!ok) return;
                                            try {
                                                await approveClaim(
                                                    i.id,
                                                    (i as any).claim.id,
                                                    false
                                                );
                                                useUiStore
                                                    .getState()
                                                    .notify(
                                                        "Claim rejected",
                                                        "success"
                                                    );
                                                await loadLostFound();
                                            } catch (err: any) {
                                                useUiStore
                                                    .getState()
                                                    .notify(
                                                        "Failed to reject claim: " +
                                                            (err?.message ||
                                                                err),
                                                        "error"
                                                    );
                                            }
                                        }}
                                    >
                                        Reject
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <h2 className="text-xl font-semibold mt-6 mb-3">Users</h2>
            {users.length === 0 ? (
                <div className="text-slate-500">No users found</div>
            ) : (
                <div className="overflow-x-auto bg-white p-3 rounded shadow-sm border">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-slate-500">
                                <th className="py-2">Name</th>
                                <th className="py-2">Email</th>
                                <th className="py-2">Role</th>
                                <th className="py-2">Joined</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((u: any) => (
                                <tr key={u._id || u.id} className="border-t">
                                    <td className="py-2">
                                        {u.name || u.fullName || u.email}
                                    </td>
                                    <td className="py-2">{u.email}</td>
                                    <td className="py-2">
                                        {u.role || "student"}
                                    </td>
                                    <td className="py-2">
                                        {u.createdAt
                                            ? new Date(
                                                  u.createdAt
                                              ).toLocaleDateString()
                                            : "-"}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
