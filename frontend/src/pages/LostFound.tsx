import { useEffect, useState, useRef } from "react";
import { useStore } from "../stores/useStore";
import { useAppStore } from "../stores/useAppStore";
import Card from "../components/Card";
import Button from "../components/Button";
import FormField from "../components/FormField";
import StatusBadge from "../components/StatusBadge";

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
        approveClaim,
    } = useStore();
    const { user } = useAppStore();
    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Personal");
    const [reportType, setReportType] = useState<"lost" | "found">("lost");
    const [description, setDescription] = useState("");
    const [dateTime, setDateTime] = useState<string | undefined>(undefined);
    const [contact, setContact] = useState("");
    const [location, setLocation] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [openMatches, setOpenMatches] = useState<Record<string, any[]>>({});

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
        if (!user) return alert("Please login to report items");
        try {
            await addLostItem({
                type: reportType,
                title,
                category,
                description,
                location,
                images: image ? [image] : undefined,
            });
        } catch (err: any) {
            alert(err?.message || "Failed to report item");
            return;
        }
        setTitle("");
        setDescription("");
        setLocation("");
        setImage(null);
        if (fileRef.current) fileRef.current.value = "";
        setShowForm(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Lost &amp; Found</h1>
                    <p className="text-slate-600">
                        Report lost items or mark found items.
                    </p>
                </div>
                <Button
                    variant={showForm ? "ghost" : "primary"}
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Cancel" : "Add Missing Item"}
                </Button>
            </div>

            {showForm && (
                <form
                    onSubmit={onSubmit}
                    className="bg-white p-6 rounded shadow"
                >
                    <FormField label="Title">
                        <input
                            id="lf-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </FormField>

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

                    <FormField label="Category">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option>Personal</option>
                            <option>Electronics</option>
                            <option>Documents</option>
                            <option>Clothing</option>
                            <option>Other</option>
                        </select>
                    </FormField>

                    <FormField
                        label={`Date & time ${
                            reportType === "lost" ? "lost" : "found"
                        }`}
                    >
                        <input
                            id="lf-datetime"
                            type="datetime-local"
                            value={dateTime || ""}
                            onChange={(e) => setDateTime(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </FormField>

                    <FormField label="Contact info (email or phone)">
                        <input
                            id="lf-contact"
                            value={contact}
                            onChange={(e) => setContact(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </FormField>

                    <FormField label="Location">
                        <input
                            id="lf-location"
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </FormField>

                    <FormField label="Description">
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={4}
                            className="w-full border rounded p-3"
                        />
                    </FormField>

                    <FormField label="Image (optional)">
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            onChange={(ev) => onFile(ev.target.files?.[0])}
                            className="mt-1 w-full"
                        />
                        {image && (
                            <img
                                src={image}
                                alt="preview"
                                className="mt-3 w-full h-40 object-cover rounded"
                            />
                        )}
                    </FormField>

                    <div className="flex gap-2">
                        <Button type="submit" variant="primary">
                            Report Item
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setShowForm(false)}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            )}

            <div className="space-y-4">
                <div className="mb-4 flex flex-col md:flex-row md:items-center gap-3">
                    <input
                        placeholder="Search"
                        className="flex-1 border rounded px-3 py-2"
                        onChange={(e) => queryLostFound({ q: e.target.value })}
                    />
                    <select
                        className="border rounded px-3 py-2"
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
                        className="border rounded px-3 py-2"
                        onChange={(e) =>
                            queryLostFound({ sort: e.target.value as any })
                        }
                    >
                        <option value="newest">Newest</option>
                        <option value="oldest">Oldest</option>
                    </select>
                    <Button variant="ghost" onClick={() => queryLostFound({})}>
                        Clear
                    </Button>
                </div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">Recent Reports</h2>
                    <div className="text-sm text-slate-500">
                        {loading ? "Loading..." : `${lostFound.length} total`}
                    </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 auto-rows-fr">
                    {lostFound.map((i) => (
                        <Card
                            key={i.id}
                            className="h-full flex flex-col md:flex-row gap-4 items-start"
                        >
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <div className="text-sm font-semibold text-slate-800">
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
                                        <StatusBadge
                                            status={
                                                i.found ? "found" : "missing"
                                            }
                                        />
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
                            <div className="md:w-36 w-full flex flex-col items-end gap-2">
                                {i.image && (
                                    <img
                                        src={i.image}
                                        alt="item"
                                        className="w-24 h-24 object-cover rounded"
                                    />
                                )}
                                <div className="flex flex-col gap-2 w-full">
                                    {!i.found ? (
                                        user &&
                                        (user._id === i.reportedBy ||
                                            user.role === "staff" ||
                                            user.role === "admin") ? (
                                            <Button
                                                variant="secondary"
                                                className="w-full text-sm"
                                                onClick={() => {
                                                    if (!user)
                                                        return alert(
                                                            "Please login to mark items as found"
                                                        );
                                                    if (!i.id)
                                                        return alert(
                                                            "Invalid item id"
                                                        );
                                                    markFound(i.id);
                                                }}
                                            >
                                                Mark Found
                                            </Button>
                                        ) : (
                                            <div className="text-xs text-slate-400">
                                                Reporter or staff only
                                            </div>
                                        )
                                    ) : null}

                                    <Button
                                        variant="ghost"
                                        className="w-full text-sm"
                                        onClick={async () => {
                                            if (!user)
                                                return alert(
                                                    "Please login to find matches"
                                                );
                                            if (!i.id)
                                                return alert("Invalid item id");
                                            const matches = await findMatches(
                                                i.id
                                            );
                                            setOpenMatches((s) => ({
                                                ...s,
                                                [i.id]: matches,
                                            }));
                                        }}
                                    >
                                        Find Matches
                                    </Button>

                                    <Button
                                        variant="primary"
                                        className="w-full text-sm"
                                        disabled={
                                            !!(
                                                (i as any).claim &&
                                                (i as any).claim.status ===
                                                    "pending"
                                            )
                                        }
                                        onClick={async () => {
                                            if (!user)
                                                return alert(
                                                    "Please login to claim items"
                                                );
                                            const proof =
                                                prompt(
                                                    "Provide a short proof or description to claim this item"
                                                ) || "";
                                            if (!proof) return;
                                            await claimItem(
                                                i.id,
                                                user._id,
                                                proof
                                            );
                                            alert(
                                                "Claim submitted for admin approval"
                                            );
                                        }}
                                    >
                                        {(i as any).claim &&
                                        (i as any).claim.status === "pending"
                                            ? "Claim Pending"
                                            : "Claim"}
                                    </Button>
                                </div>
                            </div>

                            {/* Approve/Reject for pending claims (staff/admin) */}
                            {(i as any).claim &&
                                (i as any).claim.status === "pending" &&
                                (user?.role === "staff" ||
                                    user?.role === "admin") && (
                                    <div className="flex gap-2 mt-2 w-full">
                                        <Button
                                            variant="primary"
                                            className="text-sm"
                                            onClick={async () => {
                                                if (
                                                    !confirm(
                                                        "Approve this claim?"
                                                    )
                                                )
                                                    return;
                                                try {
                                                    await approveClaim(
                                                        i.id,
                                                        (i as any).claim.id,
                                                        true
                                                    );
                                                    alert("Claim approved");
                                                    await loadLostFound();
                                                } catch (err: any) {
                                                    alert(
                                                        "Failed to approve claim: " +
                                                            (err?.message ||
                                                                err)
                                                    );
                                                }
                                            }}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="danger"
                                            className="text-sm"
                                            onClick={async () => {
                                                if (
                                                    !confirm(
                                                        "Reject this claim?"
                                                    )
                                                )
                                                    return;
                                                try {
                                                    await approveClaim(
                                                        i.id,
                                                        (i as any).claim.id,
                                                        false
                                                    );
                                                    alert("Claim rejected");
                                                    await loadLostFound();
                                                } catch (err: any) {
                                                    alert(
                                                        "Failed to reject claim: " +
                                                            (err?.message ||
                                                                err)
                                                    );
                                                }
                                            }}
                                        >
                                            Reject
                                        </Button>
                                    </div>
                                )}

                            {/* Matches list */}
                            {openMatches[i.id] &&
                                openMatches[i.id].length > 0 && (
                                    <Card className="mt-2 col-span-full">
                                        <div className="text-sm font-semibold mb-2">
                                            Potential matches
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                            {openMatches[i.id].map((m) => (
                                                <Card
                                                    key={m.id}
                                                    className="p-3"
                                                >
                                                    <div className="text-sm font-medium">
                                                        {m.title}
                                                    </div>
                                                    <div className="text-xs text-slate-500">
                                                        {m.location} •{" "}
                                                        {new Date(
                                                            m.createdAt
                                                        ).toLocaleString()}
                                                    </div>
                                                    {m.image && (
                                                        <img
                                                            src={m.image}
                                                            className="w-full h-24 object-cover rounded mt-2"
                                                        />
                                                    )}
                                                </Card>
                                            ))}
                                        </div>
                                    </Card>
                                )}
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
