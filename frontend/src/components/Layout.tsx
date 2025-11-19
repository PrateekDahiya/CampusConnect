import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import AuthWrapper from "./AuthWrapper";
import UiOverlay from "./UiOverlay";

export default function Layout() {
    return (
        <AuthWrapper>
            <div className="min-h-screen bg-slate-50 text-slate-900">
                <Navbar />
                <main className="pt-16 p-4 max-w-7xl mx-auto">
                    <Outlet />
                </main>
                <UiOverlay />
            </div>
        </AuthWrapper>
    );
}
