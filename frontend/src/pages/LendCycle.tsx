import { useEffect, useState } from "react";
import { useStore } from "../stores/useStore";

// For demo purposes assume a fixed user id
const DEMO_USER = "student-123";

export default function LendCycle() {
    const {
        cycles,
        loadCycles,
        bookCycle,
        bookings,
        loadBookings,
        returnBooking,
    } = useStore();
    const [locationFilter, setLocationFilter] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);
        loadCycles({ status: "available" }).finally(() => setLoading(false));
        loadBookings(DEMO_USER);
    }, []);

    const onFilter = async () => {
        setLoading(true);
        await loadCycles({
            status: "available",
            location: locationFilter || undefined,
        });
        setLoading(false);
    };

    const onBook = async (cycleId: string) => {
        try {
            setLoading(true);
            // expected return time 1 hour from now for demo
            const expected = new Date(
                Date.now() + 60 * 60 * 1000
            ).toISOString();
            await bookCycle(DEMO_USER, cycleId, expected);
            await loadBookings(DEMO_USER);
        } catch (e: any) {
            alert(e.message || "Booking failed");
        } finally {
            setLoading(false);
        }
    };

    const onReturn = async (bookingId: string) => {
        setLoading(true);
        await returnBooking(bookingId);
        await loadBookings(DEMO_USER);
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Lend a Cycle</h1>
                    <p className="text-slate-600">
                        View available cycles and manage bookings.
                    </p>
                </div>
            </div>

            <div className="bg-white p-4 rounded shadow">
                <div className="flex gap-2 mb-4">
                    <input
                        value={locationFilter}
                        onChange={(e) => setLocationFilter(e.target.value)}
                        placeholder="Filter by location or hostel"
                        className="flex-1 border rounded px-3 py-2"
                    />
                    <button className="btn btn-primary" onClick={onFilter}>
                        Filter
                    </button>
                    <button
                        className="btn"
                        onClick={() => {
                            setLocationFilter("");
                            loadCycles({ status: "available" });
                        }}
                    >
                        Clear
                    </button>
                </div>

                {loading && (
                    <div className="text-sm text-slate-500">
                        Loading cycles...
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {cycles.map((c) => (
                        <div key={c.id} className="p-4 border rounded">
                            <div className="flex justify-between items-center">
                                <div>
                                    <div className="font-semibold">
                                        {c.model || "Standard Bike"}
                                    </div>
                                    <div className="text-sm text-slate-500">
                                        {c.location}{" "}
                                        {c.station ? `· ${c.station}` : ""}
                                    </div>
                                </div>
                                <div>
                                    <div className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                                        {c.status}
                                    </div>
                                </div>
                            </div>
                            <div className="mt-3 flex justify-end">
                                <button
                                    className="btn btn-sm btn-primary"
                                    onClick={() => onBook(c.id)}
                                >
                                    Book Now
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-xl font-semibold">My Bookings</h2>
                <div className="space-y-3 mt-3">
                    {bookings.length === 0 && (
                        <div className="text-sm text-slate-500">
                            No bookings
                        </div>
                    )}
                    {bookings.map((b) => (
                        <div
                            key={b.id}
                            className="p-3 bg-white border rounded flex justify-between items-center"
                        >
                            <div>
                                <div className="font-medium">
                                    Booking for {b.cycleId}
                                </div>
                                <div className="text-sm text-slate-500">
                                    Start:{" "}
                                    {new Date(b.startTime).toLocaleString()}
                                </div>
                                <div className="text-sm text-slate-500">
                                    Expected Return:{" "}
                                    {new Date(
                                        b.expectedReturnTime
                                    ).toLocaleString()}
                                </div>
                                {b.returnTime && (
                                    <div className="text-sm text-slate-500">
                                        Returned:{" "}
                                        {new Date(
                                            b.returnTime
                                        ).toLocaleString()}
                                    </div>
                                )}
                            </div>
                            <div className="text-right">
                                {b.status !== "returned" ? (
                                    <button
                                        className="btn btn-sm"
                                        onClick={() => onReturn(b.id)}
                                    >
                                        Return Cycle
                                    </button>
                                ) : (
                                    <div className="text-sm text-slate-500">
                                        Returned
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
