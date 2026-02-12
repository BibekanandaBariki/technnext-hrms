"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Plus } from "lucide-react"
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

interface Employee {
    id: string
    employeeCode: string
    firstName: string
    lastName: string
    email: string
    department?: { name: string }
    status: string
}

export default function EmployeesPage() {
    const [employees, setEmployees] = useState<Employee[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchEmployees()
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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
                <Button asChild>
                    <Link href="/employees/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Employee
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>All Employees</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Email</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : employees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No employees found.</TableCell>
                                </TableRow>
                            ) : (
                                employees.map((emp) => (
                                    <TableRow key={emp.id}>
                                        <TableCell className="font-medium">{emp.employeeCode}</TableCell>
                                        <TableCell>{emp.firstName} {emp.lastName}</TableCell>
                                        <TableCell>{emp.email}</TableCell>
                                        <TableCell>{emp.department?.name || '-'}</TableCell>
                                        <TableCell>{emp.status}</TableCell>
                                        <TableCell className="text-right space-x-2">
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
                </CardContent>
            </Card>
        </div>
    )
}
