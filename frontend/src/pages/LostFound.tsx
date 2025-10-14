import { useEffect, useState, useRef } from "react";
import { useStore } from "../stores/useStore";
import Card from "../components/Card";
import Button from "../components/Button";

export default function LostFound() {
    const {
        lostFound,
        loadLostFound,
        addLostItem,
        markFound,
        loading,
        queryLostFound,
        findMatches,
        claimItem,
    } = useStore();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Personal");
    const [reportType, setReportType] = useState<"lost" | "found">("lost");
    const [description, setDescription] = useState("");
    const [dateTime, setDateTime] = useState<string | undefined>(undefined);
    const [contact, setContact] = useState("");
    const [location, setLocation] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        loadLostFound();
    }, []);

    const onFile = (f?: File) => {
        if (!f) return setImage(null);
        const r = new FileReader();
        r.onload = () => setImage(String(r.result));
        r.readAsDataURL(f);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;
        await addLostItem({
            title,
            category,
            description,
            location,
            image: image || undefined,
            reportedBy: "user1",
            found: reportType === "found",
        });
        setTitle("");
        setDescription("");
        setLocation("");
        setImage(null);
        if (fileRef.current) fileRef.current.value = "";
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Lost &amp; Found</h1>
                <p className="text-slate-600">
                    Report lost items or mark found items.
                </p>
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
                    />

                    <div className="mb-3 flex gap-2 items-center">
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="reportType"
                                checked={reportType === "lost"}
                                onChange={() => setReportType("lost")}
                            />
                            <span className="text-sm">Report Lost</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input
                                type="radio"
                                name="reportType"
                                checked={reportType === "found"}
                                onChange={() => setReportType("found")}
                            />
                            <span className="text-sm">Report Found</span>
                        </label>
                    </div>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Category
                    </label>
                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full border rounded px-3 py-2 mb-4"
                    >
                        <option>Personal</option>
                        <option>Electronics</option>
                        <option>Documents</option>
                        <option>Clothing</option>
                        <option>Other</option>
                    </select>

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Date &amp; time{" "}
                        {reportType === "lost" ? "lost" : "found"}
                    </label>
                    <input
                        type="datetime-local"
                        value={dateTime || ""}
                        onChange={(e) => setDateTime(e.target.value)}
                        className="w-full border rounded px-3 py-2 mb-4"
                    />

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Contact info (email or phone)
                    </label>
                    <input
                        value={contact}
                        onChange={(e) => setContact(e.target.value)}
                        className="w-full border rounded px-3 py-2 mb-4"
                    />

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Location
                    </label>
                    <input
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full border rounded px-3 py-2 mb-4"
                    />

                    <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={4}
                        className="w-full border rounded p-3 mb-4"
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
                            className="mb-3 w-full h-40 object-cover rounded"
                        />
                    )}

                    <div className="flex gap-2">
                        <Button type="submit" variant="primary">
                            Report Item
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => {
                                setTitle("");
                                setDescription("");
                                setLocation("");
                                setImage(null);
                                if (fileRef.current) fileRef.current.value = "";
                            }}
                        >
                            Reset
                        </Button>
                    </div>
                </form>

                <div className="lg:col-span-2">
                    <div className="mb-4 flex items-center gap-3">
                        <input
                            placeholder="Search"
                            className="input input-sm input-bordered"
                            onChange={(e) =>
                                queryLostFound({ q: e.target.value })
                            }
                        />
                        <select
                            className="select select-sm"
                            onChange={(e) =>
                                queryLostFound({
                                    category: e.target.value || undefined,
                                })
                            }
                        >
                            <option value="">All categories</option>
                            <option>Personal</option>
                            <option>Electronics</option>
                            <option>Documents</option>
                            <option>Clothing</option>
                            <option>Other</option>
                        </select>
                        <select
                            className="select select-sm"
                            onChange={(e) =>
                                queryLostFound({ sort: e.target.value as any })
                            }
                        >
                            <option value="newest">Newest</option>
                            <option value="oldest">Oldest</option>
                        </select>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold">
                            Recent Reports
                        </h2>
                        <div className="text-sm text-slate-500">
                            {loading
                                ? "Loading..."
                                : `${lostFound.length} total`}
                        </div>
                    </div>

                    <div className="space-y-4">
                        {lostFound.map((i) => (
                            <Card key={i.id} className="flex items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm font-semibold">
                                                {i.title}
                                            </div>
                                            <div className="text-xs text-slate-400">
                                                {i.category
                                                    ? i.category + " • "
                                                    : ""}
                                                {i.location} •{" "}
                                                {new Date(
                                                    i.createdAt
                                                ).toLocaleString()}
                                            </div>
                                        </div>
                                        <div className="text-xs">
                                            {i.found ? (
                                                <span className="text-green-600">
                                                    Found
                                                </span>
                                            ) : (
                                                <span className="text-yellow-600">
                                                    Missing
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {i.description && (
                                        <p className="mt-2 text-slate-700">
                                            {i.description}
                                        </p>
                                    )}
                                    {i.reportedBy && (
                                        <div className="text-xs text-slate-500 mt-2">
                                            Reported by: {i.reportedBy}
                                        </div>
                                    )}
                                </div>
                                <div className="w-36 flex flex-col items-end gap-2">
                                    {i.image && (
                                        <img
                                            src={i.image}
                                            alt="item"
                                            className="w-24 h-24 object-cover rounded"
                                        />
                                    )}
                                    <div className="flex flex-col gap-2">
                                        {!i.found && (
                                            <Button
                                                variant="secondary"
                                                className="btn-sm"
                                                onClick={() => markFound(i.id)}
                                            >
                                                Mark Found
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            className="btn-sm"
                                            onClick={async () => {
                                                const matches =
                                                    await findMatches(i.id);
                                                // naive UX: if matches show alert (placeholder)
                                                if (matches.length)
                                                    alert(
                                                        `Found ${matches.length} potential match(es). Check the list.`
                                                    );
                                                else alert("No matches found");
                                            }}
                                        >
                                            Find Matches
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="btn-sm"
                                            onClick={async () => {
                                                const proof =
                                                    prompt(
                                                        "Provide a short proof or description to claim this item"
                                                    ) || "";
                                                if (!proof) return;
                                                await claimItem(
                                                    i.id,
                                                    "user1",
                                                    proof
                                                );
                                                alert(
                                                    "Claim submitted for admin approval"
                                                );
                                            }}
                                        >
                                            Claim
                                        </Button>
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
