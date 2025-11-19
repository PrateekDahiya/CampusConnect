import React, { useEffect, useState, useRef } from "react";
import { useAppStore } from "../stores/useAppStore";
import Button from "../components/Button";
import Card from "../components/Card";
import StatusBadge from "../components/StatusBadge";
import Badge from "../components/Badge";
import FormField from "../components/FormField";

export default function Complaints() {
    // Use the new backend-connected store for complaints
    const {
        user,
        complaints,
        loadComplaints,
        addComplaint: addBackendComplaint,
        updateStatus,
        complaintsLoading,
        addRemark,
        assignStaff,
    } = useAppStore();

    // Role-based access control helpers
    const isStudent = user?.role === "student";
    const isStaff = user?.role === "staff";
    const isAdmin = user?.role === "admin";
    const canManageComplaints = isStaff || isAdmin; // Staff and Admin can manage complaints
    const canAssignStaff = isAdmin; // Only Admin can assign staff
    // ...existing code...
    const [title, setTitle] = useState("");
    const [hostel, setHostel] = useState("Hostel A");
    const [complaintType, setComplaintType] = useState("Maintenance");
    const [roomNumber, setRoomNumber] = useState("");
    const [description, setDescription] = useState("");
    const [image, setImage] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement | null>(null);
    const loadedRef = useRef(false);
    const [query, setQuery] = useState("");
    const [filterStatus, setFilterStatus] = useState<string>("");
    const [showForm, setShowForm] = useState(false);

    useEffect(() => {
        if (!loadedRef.current) {
            console.log("Loading complaints for the first time");
            loadedRef.current = true;
            loadComplaints();
        }
    }, []);

    // Debug logging
    useEffect(() => {
        console.log("=== Authentication Debug ===");
        console.log("User object:", user);
        console.log("User ID:", user?._id);
        console.log(
            "Is Authenticated:",
            useAppStore.getState().isAuthenticated
        );
        console.log("Initialized:", useAppStore.getState().initialized);
        console.log("Loading:", useAppStore.getState().loading);
        console.log(
            "Token in localStorage:",
            localStorage.getItem("authToken")
        );
        console.log("=== Complaints Debug ===");
        console.log("Current complaints:", complaints);
        console.log("=============================");
    }, [user, complaints]);

    const onFile = (f?: File) => {
        if (!f) return setImage(null);
        const reader = new FileReader();
        reader.onload = () => setImage(String(reader.result));
        reader.readAsDataURL(f);
    };

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!description.trim()) return;

        try {
            // Backend API only supports title, description, and hostel
            await addBackendComplaint({
                title: title || description.slice(0, 30),
                hostel,
                description,
            });

            setTitle("");
            setDescription("");
            setImage(null);
            if (fileRef.current) fileRef.current.value = "";
            setShowForm(false);
        } catch (error) {
            console.error("Failed to submit complaint:", error);
            // You could add error handling UI here
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Hostel Complaint Box</h1>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm text-slate-600">
                            Logged in as:{" "}
                            <span className="font-medium">{user?.name}</span>
                        </span>
                        {isStudent && (
                            <Badge variant="student" className="text-xs">
                                Can: Submit complaints & rate resolved ones
                            </Badge>
                        )}
                        {isStaff && (
                            <Badge variant="staff" className="text-xs">
                                Can: Manage complaints & add remarks
                            </Badge>
                        )}
                        {isAdmin && (
                            <Badge variant="admin" className="text-xs">
                                Can: Full management & staff assignment
                            </Badge>
                        )}
                    </div>
                    <p className="text-slate-600">
                        Submit and track complaints quickly.
                    </p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowForm(!showForm)}
                >
                    {showForm ? "Cancel" : "Add Complaint"}
                </Button>
            </div>

            {showForm && (
                <form
                    onSubmit={onSubmit}
                    className="bg-white p-6 rounded shadow"
                >
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-4">
                            <FormField label="Title">
                                <input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full border rounded px-3 py-2 mt-1"
                                    placeholder="Short title of the issue"
                                />
                            </FormField>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <FormField label="Complaint Type">
                                        <select
                                            value={complaintType}
                                            onChange={(e) =>
                                                setComplaintType(e.target.value)
                                            }
                                            className="w-full border rounded px-3 py-2 mt-1"
                                        >
                                            <option>Maintenance</option>
                                            <option>Electrical</option>
                                            <option>Plumbing</option>
                                            <option>Hygiene</option>
                                            <option>Food</option>
                                            <option>Internet</option>
                                            <option>Other</option>
                                        </select>
                                    </FormField>
                                </div>
                                <div>
                                    <FormField label="Hostel">
                                        <select
                                            value={hostel}
                                            onChange={(e) =>
                                                setHostel(e.target.value)
                                            }
                                            className="w-full border rounded px-3 py-2 mt-1"
                                        >
                                            <option>Hostel A</option>
                                            <option>Hostel B</option>
                                            <option>Hostel C</option>
                                        </select>
                                    </FormField>
                                </div>
                            </div>

                            <FormField label="Room Number">
                                <input
                                    value={roomNumber}
                                    onChange={(e) =>
                                        setRoomNumber(e.target.value)
                                    }
                                    className="w-full border rounded px-3 py-2 mt-1"
                                    placeholder="e.g. 101"
                                />
                            </FormField>

                            <FormField label="Description">
                                <textarea
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    rows={6}
                                    className="w-full border rounded p-3 mt-1"
                                    placeholder="Describe the issue in detail..."
                                />
                            </FormField>
                        </div>

                        <aside className="space-y-4">
                            <FormField label="Image (optional)">
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={(ev) =>
                                        onFile(ev.target.files?.[0])
                                    }
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

                            <div className="flex flex-col gap-2 mt-4">
                                <Button type="submit" variant="primary">
                                    Submit Complaint
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setShowForm(false)}
                                >
                                    Cancel
                                </Button>
                            </div>
                        </aside>
                    </div>
                </form>
            )}

            <div className="space-y-4">
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
                        {canManageComplaints && <option>In Progress</option>}
                        <option>Resolved</option>
                        {canManageComplaints && <option>Rejected</option>}
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
                    <h2 className="text-xl font-semibold">Recent Complaints</h2>
                    <div className="text-sm text-slate-500">
                        {complaintsLoading
                            ? "Loading..."
                            : `${complaints.length} total`}
                    </div>
                </div>

                <div className="grid gap-4">
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
                            <Card key={c.id} className="p-4">
                                <div className="flex flex-col md:flex-row gap-4">
                                    <div className="w-full md:w-36 flex-shrink-0">
                                        {c.attachments && c.attachments[0] ? (
                                            <img
                                                src={c.attachments[0]}
                                                alt="attached"
                                                className="w-full h-28 md:h-32 object-cover rounded-lg"
                                            />
                                        ) : (
                                            <div className="w-full h-28 md:h-32 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400">
                                                <span>No Image</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-800">
                                                    {c.title}
                                                </h3>
                                                <div className="text-xs text-slate-400 mt-1">
                                                    {c.complaintType
                                                        ? c.complaintType +
                                                          " • "
                                                        : ""}
                                                    {c.hostel}{" "}
                                                    {c.roomNumber
                                                        ? `• Room ${c.roomNumber}`
                                                        : ""}{" "}
                                                    •{" "}
                                                    {new Date(
                                                        c.createdAt
                                                    ).toLocaleString()}
                                                </div>
                                            </div>
                                            <div className="ml-4">
                                                <StatusBadge
                                                    status={c.status}
                                                />
                                            </div>
                                        </div>

                                        <p className="mt-3 text-slate-700">
                                            {c.description}
                                        </p>

                                        <div className="mt-3 flex flex-wrap gap-2">
                                            {c.remarks &&
                                                c.remarks.length > 0 && (
                                                    <div className="text-xs text-slate-500">
                                                        <strong>
                                                            Remarks:
                                                        </strong>
                                                        <div className="mt-1">
                                                            {c.remarks.map(
                                                                (
                                                                    r: any,
                                                                    index: number
                                                                ) => (
                                                                    <div
                                                                        key={
                                                                            index
                                                                        }
                                                                        className="mt-1 pl-2 border-l-2 border-gray-200"
                                                                    >
                                                                        <div className="text-sm">
                                                                            {
                                                                                r.text
                                                                            }
                                                                        </div>
                                                                        <div className="text-xs text-slate-400">
                                                                            Added
                                                                            on{" "}
                                                                            {new Date(
                                                                                r.addedAt
                                                                            ).toLocaleDateString()}
                                                                        </div>
                                                                    </div>
                                                                )
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            {c.assignedStaff && (
                                                <div className="text-xs text-slate-500">
                                                    Assigned to:{" "}
                                                    {c.assignedStaff}
                                                </div>
                                            )}
                                            {c.satisfaction && (
                                                <div className="text-xs text-slate-500">
                                                    User Satisfaction:{" "}
                                                    {c.satisfaction === "yes"
                                                        ? "😊"
                                                        : "😞"}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <aside className="w-full md:w-48 flex-shrink-0 flex flex-col items-end gap-2">
                                        {canManageComplaints && (
                                            <div className="flex flex-col w-full">
                                                {c.status !== "Resolved" && (
                                                    <Button
                                                        variant="secondary"
                                                        className="w-full btn-sm mb-2"
                                                        onClick={async () => {
                                                            try {
                                                                await updateStatus(
                                                                    c.id,
                                                                    "Resolved"
                                                                );
                                                                alert(
                                                                    "Complaint marked as resolved"
                                                                );
                                                            } catch (error) {
                                                                alert(
                                                                    "Failed to update status. Please try again."
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Mark Resolved
                                                    </Button>
                                                )}
                                                {c.status === "Pending" && (
                                                    <Button
                                                        variant="ghost"
                                                        className="w-full btn-sm mb-2"
                                                        onClick={async () => {
                                                            try {
                                                                await updateStatus(
                                                                    c.id,
                                                                    "In Progress"
                                                                );
                                                                alert(
                                                                    "Complaint moved to In Progress"
                                                                );
                                                            } catch (error) {
                                                                alert(
                                                                    "Failed to update status. Please try again."
                                                                );
                                                            }
                                                        }}
                                                    >
                                                        Start
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="danger"
                                                    className="w-full btn-sm"
                                                    onClick={async () => {
                                                        if (
                                                            confirm(
                                                                "Are you sure you want to reject this complaint?"
                                                            )
                                                        ) {
                                                            try {
                                                                await updateStatus(
                                                                    c.id,
                                                                    "Rejected"
                                                                );
                                                                alert(
                                                                    "Complaint rejected"
                                                                );
                                                            } catch (error) {
                                                                alert(
                                                                    "Failed to update status. Please try again."
                                                                );
                                                            }
                                                        }
                                                    }}
                                                >
                                                    Reject
                                                </Button>

                                                <div className="flex gap-2 mt-3">
                                                    {canManageComplaints && (
                                                        <Button
                                                            variant="ghost"
                                                            className="btn-sm"
                                                            onClick={async () => {
                                                                const text =
                                                                    prompt(
                                                                        "Add remark"
                                                                    );
                                                                if (text) {
                                                                    try {
                                                                        await addRemark(
                                                                            c.id,
                                                                            text
                                                                        );
                                                                        alert(
                                                                            "Remark added successfully"
                                                                        );
                                                                    } catch (error) {
                                                                        alert(
                                                                            "Failed to add remark. Please try again."
                                                                        );
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            Add Remark
                                                        </Button>
                                                    )}
                                                    {canAssignStaff && (
                                                        <Button
                                                            variant="ghost"
                                                            className="btn-sm"
                                                            onClick={async () => {
                                                                const staff =
                                                                    prompt(
                                                                        "Enter staff user ID to assign"
                                                                    );
                                                                if (staff) {
                                                                    try {
                                                                        await assignStaff(
                                                                            c.id,
                                                                            staff
                                                                        );
                                                                        alert(
                                                                            "Staff assigned successfully"
                                                                        );
                                                                    } catch (error) {
                                                                        alert(
                                                                            "Failed to assign staff. Please check the user ID and try again."
                                                                        );
                                                                    }
                                                                }
                                                            }}
                                                        >
                                                            Assign
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </aside>
                                </div>
                            </Card>
                        ))}
                </div>
            </div>
        </div>
    );
}
