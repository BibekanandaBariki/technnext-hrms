"use client"

import { useEffect, useState } from "react"
import { Bell, User } from "lucide-react" // Import User explicitly to avoid conflict with type
import { Button } from "@/components/ui/button"

interface User {
    email: string
    role: string
}

export function Header() {
    const [user, setUser] = useState<User | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('user')
            // eslint-disable-next-line
            if (stored) setUser(JSON.parse(stored))
        }
    }, [])

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-card px-6 lg:h-[60px]">
            <div className="w-full flex-1">
                {/* Breadcrumb or Search could go here */}
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Notifications</span>
            </Button>
            <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200">
                    <User className="h-5 w-5 text-slate-600" />
                </div>
                <div className="hidden text-sm md:block">
                    <p className="font-medium">{user?.email || 'User'}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user?.role?.toLowerCase() || 'Employee'}</p>
                </div>
            </div>
        </header>
    )
}
