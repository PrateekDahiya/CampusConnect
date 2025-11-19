import React, { useId } from "react";

export default function FormField({
    label,
    htmlFor,
    children,
    help,
    error,
    className = "",
    required = false,
}: {
    label: React.ReactNode;
    htmlFor?: string;
    children: React.ReactNode;
    help?: React.ReactNode;
    error?: string | null;
    className?: string;
    required?: boolean;
}) {
    const autoId = useId();
    const id = htmlFor || `field-${autoId}`;

    // If children is a single React element, inject the id prop for accessibility
    let input = children;
    if (React.isValidElement(children)) {
        input = React.cloneElement(children as any, {
            id: (children as any)?.props?.id || id,
        });
    }

    return (
        <div className={`mb-4 ${className}`.trim()}>
            <label
                className="block text-sm font-medium text-slate-700 mb-1"
                htmlFor={id}
            >
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <div>{input}</div>
            {help && <p className="mt-1 text-xs text-slate-500">{help}</p>}
            {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        </div>
    );
}
