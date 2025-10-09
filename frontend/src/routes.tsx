import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Complaints from "./pages/Complaints";
import LendCycle from "./pages/LendCycle";
import LostFound from "./pages/LostFound";
import BookBank from "./pages/BookBank";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import About from "./pages/About";

export default function AppRoutes() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="complaints" element={<Complaints />} />
                    <Route path="lend-cycle" element={<LendCycle />} />
                    <Route path="lost-found" element={<LostFound />} />
                    <Route path="book-bank" element={<BookBank />} />
                    <Route path="dashboard" element={<Dashboard />} />
                    <Route path="admin" element={<Admin />} />
                    <Route path="about" element={<About />} />
                </Route>
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
