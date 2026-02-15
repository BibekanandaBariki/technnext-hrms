"use client"

import { useEffect, useState, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, UserCheck, CalendarDays, Briefcase } from "lucide-react"
import api from "@/lib/api"
// import { toast } from "sonner" // Removed unused toast

const REQUIRED_TYPES = ["GOVERNMENT_ID","TAX_ID","RESUME","PROFILE_PHOTO","BANK_PROOF","EDUCATION","EXPERIENCE","OFFER_LETTER"]

interface DashboardStats {
    totalEmployees: number
    activeEmployees: number
    onLeaveToday: number
    openPositions: number
    pendingOnboarding?: number
    pendingDocuments?: number
    payrollDraft?: number
    payrollProcessed?: number
    payrollPaid?: number
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
    const [docSummary, setDocSummary] = useState<{ approved: string[], pending: string[], missing: string[] }>({ approved: [], pending: [], missing: [] })
    const [managerStats, setManagerStats] = useState<{ teamSize: number, teamPresentToday: number, teamPendingLeaves: number, teamGoalsInProgress: number, reviewsThisQuarter: number } | null>(null)
    const [managerTeam, setManagerTeam] = useState<Array<{ id: string, name: string, email: string, todayStatus: string, pendingLeaves: number }>>([])

    const fetchAdminStats = useCallback(async () => {
        try {
            const res = await api.get('/dashboard/admin-stats')
            setStats(res.data.data)
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchManagerStats = useCallback(async () => {
        try {
            const res = await api.get('/dashboard/manager-stats')
            setManagerStats(res.data.data)
        } catch (error) {
            console.error(error)
        }
    }, [])

    const fetchManagerTeam = useCallback(async () => {
        try {
            const res = await api.get('/dashboard/manager-team')
            setManagerTeam(res.data.data || res.data || [])
        } catch (error) {
            console.error(error)
        }
    }, [])

    const fetchEmployeeDocuments = useCallback(async () => {
        try {
            const res = await api.get('/documents')
            const docs: Array<{ documentType: string, status: string }> = res.data.data || []
            const approved = docs.filter(d => d.status === 'APPROVED').map(d => d.documentType)
            const pending = docs.filter(d => d.status === 'PENDING').map(d => d.documentType)
            const missing = REQUIRED_TYPES.filter(t => !approved.includes(t) && !pending.includes(t))
            setDocSummary({ approved, pending, missing })
        } catch {
            setDocSummary({ approved: [], pending: [], missing: REQUIRED_TYPES })
        }
    }, [])

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem('user')
            if (stored) {
                const u = JSON.parse(stored)
                setUser(u)

                if (u.role === 'ADMIN' || u.role === 'HR') {
                    fetchAdminStats()
                } else if (u.role === 'MANAGER') {
                    fetchManagerStats()
                    fetchManagerTeam()
                    setLoading(false)
                } else {
                    fetchEmployeeDocuments()
                    setLoading(false)
                }
            } else {
                // Redirect to login if not authenticated
                window.location.href = '/login';
            }
        }
    }, [fetchAdminStats, fetchManagerStats, fetchManagerTeam, fetchEmployeeDocuments])

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
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Onboarding</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats?.pendingOnboarding || 0}</div>
                            <p className="text-xs text-muted-foreground">Awaiting document approval</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Documents to Review</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats?.pendingDocuments || 0}</div>
                            <p className="text-xs text-muted-foreground">HR/Admin review queue</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payroll (Processed)</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats?.payrollProcessed || 0}</div>
                            <p className="text-xs text-muted-foreground">Including current month</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Payroll (Paid)</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{loading ? "..." : stats?.payrollPaid || 0}</div>
                            <p className="text-xs text-muted-foreground">Paid out records</p>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Employee View */}
            {user?.role === 'EMPLOYEE' && (
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
                    <Card>
                        <CardHeader>
                            <CardTitle>Onboarding Checklist</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex gap-2">
                                    <Button size="sm" variant="outline" onClick={fetchEmployeeDocuments}>Refresh</Button>
                                    <Button size="sm" variant="default" onClick={() => { window.location.href = '/documents' }}>Upload Documents</Button>
                                </div>
                                <ul className="space-y-2">
                                    {REQUIRED_TYPES.map((t) => {
                                        const status = docSummary.approved.includes(t)
                                            ? "Approved"
                                            : docSummary.pending.includes(t)
                                                ? "Pending"
                                                : "Missing"
                                        const color =
                                            status === "Approved" ? "text-green-600" :
                                            status === "Pending" ? "text-yellow-600" :
                                            "text-red-600"
                                        return (
                                            <li key={t} className="flex items-center justify-between">
                                                <span className="text-sm">{t.replace("_", " ")}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className={`text-xs ${color}`}>{status}</span>
                                                    <Button size="sm" variant="ghost" onClick={() => { window.location.href = `/documents?type=${t}` }}>Open</Button>
                                                </div>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle>Payslip</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">View and download your payslips.</p>
                            <Button className="mt-2" variant="ghost" onClick={() => { window.location.href = '/payroll' }}>Go to Payroll</Button>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Manager View */}
            {user?.role === 'MANAGER' && (
                <div className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Team Size</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{managerStats?.teamSize ?? 0}</div>
                            <p className="text-xs text-muted-foreground">Direct reports</p>
                        </CardContent>
                        </Card>
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Present Today</CardTitle>
                            <UserCheck className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{managerStats?.teamPresentToday ?? 0}</div>
                            <p className="text-xs text-muted-foreground">Attendance</p>
                        </CardContent>
                        </Card>
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Leaves</CardTitle>
                            <CalendarDays className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{managerStats?.teamPendingLeaves ?? 0}</div>
                            <p className="text-xs text-muted-foreground">Awaiting approval</p>
                        </CardContent>
                        </Card>
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Goals In Progress</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{managerStats?.teamGoalsInProgress ?? 0}</div>
                            <p className="text-xs text-muted-foreground">Active goals</p>
                        </CardContent>
                        </Card>
                        <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Reviews This Quarter</CardTitle>
                            <Briefcase className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{managerStats?.reviewsThisQuarter ?? 0}</div>
                            <p className="text-xs text-muted-foreground">Submitted</p>
                        </CardContent>
                        </Card>
                    </div>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">My Team</CardTitle>
                            <div className="flex gap-2">
                                <Button size="sm" variant="outline" onClick={() => { window.location.href = '/leaves?view=pending' }}>View Pending Leaves</Button>
                                <Button size="sm" variant="outline" onClick={() => { window.location.href = '/performance' }}>Team Goals</Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="min-w-full text-sm">
                                    <thead>
                                        <tr className="text-left border-b">
                                            <th className="py-2 pr-4">Employee</th>
                                            <th className="py-2 pr-4">Email</th>
                                            <th className="py-2 pr-4">Today</th>
                                            <th className="py-2 pr-4">Pending Leaves</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {managerTeam.map((m) => (
                                            <tr key={m.id} className="border-b last:border-0">
                                                <td className="py-2 pr-4">{m.name}</td>
                                                <td className="py-2 pr-4">{m.email}</td>
                                                <td className="py-2 pr-4">{m.todayStatus.replace('_', ' ')}</td>
                                                <td className="py-2 pr-4">{m.pendingLeaves}</td>
                                            </tr>
                                        ))}
                                        {managerTeam.length === 0 && (
                                            <tr>
                                                <td className="py-4 text-muted-foreground" colSpan={4}>No direct reports.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    )
}
