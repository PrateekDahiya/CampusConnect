import { Link, useLocation } from "react-router-dom";
import { useAppStore } from "../stores/useAppStore";
import Button from "./Button";
import Badge from "./Badge";

export default function Navbar() {
    const { user, logout } = useAppStore();
    const location = useLocation();

    const isActive = (path: string) =>
        path === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(path);

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="text-xl font-semibold text-sky-600">
                    CampusConnect
                </Link>
                <nav className="space-x-2 hidden md:flex">
                    <Button
                        href="/"
                        variant="ghost"
                        className={`btn-sm ${
                            isActive("/") ? "bg-sky-100 text-sky-700" : ""
                        }`}
                    >
                        Dashboard
                    </Button>
                    <Button
                        href="/complaints"
                        variant="ghost"
                        className={`btn-sm ${
                            isActive("/complaints")
                                ? "bg-sky-100 text-sky-700"
                                : ""
                        }`}
                    >
                        Complaints
                    </Button>
                    <Button
                        href="/lend-cycle"
                        variant="ghost"
                        className={`btn-sm ${
                            isActive("/lend-cycle")
                                ? "bg-sky-100 text-sky-700"
                                : ""
                        }`}
                    >
                        Lend a Cycle
                    </Button>
                    <Button
                        href="/lost-found"
                        variant="ghost"
                        className={`btn-sm ${
                            isActive("/lost-found")
                                ? "bg-sky-100 text-sky-700"
                                : ""
                        }`}
                    >
                        Lost & Found
                    </Button>
                    <Button
                        href="/book-bank"
                        variant="ghost"
                        className={`btn-sm ${
                            isActive("/book-bank")
                                ? "bg-sky-100 text-sky-700"
                                : ""
                        }`}
                    >
                        Book Bank
                    </Button>
                    {user?.role === "admin" && (
                        <Button
                            href="/admin"
                            variant="ghost"
                            className={`btn-sm ${
                                isActive("/admin")
                                    ? "bg-sky-100 text-sky-700"
                                    : ""
                            }`}
                        >
                            Admin
                        </Button>
                    )}
                </nav>
                <div className="flex items-center space-x-4">
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-slate-600">
                            {user?.name}
                        </span>
                        {user?.role && (
                            <Badge
                                variant={user.role as any}
                                className="text-xs"
                            >
                                {user.role}
                            </Badge>
                        )}
                    </div>
                    <Button variant="ghost" onClick={logout} className="btn-sm">
                        Logout
                    </Button>
                </div>
            </div>
        </header>
    );
}
