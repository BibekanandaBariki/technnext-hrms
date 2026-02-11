"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { format } from "date-fns"
import { Download, FileText } from "lucide-react"

import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

export default function PayrollPage() {
    const [payrolls, setPayrolls] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPayrolls()
    }, [])

    const fetchPayrolls = async () => {
        try {
            const res = await api.get('/payroll/my-payslips').catch(() => ({ data: { data: [] } }))
            setPayrolls(res.data.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to load payroll history")
        } finally {
            setLoading(false)
        }
    }

    const handleDownload = (id: string) => {
        toast.info("Downloading payslip...")
        // Implement PDF download logic here (e.g., fetch blob from API)
        // For MVP, just a toast
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Payroll & Payslips</h1>

            <div className="grid gap-6 md:grid-cols-3">
                <Card className="bg-primary text-primary-foreground">
                    <CardHeader>
                        <CardTitle>Next Pay Date</CardTitle>
                        <CardDescription className="text-primary-foreground/80">Estimated</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {format(new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1), 'MMMM do, yyyy')}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Payslip History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month/Year</TableHead>
                                <TableHead>Gross Salary</TableHead>
                                <TableHead>Deductions</TableHead>
                                <TableHead>Net Salary</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">Loading...</TableCell>
                                </TableRow>
                            ) : payrolls.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center">No payslips found.</TableCell>
                                </TableRow>
                            ) : (
                                payrolls.map((record) => (
                                    <TableRow key={record.id}>
                                        <TableCell className="font-medium">{record.month}/{record.year}</TableCell>
                                        <TableCell>{record.grossSalary.toLocaleString()}</TableCell>
                                        <TableCell className="text-red-500">-{record.totalDeductions.toLocaleString()}</TableCell>
                                        <TableCell className="font-bold text-green-600">{record.netSalary.toLocaleString()}</TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="border-green-500 text-green-600">
                                                PAID
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button size="sm" variant="ghost" onClick={() => handleDownload(record.id)}>
                                                <Download className="mr-2 h-4 w-4" /> PDF
                                            </Button>
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
