import React, { useEffect, useRef, useState } from "react";
import { useStore } from "../stores/useStore";
import { useAppStore } from "../stores/useAppStore";
import { useUiStore } from "../stores/useUiStore";
import Card from "../components/Card";
import Button from "../components/Button";
import FormField from "../components/FormField";
import StatusBadge from "../components/StatusBadge";

export default function LostFoundNew() {
    const {
        lostFound,
        loadLostFound,
        addLostItem,
        findMatches,
        claimItem,
        approveClaim,
        deleteLostItem,
    } = useStore();
    const { user } = useAppStore();

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Personal");
    const [reportType, setReportType] = useState<"lost" | "found">("lost");
    const [description, setDescription] = useState("");
    const [location, setLocation] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [showForm, setShowForm] = useState(false);
    const [matchesModal, setMatchesModal] = useState<{
        itemId: string;
        matches: any[];
    } | null>(null);

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
        const nextErrors: Record<string, string> = {};
        if (!title.trim())
            nextErrors.title = "Please provide a short title for the item.";
        if (!location.trim())
            nextErrors.location =
                "Please provide the location where the item was lost/found.";
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }
        if (!user) {
            useUiStore
                .getState()
                .notify("Please login to report items", "warning");
            return;
        }
        try {
            await addLostItem({
                type: reportType,
                title,
                category,
                description,
                location,
                images: image ? [image] : undefined,
            });
            useUiStore.getState().notify("Item reported", "success");
        } catch (err: any) {
            useUiStore
                .getState()
                .notify(err?.message || "Failed to report item", "error");
            return;
        }
        setTitle("");
        setDescription("");
        setLocation("");
        setImage(null);
        setErrors({});
        if (fileRef.current) fileRef.current.value = "";
        setShowForm(false);
    };

    const handleFindMatches = async (item: any) => {
        if (!user)
            return useUiStore
                .getState()
                .notify("Please login to find matches", "warning");
        const id = item.id || item._id;
        if (!id)
            return useUiStore.getState().notify("Invalid item id", "error");
        try {
            const matches = await findMatches(id);
            setMatchesModal({ itemId: id, matches });
        } catch (err: any) {
            useUiStore
                .getState()
                .notify(err?.message || "Failed to fetch matches", "error");
        }
    };

    const handleClaim = async (item: any) => {
        if (!user)
            return useUiStore
                .getState()
                .notify("Please login to claim items", "warning");
        const proof =
            (await useUiStore
                .getState()
                .promptDialog(
                    "Provide a short proof or description to claim this item"
                )) || "";
        if (!proof) return;
        const id = item.id || item._id;
        try {
            await claimItem(id, user._id, proof);
            useUiStore
                .getState()
                .notify("Claim submitted for admin approval", "success");
            await loadLostFound();
        } catch (err: any) {
            useUiStore
                .getState()
                .notify(err?.message || "Failed to submit claim", "error");
        }
    };

    const handleDelete = async (item: any) => {
        const ok = await useUiStore
            .getState()
            .confirmDialog("Delete this item?");
        if (!ok) return;
        const id = item.id || item._id;
        try {
            await deleteLostItem(id);
            useUiStore.getState().notify("Item deleted", "success");
            await loadLostFound();
        } catch (err: any) {
            useUiStore
                .getState()
                .notify(err?.message || "Failed to delete item", "error");
        }
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
                    onClick={() => setShowForm((s) => !s)}
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
                            onChange={(e) => {
                                setTitle(e.target.value);
                                if (errors.title)
                                    setErrors((s) => ({ ...s, title: "" }));
                            }}
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.title && (
                            <div className="text-red-600 text-sm mt-1">
                                {errors.title}
                            </div>
                        )}
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

                    <FormField label="Location">
                        <input
                            id="lf-location"
                            value={location}
                            onChange={(e) => {
                                setLocation(e.target.value);
                                if (errors.location)
                                    setErrors((s) => ({ ...s, location: "" }));
                            }}
                            className="w-full border rounded px-3 py-2"
                        />
                        {errors.location && (
                            <div className="text-red-600 text-sm mt-1">
                                {errors.location}
                            </div>
                        )}
                    </FormField>

                    <FormField label="Category">
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        >
                            <option>Personal</option>
                            <option>Electronics</option>
                            <option>Documents</option>
                            <option>Other</option>
                        </select>
                    </FormField>

                    <FormField label="Description">
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full border rounded px-3 py-2"
                        />
                    </FormField>

                    <div className="flex items-center gap-2 mt-3">
                        <input
                            ref={fileRef}
                            type="file"
                            onChange={(e) => onFile(e.target.files?.[0])}
                        />
                        <Button type="submit" variant="primary">
                            Report
                        </Button>
                    </div>
                </form>
            )}

            <div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {lostFound?.map((i: any) => {
                        const id = i.id || i._id;
                        return (
                            <Card key={id} className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <div className="text-lg font-medium">
                                            {i.title}
                                        </div>
                                        <div className="text-xs text-slate-500">
                                            {i.location} •{" "}
                                            {new Date(
                                                i.createdAt
                                            ).toLocaleString()}
                                        </div>
                                        <div className="mt-2 text-sm text-slate-700">
                                            {i.description}
                                        </div>
                                        {i.images && i.images[0] && (
                                            <img
                                                src={i.images[0]}
                                                className="w-full h-36 object-cover rounded mt-2"
                                            />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-end gap-2 w-36">
                                        <StatusBadge
                                            status={
                                                i.type === "lost"
                                                    ? "warning"
                                                    : "success"
                                            }
                                        />
                                        <Button
                                            variant="ghost"
                                            className="w-full text-sm"
                                            onClick={() => handleFindMatches(i)}
                                        >
                                            Find Matches
                                        </Button>
                                        <Button
                                            variant="primary"
                                            className="w-full text-sm"
                                            disabled={
                                                !!(
                                                    i.claim &&
                                                    i.claim.status === "pending"
                                                )
                                            }
                                            onClick={() => handleClaim(i)}
                                        >
                                            {i.claim &&
                                            i.claim.status === "pending"
                                                ? "Claim Pending"
                                                : "Claim"}
                                        </Button>

                                        {(user?.role === "admin" ||
                                            i.reportedBy === user?._id) && (
                                            <Button
                                                variant="danger"
                                                className="w-full text-sm"
                                                onClick={() => handleDelete(i)}
                                            >
                                                Delete
                                            </Button>
                                        )}

                                        {i.claim &&
                                            i.claim.status === "pending" &&
                                            (user?.role === "staff" ||
                                                user?.role === "admin") && (
                                                <div className="flex gap-2 mt-2 w-full">
                                                    <Button
                                                        variant="primary"
                                                        className="text-sm"
                                                        onClick={async () => {
                                                            const ok =
                                                                await useUiStore
                                                                    .getState()
                                                                    .confirmDialog(
                                                                        "Approve this claim?"
                                                                    );
                                                            if (!ok) return;
                                                            try {
                                                                await approveClaim(
                                                                    id,
                                                                    i.claim.id,
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
                                                                        err?.message ||
                                                                            "Failed to approve claim",
                                                                        "error"
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
                                                            const ok =
                                                                await useUiStore
                                                                    .getState()
                                                                    .confirmDialog(
                                                                        "Reject this claim?"
                                                                    );
                                                            if (!ok) return;
                                                            try {
                                                                await approveClaim(
                                                                    id,
                                                                    i.claim.id,
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
                                                                        err?.message ||
                                                                            "Failed to reject claim",
                                                                        "error"
                                                                    );
                                                            }
                                                        }}
                                                    >
                                                        Reject
                                                    </Button>
                                                </div>
                                            )}
                                    </div>
                                </div>
                            </Card>
                        );
                    })}
                </div>
            </div>

            {/* Matches modal */}
            {matchesModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
                    <div className="bg-white w-full max-w-3xl p-6 rounded shadow-lg">
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-lg font-semibold">
                                    Potential matches
                                </h3>
                                <div className="text-sm text-slate-500">
                                    Matches for the selected item
                                </div>
                            </div>
                            <div>
                                <Button
                                    variant="ghost"
                                    onClick={() => setMatchesModal(null)}
                                    className="btn-sm"
                                >
                                    Close
                                </Button>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                            {matchesModal.matches.length === 0 && (
                                <div className="text-center text-slate-500">
                                    No matches found
                                </div>
                            )}
                            {matchesModal.matches.map((m: any) => (
                                <Card key={m.id || m._id} className="p-3">
                                    <div className="flex items-center justify-between">
                                        <div className="text-sm font-medium">
                                            {m.title}
                                        </div>
                                        {typeof m.score === "number" && (
                                            <div className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                                                {m.score}%
                                            </div>
                                        )}
                                    </div>
                                    <div className="text-xs text-slate-500">
                                        {m.location} •{" "}
                                        {new Date(m.createdAt).toLocaleString()}
                                    </div>
                                    {m.image && (
                                        <img
                                            src={m.image}
                                            className="w-full h-28 object-cover rounded mt-2"
                                        />
                                    )}
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
