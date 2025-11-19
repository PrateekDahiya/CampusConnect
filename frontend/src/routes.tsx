import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Complaints from "./pages/Complaints";
import LendCycle from "./pages/LendCycle";
import LostFound from "./pages/LostFoundNew";
import BookBank from "./pages/BookBank";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import About from "./pages/About";
import { useAppStore } from "./stores/useAppStore";
import React from "react";

function RequireAdmin({ children }: { children: React.ReactNode }) {
    const { user } = useAppStore();
    if (!user || user.role !== "admin") return <Navigate to="/" replace />;
    return <>{children}</>;
}

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="complaints" element={<Complaints />} />
                    <Route path="lend-cycle" element={<LendCycle />} />
                    <Route path="lost-found" element={<LostFound />} />
                    <Route path="book-bank" element={<BookBank />} />
                    <Route path="home" element={<Home />} />
                    <Route
                        path="admin"
                        element={
                            <RequireAdmin>
                                <Admin />
                            </RequireAdmin>
                        }
                    />
                    <Route path="about" element={<About />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
