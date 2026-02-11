"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, CalendarDays, Briefcase } from "lucide-react"
import api from "@/lib/api"
// import { toast } from "sonner" // Removed unused toast

interface DashboardStats {
    totalEmployees: number
    activeEmployees: number
    onLeaveToday: number
    openPositions: number
}

interface User {
    role: string
    firstName: string
    lastName: string
}

export default function DashboardPage() {
    const [stats, setStats] = useState<DashboardStats | null>(null)
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('user')
            if (stored) {
                const u = JSON.parse(stored)
                setUser(u)

                if (u.role === 'ADMIN' || u.role === 'HR') {
                    fetchAdminStats()
                } else {
                    setLoading(false) // No specific stats for employee yet in this view
                }
            }
        }
    }, [])

    const fetchAdminStats = async () => {
        try {
            const res = await api.get('/dashboard/admin-stats')
            setStats(res.data.data) // Assuming wrapped in { success: true, data: ... }
        } catch (error) {
            console.error(error)
            // toast.error("Failed to load dashboard stats")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            </div>

            {/* Admin/HR Stats */}
            {(user?.role === 'ADMIN' || user?.role === 'HR') && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Employees
                            </CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats?.totalEmployees || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Active in system
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Active Today
                            </CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats?.activeEmployees || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Punched in
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">On Leave</CardTitle>
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats?.onLeaveToday || 0}</div>
                            <p className="text-xs text-muted-foreground">
                                Approved leaves
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Open Positions
                            </CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats?.openPositions || 3}</div>
                            <p className="text-xs text-muted-foreground">
                                Across departments
                            </p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Employee View */}
            {!(user?.role === 'ADMIN' || user?.role === 'HR') && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle>Welcome back, {user?.firstName}!</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Mark your attendance for today.</p>
                            <Button className="mt-4">Punch In</Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
