"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus, RefreshCw, CheckCircle, XCircle, Mail } from "lucide-react"
import { toast } from "sonner"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface Employee {
    id: string
    employeeCode: string
    firstName: string
    lastName: string
    email: string
    department?: { name: string }
    status: string
    onboardingEmailSent?: boolean
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)
    const [resendingId, setResendingId] = useState<string | null>(null)
    const [role, setRole] = useState<string | null>(null)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const u = localStorage.getItem('user')
            if (u && u !== 'undefined') {
                try {
                    const parsed = JSON.parse(u)
                    setRole(parsed?.role ?? null)
                    if (parsed?.role === 'ADMIN' || parsed?.role === 'HR' || parsed?.role === 'MANAGER') {
                        fetchEmployees()
                    } else {
                        setLoading(false)
                    }
                } catch {
                    setLoading(false)
                }
            } else {
                window.location.href = '/login'
            }
        }
    }, [])

    const fetchEmployees = async () => {
        try {
            const res = await api.get('/employees')
            // Adjust based on actual API response structure
            setEmployees(res.data.data || res.data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to fetch employees")
        } finally {
            setLoading(false)
        }
    }

    const handleResendEmail = async (id: string, email: string) => {
        setResendingId(id)
        try {
            await api.post(`/employees/${id}/resend-onboarding-email`)
            toast.success(`Onboarding email resent to ${email}`)
            // Update local state
            setEmployees(prev => prev.map(emp =>
                emp.id === id ? { ...emp, onboardingEmailSent: true } : emp
            ))
        } catch (error) {
            console.error(error)
            toast.error("Failed to resend email")
        } finally {
            setResendingId(null)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                {role && (role === 'ADMIN' || role === 'HR') && (
                    <Button asChild>
                        <Link href="/employees/new">
                            <Plus className="mr-2 h-4 w-4" />
                            Add Employee
                        </Link>
                    </Button>
                )}
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Employees</CardTitle>
                </CardHeader>
                <CardContent>
                    {role && !(role === 'ADMIN' || role === 'HR' || role === 'MANAGER') ? (
                        <div className="text-center py-12">
                            <p className="text-lg font-semibold">Access denied</p>
                            <p className="text-sm text-muted-foreground">You do not have permission to view employees.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Code</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Email</TableHead>
                                    <TableHead>Department</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Email Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">Loading...</TableCell>
                                    </TableRow>
                                ) : employees.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} className="text-center">No employees found.</TableCell>
                                    </TableRow>
                                ) : (
                                    employees.map((emp) => (
                                        <TableRow key={emp.id}>
                                            <TableCell className="font-medium">{emp.employeeCode}</TableCell>
                                            <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                                            <TableCell>{emp.email}</TableCell>
                                            <TableCell>{emp.department?.name || '-'}</TableCell>
                                            <TableCell>{emp.status}</TableCell>
                                            <TableCell>
                                                {emp.onboardingEmailSent ? (
                                                    <div className="flex items-center text-green-600">
                                                        <CheckCircle className="h-4 w-4 mr-1" />
                                                        <span className="text-xs">Sent</span>
                                                    </div>
                                                ) : (
                                                    <TooltipProvider>
                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                <div className="flex items-center text-red-500 cursor-help">
                                                                    <XCircle className="h-4 w-4 mr-1" />
                                                                    <span className="text-xs">Failed</span>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent>
                                                                <p>Email delivery failed. Click resend icon.</p>
                                                            </TooltipContent>
                                                        </Tooltip>
                                                    </TooltipProvider>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right flex justify-end items-center space-x-2">
                                                {!emp.onboardingEmailSent && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-blue-600"
                                                        disabled={resendingId === emp.id}
                                                        onClick={() => handleResendEmail(emp.id, emp.email)}
                                                        title="Resend Onboarding Email"
                                                    >
                                                        {resendingId === emp.id ? (
                                                            <RefreshCw className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <Mail className="h-4 w-4" />
                                                        )}
                                                    </Button>
                                                )}
                                                <Link href={`/employees/${emp.id}`} className="text-sm font-medium text-blue-600 hover:underline">
                                                    View
                                                </Link>
                                                <Link href={`/employees/${emp.id}/edit`} className="text-sm font-medium text-green-600 hover:underline">
                                                    Edit
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
