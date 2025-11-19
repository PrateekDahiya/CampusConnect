import React from "react";

type Variant =
    | "neutral"
    | "student"
    | "staff"
    | "admin"
    | "info"
    | "success"
    | "warning"
    | "danger";

const variantClasses: Record<Variant, string> = {
    neutral: "bg-slate-100 text-slate-800",
    student: "bg-blue-50 text-blue-700",
    staff: "bg-green-50 text-green-700",
    admin: "bg-purple-50 text-purple-700",
    info: "bg-sky-50 text-sky-700",
    success: "bg-green-50 text-green-700",
    warning: "bg-yellow-50 text-yellow-700",
    danger: "bg-red-50 text-red-700",
};

export default function Badge({
    children,
    variant = "neutral",
    className = "",
}: {
    children: React.ReactNode;
    variant?: Variant;
    className?: string;
}) {
    return (
        <span
            className={`px-2 py-0.5 rounded text-xs font-medium ${variantClasses[variant]} ${className}`.trim()}
        >
            {children}
        </span>
    );
}
