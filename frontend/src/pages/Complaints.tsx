import { useEffect, useState, useRef } from "react";
import { useStore } from "../stores/useStore";
import Button from "../components/Button";
import Card from "../components/Card";

function StatusBadge({ status }: { status: string }) {
    const base = "px-3 py-1 rounded-full text-xs font-semibold";
    if (status === "Pending")
        return (
            <span className={base + " bg-yellow-100 text-yellow-800"}>
                {status}
            </span>
        );
    if (status === "In Progress")
        return (
            <span className={base + " bg-blue-100 text-blue-800"}>
                {status}
            </span>
        );
    return (
        <span className={base + " bg-green-100 text-green-800"}>{status}</span>
    );
}

export default function Complaints() {
    const { complaints, loadComplaints, addComplaint, updateStatus, loading } =
        useStore();
    const { addRemark, assignStaff, setSatisfaction } = useStore();
    // ...existing code...
    const [title, setTitle] = useState("");
    const [hostel, setHostel] = useState("Hostel A");
    const [complaintType, setComplaintType] = useState("Maintenance");
    const [roomNumber, setRoomNumber] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [query, setQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("");

    useEffect(() => {
        loadComplaints();
    }, []);

    const onFile = (f?: File) => {
        if (!f) return setImage(null);
        const reader = new FileReader();
        reader.onload = () => setImage(String(reader.result));
        reader.readAsDataURL(f);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;
        await addComplaint({
            title: title || description.slice(0, 30),
            hostel,
            complaintType,
            roomNumber,
            description,
            attachments: image ? [image] : [],
            createdBy: "user1",
        });
        setTitle("");
        setDescription("");
        setImage(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Hostel Complaint Box</h1>
                    <p className="text-slate-600">
                        Submit and track complaints quickly.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <form
                    onSubmit={onSubmit}
                    className="lg:col-span-1 bg-white p-6 rounded shadow"
                >
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Title
                    </label>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full border rounded px-3 py-2 mb-4"
                        placeholder="Short title of the issue"
                    />

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Complaint Type
                    </label>
                    <select
                        value={complaintType}
                        onChange={(e) => setComplaintType(e.target.value)}
                        className="w-full border rounded px-3 py-2 mb-4"
                    >
                        <option>Maintenance</option>
                        <option>Electrical</option>
                        <option>Plumbing</option>
                        <option>Hygiene</option>
                        <option>Food</option>
                        <option>Internet</option>
                        <option>Other</option>
                    </select>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Hostel
                    </label>
                    <select
                        value={hostel}
                        onChange={(e) => setHostel(e.target.value)}
                        className="w-full border rounded px-3 py-2 mb-4"
                    >
                        <option>Hostel A</option>
                        <option>Hostel B</option>
                        <option>Hostel C</option>
                    </select>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Room Number
                    </label>
                    <input
                        value={roomNumber}
                        onChange={(e) => setRoomNumber(e.target.value)}
                        className="w-full border rounded px-3 py-2 mb-4"
                        placeholder="e.g. 101"
                    />

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={5}
                        className="w-full border rounded p-3 mb-4"
                        placeholder="Describe the issue in detail..."
                    />

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Image (optional)
                    </label>
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        onChange={(ev) => onFile(ev.target.files?.[0])}
                        className="mb-3"
                    />
                    {image && (
                        <img
                            src={image}
                            alt="preview"
                            className="mb-3 w-full h-48 object-cover rounded"
                        />
                    )}

                    <div className="flex gap-2">
                        <Button type="submit" variant="primary">
                            Submit Complaint
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setDescription("");
                                setImage(null);
                                if (fileRef.current) fileRef.current.value = "";
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </form>

                <div className="lg:col-span-2">
                    <div className="flex items-center gap-2 mb-4">
                        <input
                            className="border rounded px-3 py-2 flex-1"
                            placeholder="Search complaints"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="border rounded px-3 py-2"
                        >
                            <option value="">All</option>
                            <option>Pending</option>
                            <option>In Progress</option>
                            <option>Resolved</option>
                            <option>Rejected</option>
                        </select>
                        <Button
                            variant="ghost"
                            onClick={() => {
                                if (query || filterStatus) {
                                    loadComplaints();
                                    setQuery("");
                                    setFilterStatus("");
                                }
                            }}
                        >
                            Clear
                        </Button>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">
                            Recent Complaints
                        </h2>
                        <div className="text-sm text-slate-500">
                            {loading
                                ? "Loading..."
                                : `${complaints.length} total`}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {complaints
                            .filter((c) =>
                                query
                                    ? (c.title + " " + c.description)
                                          .toLowerCase()
                                          .includes(query.toLowerCase())
                                    : true
                            )
                            .filter((c) =>
                                filterStatus ? c.status === filterStatus : true
                            )
                            .map((c) => (
                                <Card
                                    key={c.id}
                                    className="flex gap-4 items-start"
                                >
                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="text-sm font-semibold">
                                                    {c.title}
                                                </div>
                                                <div className="text-xs text-slate-400">
                                                    {c.complaintType
                                                        ? c.complaintType +
                                                          " • "
                                                        : ""}
                                                    {c.hostel} •{" "}
                                                    {c.roomNumber
                                                        ? "Room " +
                                                          c.roomNumber +
                                                          " • "
                                                        : ""}
                                                    {new Date(
                                                        c.createdAt
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                            <div>
                                                <StatusBadge
                                                    status={c.status}
                                                />
                                            </div>
                                        </div>
                                        <p className="mt-2 text-slate-700">
                                            {c.description}
                                        </p>
                                        {c.remarks && c.remarks.length > 0 && (
                                            <div className="text-xs text-slate-500 mt-2">
                                                Remarks:{" "}
                                                {c.remarks
                                                    .map((r) => r.text)
                                                    .join("; ")}
                                            </div>
                                        )}
                                        {c.createdBy && (
                                            <div className="text-xs text-slate-500 mt-2">
                                                Reported by: {c.createdBy}
                                            </div>
                                        )}
                                    </div>
                                    <div className="w-36 flex flex-col items-end gap-2">
                                        {c.attachments && c.attachments[0] && (
                                            <img
                                                src={c.attachments[0]}
                                                alt="attached"
                                                className="w-24 h-24 object-cover rounded"
                                            />
                                        )}
                                        <div className="flex gap-2">
                                            {c.status !== "Resolved" && (
                                                <Button
                                                    variant="secondary"
                                                    className="btn-sm"
                                                    onClick={() =>
                                                        updateStatus(
                                                            c.id,
                                                            "Resolved"
                                                        )
                                                    }
                                                >
                                                    Mark Resolved
                                                </Button>
                                            )}
                                            {c.status === "Pending" && (
                                                <Button
                                                    variant="ghost"
                                                    className="btn-sm"
                                                    onClick={() =>
                                                        updateStatus(
                                                            c.id,
                                                            "In Progress"
                                                        )
                                                    }
                                                >
                                                    Start
                                                </Button>
                                            )}
                                            <Button
                                                variant="danger"
                                                className="btn-sm"
                                                onClick={() =>
                                                    updateStatus(
                                                        c.id,
                                                        "Rejected"
                                                    )
                                                }
                                            >
                                                Reject
                                            </Button>
                                        </div>
                                        <div className="flex gap-2 mt-2">
                                            <Button
                                                variant="ghost"
                                                className="btn-sm"
                                                onClick={async () => {
                                                    const text =
                                                        prompt("Add remark");
                                                    if (text)
                                                        await addRemark(
                                                            c.id,
                                                            text
                                                        );
                                                }}
                                            >
                                                Add Remark
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                className="btn-sm"
                                                onClick={async () => {
                                                    const staff =
                                                        prompt(
                                                            "Assign staff id"
                                                        );
                                                    if (staff)
                                                        await assignStaff(
                                                            c.id,
                                                            staff
                                                        );
                                                }}
                                            >
                                                Assign
                                            </Button>
                                            {c.status === "Resolved" && (
                                                <div className="flex gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        className="btn-sm"
                                                        onClick={() =>
                                                            setSatisfaction(
                                                                c.id,
                                                                "yes"
                                                            )
                                                        }
                                                    >
                                                        Satisfied
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        className="btn-sm"
                                                        onClick={() =>
                                                            setSatisfaction(
                                                                c.id,
                                                                "no"
                                                            )
                                                        }
                                                    >
                                                        Not satisfied
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
