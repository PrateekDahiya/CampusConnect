import { useEffect, useState } from "react";
import { useAppStore } from "../stores/useAppStore";
import Button from "../components/Button";
import Card from "../components/Card";
import FormField from "../components/FormField";
import StatusBadge from "../components/StatusBadge";
import { useUiStore } from "../stores/useUiStore";

export default function LendCycle() {
    const {
        user,
        cycles,
        cyclesLoading,
        myBookings,
        pendingRequests,
        loadCycles,
        createCycle,
        bookCycle,
        returnCycle,
        getMyBookings,
        getPendingRequests,
        approveBooking,
        rejectBooking,
        cancelBooking,
    } = useAppStore();

    // Helper to normalize id or populated object to string id
    const getId = (ref: any) => {
        if (!ref) return null;
        if (typeof ref === "string") return ref;
        if (typeof ref === "object") {
            if (ref._id) return String(ref._id);
            if (ref.id) return String(ref.id);
        }
        return null;
    };

    const [locationFilter, setLocationFilter] = useState("");
    const [loading, setLoading] = useState(false);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [activeTab, setActiveTab] = useState<
        "browse" | "my-bookings" | "pending-requests"
    >("browse");

    const [name, setName] = useState("");
    const [model, setModel] = useState("");
    const [hourlyRate, setHourlyRate] = useState<string>("0");
    const [dailyRate, setDailyRate] = useState<string>("0");
    const [hostel, setHostel] = useState("");
    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (user) {
            loadCycles();
            getMyBookings();
            getPendingRequests();
        }
    }, [user]);

    const onFilter = async () => {
        setLoading(true);
        await loadCycles({
            hostel: locationFilter || undefined,
        });
        setLoading(false);
    };

    const onCreateListing = async () => {
        const nextErrors: Record<string, string> = {};
        if (!name.trim())
            nextErrors.name = "Please provide a name for the cycle.";
        if (!hostel.trim())
            nextErrors.hostel =
                "Please provide the hostel/location for the cycle.";
        if (Object.keys(nextErrors).length) {
            setErrors(nextErrors);
            return;
        }
        try {
            await createCycle({
                name,
                model,
                hourlyRate: Number(hourlyRate),
                dailyRate: Number(dailyRate),
                hostel,
            });
            setName("");
            setModel("");
            setHourlyRate("0");
            setDailyRate("0");
            setHostel("");
            setErrors({});
            setShowCreateForm(false);
            await loadCycles();
        } catch (e: any) {
            useUiStore.getState().notify(e.message || "Create failed", "error");
        }
    };

    const onBook = async (cycleId: string) => {
        try {
            setLoading(true);
            const startTime = new Date().toISOString();
            const endTime = new Date(Date.now() + 60 * 60 * 1000).toISOString();
            await bookCycle(cycleId, startTime, endTime);
            await getMyBookings();
            await loadCycles();
        } catch (e: any) {
            useUiStore
                .getState()
                .notify(e.message || "Booking failed", "error");
        } finally {
            setLoading(false);
        }
    };

    const onReturn = async (bookingId: string) => {
        try {
            setLoading(true);
            await returnCycle(bookingId);
            await getMyBookings();
            await loadCycles();
        } catch (e: any) {
            useUiStore.getState().notify(e.message || "Return failed", "error");
        } finally {
            setLoading(false);
        }
    };

    // Reuse centralized StatusBadge component

    return (
        <div className="space-y-6">
            {!user ? (
                <div className="text-center py-8">
                    <p className="text-gray-600">
                        Please login to access the cycle lending system.
                    </p>
                </div>
            ) : (
                <>
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold">Lend a Cycle</h1>
                            <p className="text-slate-600">
                                View available cycles and manage bookings.
                            </p>
                        </div>
                        <Button
                            variant={showCreateForm ? "ghost" : "primary"}
                            onClick={() => setShowCreateForm(!showCreateForm)}
                        >
                            {showCreateForm ? "Cancel" : "List Your Cycle"}
                        </Button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-8">
                            <button
                                onClick={() => setActiveTab("browse")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "browse"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                Browse Cycles
                            </button>
                            <button
                                onClick={() => setActiveTab("my-bookings")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "my-bookings"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                My Bookings
                            </button>
                            <button
                                onClick={() => setActiveTab("pending-requests")}
                                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                                    activeTab === "pending-requests"
                                        ? "border-blue-500 text-blue-600"
                                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                                }`}
                            >
                                Pending Requests{" "}
                                {pendingRequests.length > 0 &&
                                    `(${pendingRequests.length})`}
                            </button>
                        </nav>
                    </div>

                    {/* BROWSE TAB */}
                    {activeTab === "browse" && (
                        <>
                            {showCreateForm && (
                                <Card>
                                    <h3 className="font-semibold mb-4">
                                        Create a Cycle Listing
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <FormField label="Cycle Name">
                                            <input
                                                value={name}
                                                onChange={(e) => {
                                                    setName(e.target.value);
                                                    if (errors.name)
                                                        setErrors((s) => ({
                                                            ...s,
                                                            name: "",
                                                        }));
                                                }}
                                                placeholder="Cycle Name"
                                                className="border rounded px-3 py-2"
                                            />
                                            {errors.name && (
                                                <div className="text-red-600 text-sm mt-1">
                                                    {errors.name}
                                                </div>
                                            )}
                                        </FormField>
                                        <FormField label="Model (optional)">
                                            <input
                                                value={model}
                                                onChange={(e) =>
                                                    setModel(e.target.value)
                                                }
                                                placeholder="Model (optional)"
                                                className="border rounded px-3 py-2"
                                            />
                                        </FormField>
                                        <FormField label="Hourly Rate (₹)">
                                            <input
                                                value={hourlyRate}
                                                onChange={(e) =>
                                                    setHourlyRate(
                                                        e.target.value
                                                    )
                                                }
                                                placeholder="Hourly Rate (₹)"
                                                type="number"
                                                className="border rounded px-3 py-2"
                                            />
                                        </FormField>
                                        <FormField label="Daily Rate (₹)">
                                            <input
                                                value={dailyRate}
                                                onChange={(e) =>
                                                    setDailyRate(e.target.value)
                                                }
                                                placeholder="Daily Rate (₹)"
                                                type="number"
                                                className="border rounded px-3 py-2"
                                            />
                                        </FormField>
                                        <FormField label="Hostel Name">
                                            <input
                                                value={hostel}
                                                onChange={(e) => {
                                                    setHostel(e.target.value);
                                                    if (errors.hostel)
                                                        setErrors((s) => ({
                                                            ...s,
                                                            hostel: "",
                                                        }));
                                                }}
                                                placeholder="Hostel Name"
                                                className="border rounded px-3 py-2 md:col-span-2"
                                            />
                                            {errors.hostel && (
                                                <div className="text-red-600 text-sm mt-1">
                                                    {errors.hostel}
                                                </div>
                                            )}
                                        </FormField>
                                    </div>
                                    <div className="mt-4 flex gap-2">
                                        <Button
                                            variant="primary"
                                            onClick={onCreateListing}
                                        >
                                            Create Listing
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() =>
                                                setShowCreateForm(false)
                                            }
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </Card>
                            )}

                            <div className="bg-white p-4 rounded shadow">
                                <div className="flex gap-2 mb-4">
                                    <input
                                        value={locationFilter}
                                        onChange={(e) =>
                                            setLocationFilter(e.target.value)
                                        }
                                        placeholder="Filter by location or hostel"
                                        className="flex-1 border rounded px-3 py-2"
                                    />
                                    <Button
                                        variant="primary"
                                        onClick={onFilter}
                                    >
                                        Filter
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => {
                                            setLocationFilter("");
                                            loadCycles();
                                        }}
                                    >
                                        Clear
                                    </Button>
                                </div>

                                {loading && (
                                    <div className="text-sm text-slate-500">
                                        Loading cycles...
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {cyclesLoading ? (
                                        <div className="col-span-full text-center py-8">
                                            <p className="text-gray-600">
                                                Loading cycles...
                                            </p>
                                        </div>
                                    ) : cycles.length === 0 ? (
                                        <div className="col-span-full text-center py-8">
                                            <p className="text-gray-600">
                                                No cycles available at the
                                                moment.
                                            </p>
                                        </div>
                                    ) : (
                                        cycles.map((c: any) => (
                                            <Card key={c._id} className="">
                                                {/* Cycle image (first image from array) */}
                                                {(() => {
                                                    const firstImg =
                                                        Array.isArray(c.image)
                                                            ? c.image[0]
                                                            : Array.isArray(
                                                                  c.images
                                                              )
                                                            ? c.images[0]
                                                            : typeof c.image ===
                                                              "string"
                                                            ? c.image
                                                            : null;
                                                    return firstImg ? (
                                                        <img
                                                            src={firstImg}
                                                            alt={
                                                                c.name ||
                                                                "Cycle"
                                                            }
                                                            className="w-full h-40 object-cover rounded mb-3"
                                                            onError={(e) => {
                                                                (
                                                                    e.target as HTMLImageElement
                                                                ).style.display =
                                                                    "none";
                                                            }}
                                                        />
                                                    ) : null;
                                                })()}
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <div className="font-semibold text-slate-800">
                                                            {c.name}
                                                        </div>
                                                        {c.model && (
                                                            <div className="text-sm text-slate-600">
                                                                Model: {c.model}
                                                            </div>
                                                        )}
                                                        <div className="text-sm text-slate-500">
                                                            📍 {c.hostel}
                                                        </div>
                                                        <div className="text-sm text-slate-600 mt-1">
                                                            {c.hourlyRate >
                                                                0 && (
                                                                <span>
                                                                    ₹
                                                                    {
                                                                        c.hourlyRate
                                                                    }
                                                                    /hr{" "}
                                                                </span>
                                                            )}
                                                            {c.dailyRate >
                                                                0 && (
                                                                <span>
                                                                    ₹
                                                                    {
                                                                        c.dailyRate
                                                                    }
                                                                    /day
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <StatusBadge
                                                            status={
                                                                c.available
                                                                    ? "available"
                                                                    : "not available"
                                                            }
                                                        />
                                                    </div>
                                                </div>
                                                <div className="mt-3 flex justify-end">
                                                    {c.available &&
                                                    c.owner !== user?._id ? (
                                                        <Button
                                                            variant="primary"
                                                            className="text-sm px-3 py-1"
                                                            onClick={() =>
                                                                onBook(c._id)
                                                            }
                                                        >
                                                            Book Now
                                                        </Button>
                                                    ) : c.owner ===
                                                      user?._id ? (
                                                        <div className="text-xs text-slate-500">
                                                            Your listing
                                                        </div>
                                                    ) : (
                                                        <div className="text-xs text-slate-500">
                                                            Not available
                                                        </div>
                                                    )}
                                                    {/* Admin or owner delete */}
                                                    {(user?.role === "admin" ||
                                                        c.owner ===
                                                            user?._id) && (
                                                        <div className="mt-2">
                                                            <Button
                                                                variant="danger"
                                                                className="text-sm"
                                                                onClick={async () => {
                                                                    const ok =
                                                                        await useUiStore
                                                                            .getState()
                                                                            .confirmDialog(
                                                                                "Delete this cycle listing?"
                                                                            );
                                                                    if (!ok)
                                                                        return;
                                                                    try {
                                                                        await useAppStore
                                                                            .getState()
                                                                            .deleteCycle(
                                                                                c._id ||
                                                                                    c.id
                                                                            );
                                                                        useUiStore
                                                                            .getState()
                                                                            .notify(
                                                                                "Cycle deleted",
                                                                                "success"
                                                                            );
                                                                        await loadCycles();
                                                                    } catch (err: any) {
                                                                        useUiStore
                                                                            .getState()
                                                                            .notify(
                                                                                "Failed to delete cycle: " +
                                                                                    (err?.message ||
                                                                                        err),
                                                                                "error"
                                                                            );
                                                                    }
                                                                }}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        ))
                                    )}
                                </div>
                            </div>
                        </>
                    )}

                    {/* MY BOOKINGS TAB */}
                    {activeTab === "my-bookings" && (
                        <div>
                            <h2 className="text-xl font-semibold">
                                My Bookings
                            </h2>
                            <div className="space-y-3 mt-3">
                                {myBookings.length === 0 && (
                                    <div className="text-sm text-slate-500">
                                        No bookings
                                    </div>
                                )}
                                {myBookings.map((b: any) => (
                                    <Card
                                        key={b._id}
                                        className="flex justify-between items-center"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                Booking #{b._id.slice(-6)}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                Start:{" "}
                                                {new Date(
                                                    b.startTime
                                                ).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                Expected Return:{" "}
                                                {new Date(
                                                    b.endTime
                                                ).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                Status:{" "}
                                                <StatusBadge
                                                    status={b.status}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right flex flex-col items-end gap-2">
                                            {b.status === "active" && (
                                                <Button
                                                    variant="ghost"
                                                    className="text-sm"
                                                    onClick={() =>
                                                        onReturn(b._id)
                                                    }
                                                >
                                                    Return Cycle
                                                </Button>
                                            )}

                                            {b.status === "pending" && (
                                                <Button
                                                    variant="ghost"
                                                    className="text-sm"
                                                    onClick={async () => {
                                                        try {
                                                            await cancelBooking(
                                                                b._id
                                                            );
                                                            await getMyBookings();
                                                            await getPendingRequests();
                                                            useUiStore
                                                                .getState()
                                                                .notify(
                                                                    "Booking request cancelled",
                                                                    "success"
                                                                );
                                                        } catch (err: any) {
                                                            useUiStore
                                                                .getState()
                                                                .notify(
                                                                    err.message ||
                                                                        "Failed to cancel booking",
                                                                    "error"
                                                                );
                                                        }
                                                    }}
                                                >
                                                    Cancel Request
                                                </Button>
                                            )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* PENDING REQUESTS TAB */}
                    {activeTab === "pending-requests" && (
                        <div>
                            <h2 className="text-xl font-semibold">
                                Pending Requests
                            </h2>
                            <div className="space-y-3 mt-3">
                                {pendingRequests.length === 0 && (
                                    <div className="text-sm text-slate-500">
                                        No pending requests
                                    </div>
                                )}
                                {pendingRequests.map((r: any) => (
                                    <Card
                                        key={r._id}
                                        className="flex justify-between items-center"
                                    >
                                        <div>
                                            <div className="font-medium">
                                                Request #{r._id.slice(-6)}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                Cycle:{" "}
                                                {r.cycle?.name || r.cycle}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                From:{" "}
                                                {r.borrower?.name || r.borrower}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                Start:{" "}
                                                {new Date(
                                                    r.startTime
                                                ).toLocaleString()}
                                            </div>
                                            <div className="text-sm text-slate-500 mt-1">
                                                Status:{" "}
                                                <StatusBadge
                                                    status={r.status}
                                                />
                                            </div>
                                        </div>
                                        <div className="text-right flex gap-2">
                                            {/* If current user is the borrower allow cancel */}
                                            {getId(r.borrower) ===
                                                getId(user) &&
                                                r.status === "pending" && (
                                                    <Button
                                                        variant="ghost"
                                                        className="text-sm"
                                                        onClick={async () => {
                                                            try {
                                                                await cancelBooking(
                                                                    r._id
                                                                );
                                                                await getMyBookings();
                                                            } catch (err: any) {
                                                                const resp =
                                                                    err?.responseData;
                                                                if (
                                                                    resp &&
                                                                    resp.errors &&
                                                                    resp.errors
                                                                        .status &&
                                                                    resp.errors
                                                                        .status
                                                                        .message &&
                                                                    resp.errors.status.message.includes(
                                                                        "not a valid enum value"
                                                                    )
                                                                ) {
                                                                    await getMyBookings();
                                                                    useUiStore
                                                                        .getState()
                                                                        .notify(
                                                                            "Booking request cancelled",
                                                                            "success"
                                                                        );
                                                                    return;
                                                                }
                                                                useUiStore
                                                                    .getState()
                                                                    .notify(
                                                                        err.message ||
                                                                            "Failed to cancel booking",
                                                                        "error"
                                                                    );
                                                            }
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                )}

                                            {/* If current user is the owner allow approve/reject */}
                                            {getId(r.cycle?.owner) ===
                                                getId(user) &&
                                                r.status === "pending" && (
                                                    <>
                                                        <Button
                                                            variant="primary"
                                                            className="text-sm"
                                                            onClick={async () => {
                                                                await approveBooking(
                                                                    r._id
                                                                );
                                                                await getPendingRequests();
                                                                await getMyBookings();
                                                            }}
                                                        >
                                                            Approve
                                                        </Button>
                                                        <Button
                                                            variant="ghost"
                                                            className="text-sm"
                                                            onClick={async () => {
                                                                await rejectBooking(
                                                                    r._id
                                                                );
                                                                await getPendingRequests();
                                                            }}
                                                        >
                                                            Reject
                                                        </Button>
                                                    </>
                                                )}
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
