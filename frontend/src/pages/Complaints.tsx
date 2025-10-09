import { useEffect, useState } from "react";
import { useStore } from "../stores/useStore";

export default function Complaints() {
    const { complaints, loadComplaints, addComplaint, updateStatus, loading } =
        useStore();
    const [category, setCategory] = useState("General");
    const [description, setDescription] = useState("");

    useEffect(() => {
        loadComplaints();
    }, []);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;
        await addComplaint({ category, description });
        setDescription("");
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Hostel Complaint Box</h1>
            <p className="text-slate-600 mb-6">
                Submit and track complaints here (UI only).
            </p>

            <form onSubmit={onSubmit} className="mb-6 space-y-3">
                <div className="flex gap-2">
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="px-3 py-2 border rounded"
                    >
                        <option>General</option>
                        <option>Plumbing</option>
                        <option>Electricity</option>
                        <option>Housekeeping</option>
                    </select>
                    <button
                        type="submit"
                        className="px-4 py-2 bg-sky-600 text-white rounded"
                    >
                        Submit
                    </button>
                </div>
                <div>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full border rounded p-2"
                        placeholder="Describe the issue..."
                    />
                </div>
            </form>

            <section>
                <h2 className="text-lg font-semibold mb-3">
                    Recent Complaints
                </h2>
                {loading && (
                    <div className="text-sm text-slate-500 mb-2">
                        Loading...
                    </div>
                )}
                <ul className="space-y-3">
                    {complaints.map((c) => (
                        <li
                            key={c.id}
                            className="p-3 bg-white border rounded shadow-sm flex items-start justify-between"
                        >
                            <div>
                                <div className="font-medium">{c.category}</div>
                                <div className="text-sm text-slate-600">
                                    {c.description}
                                </div>
                                <div className="text-xs text-slate-400 mt-1">
                                    {new Date(c.createdAt).toLocaleString()}
                                </div>
                            </div>
                            <div className="text-right space-y-2">
                                <div
                                    className={`px-2 py-1 rounded-full text-xs ${
                                        c.status === "Pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : c.status === "In Progress"
                                            ? "bg-blue-100 text-blue-800"
                                            : "bg-green-100 text-green-800"
                                    }`}
                                >
                                    {c.status}
                                </div>
                                <div className="flex gap-2">
                                    {c.status !== "Resolved" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(c.id, "Resolved")
                                            }
                                            className="text-sm text-slate-600 underline"
                                        >
                                            Mark Resolved
                                        </button>
                                    )}
                                    {c.status === "Pending" && (
                                        <button
                                            onClick={() =>
                                                updateStatus(
                                                    c.id,
                                                    "In Progress"
                                                )
                                            }
                                            className="text-sm text-slate-600 underline"
                                        >
                                            Start
                                        </button>
                                    )}
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>
        </div>
    );
}
