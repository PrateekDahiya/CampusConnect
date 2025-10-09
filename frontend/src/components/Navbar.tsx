import { Link } from "react-router-dom";

export default function Navbar() {
    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto p-4 flex items-center justify-between">
                <Link to="/" className="text-xl font-semibold text-sky-600">
                    CampusConnect
                </Link>
                <nav className="space-x-4 hidden md:flex">
                    <Link
                        to="/"
                        className="text-sm text-slate-700 hover:text-sky-600"
                    >
                        Home
                    </Link>
                    <Link
                        to="/complaints"
                        className="text-sm text-slate-700 hover:text-sky-600"
                    >
                        Complaints
                    </Link>
                    <Link
                        to="/lend-cycle"
                        className="text-sm text-slate-700 hover:text-sky-600"
                    >
                        Lend a Cycle
                    </Link>
                    <Link
                        to="/lost-found"
                        className="text-sm text-slate-700 hover:text-sky-600"
                    >
                        Lost & Found
                    </Link>
                    <Link
                        to="/book-bank"
                        className="text-sm text-slate-700 hover:text-sky-600"
                    >
                        Book Bank
                    </Link>
                    <Link
                        to="/dashboard"
                        className="text-sm text-slate-700 hover:text-sky-600"
                    >
                        Dashboard
                    </Link>
                    <Link
                        to="/admin"
                        className="text-sm text-slate-700 hover:text-sky-600"
                    >
                        Admin
                    </Link>
                </nav>
            </div>
        </header>
    );
}
