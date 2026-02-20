"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Users, UserCheck, CalendarDays, Receipt, BarChart3, FileText, LogOut } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
    },
    {
        title: "Employees",
        href: "/employees",
        icon: Users,
        roles: ["ADMIN", "HR", "MANAGER"],
    },
    {
        title: "Attendance",
        href: "/attendance",
        icon: UserCheck,
    },
    {
        title: "Leaves",
        href: "/leaves",
        icon: CalendarDays,
    },
    {
        title: "Payroll",
        href: "/payroll",
        icon: Receipt,
    },
    {
        title: "Performance",
        href: "/performance",
        icon: BarChart3,
    },
    {
        title: "Tax",
        href: "/tax",
        icon: FileText,
    },
    {
        title: "Documents",
        href: "/documents",
        icon: FileText,
    },
]

export function Sidebar() {
    const pathname = usePathname()
    let role: string | null = null
    if (typeof window !== "undefined") {
        try {
            const u = localStorage.getItem("user")
            if (u && u !== "undefined") {
                role = JSON.parse(u)?.role ?? null
            }
        } catch {
            role = null
        }
    }
    const filteredItems = sidebarItems.filter((item) => {
        if (!item.roles || item.roles.length === 0) return true
        return role ? item.roles.includes(role) : false
    })

    return (
        <div className="flex h-full flex-col border-r bg-card">
            <div className="flex h-14 items-center border-b px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    {/* <LayoutDashboard className="h-6 w-6" /> */}
                    {/* <span>Technnext HRMS</span> */}
                    <div className="relative h-10 w-36">
                        <Image src="/technext-logo.png" alt="Technnext HRMS" fill className="object-contain" priority />
                    </div>
                </Link>
            </div>
            <div className="flex-1 overflow-auto py-4">
                <nav className="grid gap-1 px-2">
                    {filteredItems.map((item, index) => {
                        const Icon = item.icon
                        return (
                            <Link
                                key={index}
                                href={item.href}
                                className={cn(
                                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                                    pathname === item.href ? "bg-accent text-accent-foreground" : "transparent"
                                )}
                            >
                                <Icon className="h-4 w-4" />
                                <span>{item.title}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>
            <div className="mt-auto border-t p-4">
                <Button variant="ghost" className="w-full justify-start gap-2" onClick={() => {
                    if (typeof window !== 'undefined') {
                        localStorage.removeItem('token');
                        localStorage.removeItem('user');
                        window.location.href = '/login';
                    }
                }}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                </Button>
            </div>
        </div>
    )
}
