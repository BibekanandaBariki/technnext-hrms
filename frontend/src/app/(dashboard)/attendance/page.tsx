"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Play, Square, MapPin } from "lucide-react"

import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

interface AttendanceStatus {
    punchIn: string | null
    punchOut: string | null
    workHours: number
    ipAddress: string
}

interface AttendanceRecord {
    id: string
    date: string
    punchIn: string | null
    punchOut: string | null
    workHours: number
    attendanceType: string
}

export default function AttendancePage() {
    const [status, setStatus] = useState<AttendanceStatus | null>(null)
    const [history, setHistory] = useState<AttendanceRecord[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            const [statusRes, historyRes] = await Promise.all([
                api.get('/attendance/today').catch(() => ({ data: { data: null } })), // Handle 404/Empty gracefully
                api.get('/attendance/my-attendance')
            ])
            setStatus(statusRes.data.data)
            setHistory(historyRes.data.data || historyRes.data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to load attendance data")
        } finally {
            setLoading(false)
        }
    }

    const handlePunch = async (type: 'in' | 'out') => {
        setActionLoading(true)
        try {
            const endpoint = type === 'in' ? '/attendance/punch-in' : '/attendance/punch-out'
            const body = type === 'in' ? { remarks: 'Web Punch' } : {}

            await api.post(endpoint, body)
            toast.success(`Punch ${type.toUpperCase()} successful`)
            fetchData() // Refresh
        } catch (error) {
            console.error(error)
            const msg = (error as any)?.response?.data?.message || "Action failed"
            toast.error(msg)
        } finally {
            setActionLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Attendance</h1>

            {/* Punch Widget */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Today&apos;s Status</CardTitle>
                        <CardDescription>{format(new Date(), 'EEEE, MMMM do, yyyy')}</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col items-center gap-6 py-4">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground mb-1">Current Status</p>
                                <Badge variant={status ? "default" : "secondary"} className="text-lg px-4 py-1">
                                    {status?.punchIn && !status?.punchOut ? "Clocked In" :
                                        status?.punchOut ? "Clocked Out" : "Not Started"}
                                </Badge>
                            </div>

                            {status?.punchIn && (
                                <div className="grid grid-cols-2 gap-8 text-center w-full">
                                    <div>
                                        <p className="text-xs text-muted-foreground">Clock In</p>
                                        <p className="font-mono text-xl">{new Date(status.punchIn).toLocaleTimeString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-muted-foreground">Clock Out</p>
                                        <p className="font-mono text-xl">{status.punchOut ? new Date(status.punchOut).toLocaleTimeString() : '--:--'}</p>
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4">
                                {!status?.punchIn && (
                                    <Button
                                        size="lg"
                                        className="w-32 bg-green-600 hover:bg-green-700"
                                        onClick={() => handlePunch('in')}
                                        disabled={actionLoading}
                                    >
                                        <Play className="mr-2 h-4 w-4" /> Punch In
                                    </Button>
                                )}
                                {status?.punchIn && !status?.punchOut && (
                                    <Button
                                        size="lg"
                                        variant="destructive"
                                        className="w-32"
                                        onClick={() => handlePunch('out')}
                                        disabled={actionLoading}
                                    >
                                        <Square className="mr-2 h-4 w-4" /> Punch Out
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Work Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm">Work Hours</span>
                                <span className="font-bold">{status?.workHours ? status.workHours.toFixed(2) : '0.00'} hrs</span>
                            </div>
                            <div className="flex justify-between items-center border-b pb-2">
                                <span className="text-sm">Location</span>
                                <span className="flex items-center text-sm text-muted-foreground"><MapPin className="h-3 w-3 mr-1" /> {status?.ipAddress || 'Unknown'}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* History Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Attendance History (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Clock In</TableHead>
                                <TableHead>Clock Out</TableHead>
                                <TableHead>Hours</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : history.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center">No records found.</TableCell>
                                </TableRow>
                            ) : (
                                history.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell>{format(new Date(record.date), 'MMM dd, yyyy')}</TableCell>
                                        <TableCell className="font-mono">{record.punchIn ? new Date(record.punchIn).toLocaleTimeString() : '-'}</TableCell>
                                        <TableCell className="font-mono">{record.punchOut ? new Date(record.punchOut).toLocaleTimeString() : '-'}</TableCell>
                                        <TableCell>{record.workHours?.toFixed(2) || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                record.attendanceType === 'PRESENT' ? 'border-green-500 text-green-600' :
                                                    record.attendanceType === 'ABSENT' ? 'border-red-500 text-red-600' :
                                                        'border-yellow-500 text-yellow-600'
                                            }>
                                                {record.attendanceType}
                                            </Badge>
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
