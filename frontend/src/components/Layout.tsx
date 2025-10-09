import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function Layout() {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <Navbar />
            <main className="p-4 max-w-7xl mx-auto">
                <Outlet />
            </main>
        </div>
    );
}
