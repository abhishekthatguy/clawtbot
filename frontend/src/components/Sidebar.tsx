"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: "⚡" },
    { href: "/chat", label: "Master Agent", icon: "🤖" },
    { href: "/content", label: "Content", icon: "📝" },
    { href: "/workflows", label: "Workflows", icon: "🔄" },
    { href: "/analytics", label: "Analytics", icon: "📊" },
    { href: "/settings", label: "Settings", icon: "⚙️" },
];

const AUTH_ROUTES = ["/login", "/signup", "/forgot-password", "/reset-password", "/verify"];
const LANDING_ROUTES = ["/about", "/privacy", "/terms", "/resources"];

export default function Sidebar() {
    const pathname = usePathname();

    // Hide sidebar on auth and landing pages
    if (
        pathname === "/" ||
        AUTH_ROUTES.some((r) => pathname.startsWith(r)) ||
        LANDING_ROUTES.some((r) => pathname.startsWith(r))
    ) {
        return null;
    }

    return (
        <aside className="fixed left-0 top-0 h-screen w-64 flex flex-col"
            style={{
                background: "linear-gradient(180deg, #0d0d14 0%, #12121a 100%)",
                borderRight: "1px solid var(--clawt-border)",
            }}
        >
            {/* Logo */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold"
                    style={{
                        background: "linear-gradient(135deg, #dc2626, #7f1d1d)",
                        boxShadow: "0 0 20px rgba(220, 38, 38, 0.3)",
                    }}
                >
                    C
                </div>
                <div>
                    <h1 className="text-lg font-bold gradient-text">ClawtBot</h1>
                    <p className="text-xs" style={{ color: "var(--clawt-text-dim)" }}>
                        AI Agent System
                    </p>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 mt-4">
                {NAV_ITEMS.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-medium transition-all duration-300 ${isActive
                                ? "text-white"
                                : "hover:text-white"
                                }`}
                            style={{
                                color: isActive ? "white" : "var(--clawt-text-dim)",
                                background: isActive
                                    ? "linear-gradient(135deg, rgba(220, 38, 38, 0.2), rgba(220, 38, 38, 0.05))"
                                    : "transparent",
                                borderLeft: isActive ? "3px solid #dc2626" : "3px solid transparent",
                            }}
                        >
                            <span className="text-lg">{item.icon}</span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* System Status Footer */}
            <div className="px-3 pb-4">
                <div className="p-4 rounded-xl" style={{ background: "var(--clawt-surface-2)" }}>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-xs font-medium" style={{ color: "var(--clawt-text)" }}>
                            System Online
                        </span>
                    </div>
                    <p className="text-xs" style={{ color: "var(--clawt-text-dim)" }}>
                        7 Agents Active
                    </p>
                    <div className="mt-2 grid grid-cols-3 gap-1.5">
                        <div className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-green-500" />
                            <span className="text-[9px]" style={{ color: "var(--clawt-text-dim)" }}>Ollama</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-green-500" />
                            <span className="text-[9px]" style={{ color: "var(--clawt-text-dim)" }}>DB</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <div className="w-1 h-1 rounded-full bg-green-500" />
                            <span className="text-[9px]" style={{ color: "var(--clawt-text-dim)" }}>Redis</span>
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
