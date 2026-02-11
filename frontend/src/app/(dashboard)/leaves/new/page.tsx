"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

// Simplified Select for now if component not built, or build it. 
// I'll build Textarea and Select components next.

const leaveSchema = z.object({
    leaveType: z.string().min(1, "Leave type is required"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.string().min(5, "Reason is required (min 5 chars)"),
})

type LeaveFormValues = z.infer<typeof leaveSchema>

export default function ApplyLeavePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LeaveFormValues>({
        resolver: zodResolver(leaveSchema),
    })

    async function onSubmit(data: LeaveFormValues) {
        setIsLoading(true)
        try {
            await api.post("/leaves", data)
            toast.success("Leave application submitted")
            router.push("/leaves")
        } catch (error: any) {
            console.error(error)
            const message = error?.response?.data?.message || "Failed to submit leave application"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/leaves">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Apply for Leave</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Leave Application</CardTitle>
                    <CardDescription>
                        Submit your leave request for approval.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">

                        <div className="space-y-2">
                            <Label htmlFor="leaveType">Leave Type</Label>
                            <select
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                {...register("leaveType")}
                            >
                                <option value="">Select type</option>
                                <option value="SICK_LEAVE">Sick Leave</option>
                                <option value="CASUAL_LEAVE">Casual Leave</option>
                                <option value="PAID_LEAVE">Paid Leave</option>
                                <option value="MATERNITY_LEAVE">Maternity Leave</option>
                                <option value="PATERNITY_LEAVE">Paternity Leave</option>
                                <option value="UNPAID_LEAVE">Unpaid Leave</option>
                            </select>
                            {errors.leaveType && (
                                <p className="text-sm text-red-500">{errors.leaveType.message}</p>
                            )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="startDate">Start Date</Label>
                                <Input
                                    id="startDate"
                                    type="date"
                                    disabled={isLoading}
                                    {...register("startDate")}
                                />
                                {errors.startDate && (
                                    <p className="text-sm text-red-500">{errors.startDate.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="endDate">End Date</Label>
                                <Input
                                    id="endDate"
                                    type="date"
                                    disabled={isLoading}
                                    {...register("endDate")}
                                />
                                {errors.endDate && (
                                    <p className="text-sm text-red-500">{errors.endDate.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="reason">Reason</Label>
                            <Textarea
                                id="reason"
                                placeholder="Going to hometown..."
                                disabled={isLoading}
                                {...register("reason")}
                            />
                            {errors.reason && (
                                <p className="text-sm text-red-500">{errors.reason.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Submit Application
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
