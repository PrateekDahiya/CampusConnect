import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";

type CommonProps = {
    children: React.ReactNode;
    variant?: Variant;
    className?: string;
};

type ButtonAsButton = CommonProps &
    React.ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type ButtonAsAnchor = CommonProps &
    React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export default function Button(props: ButtonAsButton | ButtonAsAnchor) {
    const {
        children,
        variant = "primary",
        className = "",
        ...rest
    } = props as any;
    const base =
        "inline-flex items-center justify-center rounded px-3 py-1.5 text-sm font-medium";
    const variants: Record<Variant, string> = {
        primary: "btn btn-primary",
        secondary: "btn btn-outline",
        ghost: "btn btn-ghost",
        danger: "bg-red-600 text-white hover:bg-red-700",
    };

    const vKey: Variant =
        variant && (variant in variants ? (variant as Variant) : "primary");
    const classes = `${base} ${variants[vKey]} ${className}`.trim();

    if ((props as any).href) {
        const p = rest as React.AnchorHTMLAttributes<HTMLAnchorElement>;
        return (
            <a {...p} href={(props as any).href} className={classes}>
                {children}
            </a>
        );
    }

    const b = rest as React.ButtonHTMLAttributes<HTMLButtonElement>;
    return (
        <button {...b} className={classes}>
            {children}
        </button>
    );
}
