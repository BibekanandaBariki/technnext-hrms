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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const employeeSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    joiningDate: z.string().min(1, "Joining date is required"),
    // departmentId: z.string().optional(),
    // designationId: z.string().optional(),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

export default function AddEmployeePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
    })

    async function onSubmit(data: EmployeeFormValues) {
        setIsLoading(true)
        try {
            await api.post("/employees", data)
            toast.success("Employee created successfully")
            router.push("/employees")
        } catch (error) {
            console.error(error)
            const message = (error as any)?.response?.data?.message || "Failed to create employee"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/employees">
                        <ArrowLeft className="h-4 w-4" />
                    </Link>
                </Button>
                <h1 className="text-3xl font-bold tracking-tight">Add New Employee</h1>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Employee Details</CardTitle>
                    <CardDescription>
                        Enter the basic information for the new employee. They will receive an email to complete onboarding.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="firstName">First Name</Label>
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    disabled={isLoading}
                                    {...register("firstName")}
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-red-500">{errors.firstName.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="lastName">Last Name</Label>
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    disabled={isLoading}
                                    {...register("lastName")}
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-red-500">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="john.doe@technnext.com"
                                disabled={isLoading}
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="joiningDate">Joining Date</Label>
                            <Input
                                id="joiningDate"
                                type="date"
                                disabled={isLoading}
                                {...register("joiningDate")}
                            />
                            {errors.joiningDate && (
                                <p className="text-sm text-red-500">{errors.joiningDate.message}</p>
                            )}
                        </div>

                        <div className="flex justify-end gap-4 pt-4">
                            <Button variant="outline" type="button" onClick={() => router.back()} disabled={isLoading}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Create Employee
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
