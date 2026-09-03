"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    LayoutDashboard,
    Briefcase,
    Tag,
    FolderKanban,
    Settings,
} from "lucide-react";

const links = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
    { href: "/admin/work", label: "Work", icon: Briefcase },
    { href: "/admin/projects", label: "Projects", icon: FolderKanban },
    { href: "/admin/brands", label: "Brands", icon: Tag },
    { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-1.5">
            {links.map(({ href, label, icon: Icon, exact }) => {
                const isActive = exact ? pathname === href : pathname.startsWith(href);
                return (
                    <Link
                        key={href}
                        href={href}
                        onClick={onNavigate}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-[14px] sm:text-[15px] transition-colors ${isActive
                            ? "bg-white/10 text-white"
                            : "text-white/50 hover:bg-white/5 hover:text-white/80"
                            }`}
                    >
                        <Icon
                            size={17}
                            strokeWidth={2}
                            className={isActive ? "text-white" : "text-white/40 group-hover:text-white/70"}
                        />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}