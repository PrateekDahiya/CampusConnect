import { type ReactNode, useEffect, useRef } from "react";
import { useAppStore } from "../stores/useAppStore";
import Login from "./Login";

interface AuthWrapperProps {
    children: ReactNode;
}

export default function AuthWrapper({ children }: AuthWrapperProps) {
    const { isAuthenticated, user, initialized, loading, initializeAuth } =
        useAppStore();
    const initRef = useRef(false);

    useEffect(() => {
        if (!initialized && !initRef.current) {
            console.log("Initializing authentication");
            initRef.current = true;
            initializeAuth();
        }
    }, [initialized, initializeAuth]);

    // Show loading spinner while initializing
    if (!initialized || loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Login />;
    }

    return <>{children}</>;
}
