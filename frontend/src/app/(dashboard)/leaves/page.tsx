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
import { Badge } from "@/components/ui/badge"

interface Leave {
    id: string
    leaveType: string
    startDate: string
    endDate: string
    totalDays: number
    reason: string
    status: string
}

export default function LeavesPage() {
    const [leaves, setLeaves] = useState<Leave[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchLeaves()
    }, [])

    const fetchLeaves = async () => {
        try {
            const res = await api.get('/leaves')
            setLeaves(res.data.data || res.data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to fetch leave history")
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'APPROVED': return <Badge className="bg-green-600">Approved</Badge>
            case 'PENDING': return <Badge className="bg-yellow-600">Pending</Badge>
            case 'REJECTED': return <Badge className="bg-red-600">Rejected</Badge>
            default: return <Badge variant="secondary">{status}</Badge>
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Leave Management</h1>
                <Button asChild>
                    <Link href="/leaves/new">
                        <Plus className="mr-2 h-4 w-4" />
                        Apply for Leave
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>My Leave History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Type</TableHead>
                                <TableHead>Start Date</TableHead>
                                <TableHead>End Date</TableHead>
                                <TableHead>Days</TableHead>
                                <TableHead>Reason</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : leaves.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No leave records found.</TableCell>
                                </TableRow>
                            ) : (
                                leaves.map((leave) => (
                                    <TableRow key={leave.id}>
                                        <TableCell className="font-medium">{leave.leaveType.replace('_', ' ')}</TableCell>
                                        <TableCell>{new Date(leave.startDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{new Date(leave.endDate).toLocaleDateString()}</TableCell>
                                        <TableCell>{leave.totalDays}</TableCell>
                                        <TableCell className="max-w-[200px] truncate" title={leave.reason}>{leave.reason}</TableCell>
                                        <TableCell>{getStatusBadge(leave.status)}</TableCell>
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
