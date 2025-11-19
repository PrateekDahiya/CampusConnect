import { useState, useEffect } from "react";
import { useStore } from "../stores/useStore";
import { useAppStore } from "../stores/useAppStore";
import Button from "../components/Button";
import Card from "../components/Card";
import { Link } from "react-router-dom";

export default function Dashboard() {
    const {
        complaints,
        loadComplaints,
        cycles,
        loadCycles,
        bookings,
        loadBookings,
        lostFound,
        loadLostFound,
        books,
        queryBooks,
    } = useStore();
    const { user } = useAppStore();

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            setLoading(true);
            try {
                // Always load core lists
                await Promise.all([loadCycles(), queryBooks()]);

                // Role-specific loading
                if (!user || user.role === "student") {
                    // student: load own bookings + all complaints/lostfound for visibility
                    await Promise.all([
                        loadComplaints(),
                        loadLostFound(),
                        loadBookings(user?._id),
                    ]);
                } else if (user.role === "staff") {
                    // staff: load lists relevant to staff
                    await Promise.all([
                        loadComplaints(),
                        loadLostFound(),
                        loadBookings(),
                    ]);
                } else if (user.role === "admin") {
                    // admin: full overview
                    await Promise.all([
                        loadComplaints(),
                        loadLostFound(),
                        loadBookings(),
                    ]);
                } else {
                    // fallback
                    await Promise.all([
                        loadComplaints(),
                        loadLostFound(),
                        loadBookings(),
                    ]);
                }
            } catch (error) {
                console.error("Error loading dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, [loadComplaints, loadCycles, loadBookings, loadLostFound, queryBooks]);

    // Calculate statistics
    const stats = {
        totalComplaints: complaints.length,
        pendingComplaints: complaints.filter((c) => c.status === "Pending")
            .length,
        resolvedComplaints: complaints.filter((c) => c.status === "Resolved")
            .length,
        totalCycles: cycles.length,
        availableCycles: cycles.filter((c) => c.status === "available").length,
        totalBookings: bookings.length,
        activeBookings: bookings.filter((b) => b.status === "active").length,
        totalLostItems: lostFound.length,
        foundItems: lostFound.filter((item) => item.found).length,
        lostItems: lostFound.filter((item) => !item.found).length,
        totalBooks: books.length,
        availableBooks: books.filter((book) => book.status === "available")
            .length,
        lentBooks: books.filter((book) => book.status === "lent").length,
    };

    // Role-specific derivations
    const isStudent = user?.role === "student" || !user;
    const isStaff = user?.role === "staff";
    const isAdmin = user?.role === "admin";

    const myComplaints = user
        ? complaints.filter(
              (c) => c.createdBy === user._id || c.createdBy === user.name
          )
        : [];

    const pendingComplaints = complaints.filter((c) => c.status === "Pending");
    const pendingClaims = lostFound.filter(
        (i: any) => (i as any).claim && (i as any).claim.status === "pending"
    );
    const myLostReports = user
        ? lostFound.filter(
              (i) => i.reportedBy === user._id || i.reportedBy === user.name
          )
        : [];

    // Get recent activities
    const recentComplaints = complaints
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        )
        .slice(0, 3);

    const recentLostItems = lostFound
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        )
        .slice(0, 3);

    const recentBooks = books
        .sort(
            (a, b) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime()
        )
        .slice(0, 3);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="loading loading-spinner loading-lg"></div>
                    <p className="mt-4 text-slate-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <section className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 shadow">
                <div className="text-left">
                    <h1 className="text-4xl font-bold text-gray-900">
                        CampusConnect Dashboard
                    </h1>
                    <p className="py-4 text-slate-600 text-lg">
                        Your central hub for campus services - complaints,
                        cycles, books, and lost items.
                    </p>
                </div>
            </section>

            {/* Statistics Overview */}
            <section>
                <h2 className="text-2xl font-semibold mb-6">Overview</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Complaints Stats */}
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-orange-600">
                                    Complaints
                                </h3>
                                <p className="text-2xl font-bold">
                                    {stats.totalComplaints}
                                </p>
                                <p className="text-sm text-slate-600">
                                    {stats.pendingComplaints} pending,{" "}
                                    {stats.resolvedComplaints} resolved
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📋</span>
                            </div>
                        </div>
                    </Card>

                    {/* Cycles Stats */}
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-green-600">
                                    Cycles
                                </h3>
                                <p className="text-2xl font-bold">
                                    {stats.availableCycles}
                                </p>
                                <p className="text-sm text-slate-600">
                                    Available of {stats.totalCycles} total
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🚲</span>
                            </div>
                        </div>
                    </Card>

                    {/* Books Stats */}
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-blue-600">
                                    Books
                                </h3>
                                <p className="text-2xl font-bold">
                                    {stats.availableBooks}
                                </p>
                                <p className="text-sm text-slate-600">
                                    Available, {stats.lentBooks} lent
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">📚</span>
                            </div>
                        </div>
                    </Card>

                    {/* Lost & Found Stats */}
                    <Card>
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="font-semibold text-purple-600">
                                    Lost & Found
                                </h3>
                                <p className="text-2xl font-bold">
                                    {stats.lostItems}
                                </p>
                                <p className="text-sm text-slate-600">
                                    Lost, {stats.foundItems} found
                                </p>
                            </div>
                            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                                <span className="text-2xl">🔍</span>
                            </div>
                        </div>
                    </Card>
                </div>
            </section>
            {/* Student view */}
            {isStudent && (
                <section>
                    <h2 className="text-2xl font-semibold mb-4">
                        Your Activity
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <h3 className="font-semibold">My Complaints</h3>
                            <p className="text-sm text-slate-600">
                                {myComplaints.length} filed
                            </p>
                            <div className="mt-2">
                                {myComplaints.slice(0, 3).map((c) => (
                                    <div key={c.id} className="text-sm">
                                        {c.title} • {c.status}
                                    </div>
                                ))}
                            </div>
                        </Card>

                        <Card>
                            <h3 className="font-semibold">My Bookings</h3>
                            <p className="text-sm text-slate-600">
                                {
                                    bookings.filter(
                                        (b) => b.userId === user?._id
                                    ).length
                                }{" "}
                                active
                            </p>
                        </Card>

                        <Card>
                            <h3 className="font-semibold">My Lost Reports</h3>
                            <p className="text-sm text-slate-600">
                                {myLostReports.length} reported
                            </p>
                        </Card>
                    </div>
                </section>
            )}

            {/* Staff view */}
            {isStaff && (
                <section>
                    <h2 className="text-2xl font-semibold mb-4">
                        Staff Dashboard
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <h3 className="font-semibold">
                                Pending Complaints
                            </h3>
                            <p className="text-2xl font-bold">
                                {pendingComplaints.length}
                            </p>
                            <p className="text-sm text-slate-600">
                                Respond and add remarks
                            </p>
                        </Card>
                        <Card>
                            <h3 className="font-semibold">Pending Claims</h3>
                            <p className="text-2xl font-bold">
                                {pendingClaims.length}
                            </p>
                            <p className="text-sm text-slate-600">
                                Approve or reject claims
                            </p>
                        </Card>
                        <Card>
                            <h3 className="font-semibold">Active Bookings</h3>
                            <p className="text-2xl font-bold">
                                {
                                    bookings.filter(
                                        (b) => b.status === "active"
                                    ).length
                                }
                            </p>
                            <p className="text-sm text-slate-600">
                                Manage ongoing rentals
                            </p>
                        </Card>
                    </div>
                </section>
            )}

            {/* Admin view */}
            {isAdmin && (
                <section>
                    <h2 className="text-2xl font-semibold mb-4">
                        Admin Dashboard
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <h3 className="font-semibold">Total Complaints</h3>
                            <p className="text-2xl font-bold">
                                {stats.totalComplaints}
                            </p>
                            <p className="text-sm text-slate-600">
                                {stats.pendingComplaints} pending
                            </p>
                        </Card>
                        <Card>
                            <h3 className="font-semibold">
                                Total Users (placeholder)
                            </h3>
                            <p className="text-2xl font-bold">—</p>
                            <p className="text-sm text-slate-600">
                                Manage users from Admin panel
                            </p>
                        </Card>
                        <Card>
                            <h3 className="font-semibold">Pending Claims</h3>
                            <p className="text-2xl font-bold">
                                {pendingClaims.length}
                            </p>
                        </Card>
                    </div>
                </section>
            )}
            

            {/* Recent Activities */}
            <section>
                <h2 className="text-2xl font-semibold mb-6">
                    Recent Activities
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Recent Complaints */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Recent Complaints</h3>
                            <Link
                                to="/complaints"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentComplaints.length > 0 ? (
                                recentComplaints.map((complaint) => (
                                    <div
                                        key={complaint.id}
                                        className="border-l-4 border-orange-200 pl-3"
                                    >
                                        <p className="font-medium text-sm">
                                            {complaint.title}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {complaint.hostel}
                                        </p>
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs ${
                                                complaint.status === "Resolved"
                                                    ? "bg-green-100 text-green-800"
                                                    : complaint.status ===
                                                      "In Progress"
                                                    ? "bg-yellow-100 text-yellow-800"
                                                    : "bg-gray-100 text-gray-800"
                                            }`}
                                        >
                                            {complaint.status}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">
                                    No recent complaints
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Recent Books */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">Recent Books</h3>
                            <Link
                                to="/book-bank"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentBooks.length > 0 ? (
                                recentBooks.map((book) => (
                                    <div
                                        key={book.id}
                                        className="border-l-4 border-blue-200 pl-3"
                                    >
                                        <p className="font-medium text-sm">
                                            {book.title}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {book.author}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-medium">
                                                {book.type === "sell" &&
                                                    book.price &&
                                                    `₹${book.price}`}
                                                {book.type === "rent" &&
                                                    book.rent &&
                                                    `₹${book.rent}/month`}
                                                {book.type === "free" && "Free"}
                                            </span>
                                            <span
                                                className={`inline-block px-2 py-1 rounded text-xs ${
                                                    book.status === "available"
                                                        ? "bg-green-100 text-green-800"
                                                        : "bg-yellow-100 text-yellow-800"
                                                }`}
                                            >
                                                {book.status}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">
                                    No recent books
                                </p>
                            )}
                        </div>
                    </Card>

                    {/* Recent Lost Items */}
                    <Card>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold">
                                Recent Lost & Found
                            </h3>
                            <Link
                                to="/lost-found"
                                className="text-sm text-blue-600 hover:underline"
                            >
                                View all
                            </Link>
                        </div>
                        <div className="space-y-3">
                            {recentLostItems.length > 0 ? (
                                recentLostItems.map((item) => (
                                    <div
                                        key={item.id}
                                        className="border-l-4 border-purple-200 pl-3"
                                    >
                                        <p className="font-medium text-sm">
                                            {item.title}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {item.location}
                                        </p>
                                        <span
                                            className={`inline-block px-2 py-1 rounded text-xs ${
                                                item.found
                                                    ? "bg-green-100 text-green-800"
                                                    : "bg-red-100 text-red-800"
                                            }`}
                                        >
                                            {item.found ? "Found" : "Lost"}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                <p className="text-sm text-slate-500">
                                    No recent reports
                                </p>
                            )}
                        </div>
                    </Card>
                </div>
            </section>
        </div>
    );
}
