"use client"

import { useState, useEffect } from "react"
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const employeeSchema = z.object({
    firstName: z.string().min(1, "First name is required"),
    lastName: z.string().min(1, "Last name is required"),
    email: z.string().email("Invalid email address"),
    joiningDate: z.string().min(1, "Joining date is required"),
    departmentId: z.string().min(1, "Department is required"),
    designationId: z.string().min(1, "Designation is required"),
    employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "INTERN"]).optional(),
})

type EmployeeFormValues = z.infer<typeof employeeSchema>

interface ApiError {
    response?: {
        data?: {
            message?: string
        }
    }
}

export default function AddEmployeePage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [departments, setDepartments] = useState<{ id: string; name: string }[]>([])
    const [designations, setDesignations] = useState<{ id: string; name: string }[]>([])

    const {
        register,
        handleSubmit,
        formState: { errors },
        setValue,
    } = useForm<EmployeeFormValues>({
        resolver: zodResolver(employeeSchema),
        defaultValues: {
            employmentType: "FULL_TIME",
        }
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [deptRes, desigRes] = await Promise.all([
                    api.get("/departments"),
                    api.get("/designations")
                ])
                setDepartments(deptRes.data.data || [])
                setDesignations(desigRes.data.data || [])
            } catch (error) {
                console.error("Failed to fetch options", error)
                toast.error("Failed to load departments/designations")
            }
        }
        fetchData()
    }, [])

    async function onSubmit(data: EmployeeFormValues) {
        setIsLoading(true)
        try {
            await api.post("/employees", data)
            toast.success("Employee created successfully")
            router.push("/employees")
        } catch (error: unknown) {
            console.error(error)
            const err = error as ApiError
            const message = err.response?.data?.message || "Failed to create employee"
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

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="departmentId">Department</Label>
                                <Select onValueChange={(val) => setValue("departmentId", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Department" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {departments.map((dept) => (
                                            <SelectItem key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.departmentId && (
                                    <p className="text-sm text-red-500">{errors.departmentId.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="designationId">Designation</Label>
                                <Select onValueChange={(val) => setValue("designationId", val)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Designation" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {designations.map((desig) => (
                                            <SelectItem key={desig.id} value={desig.id}>
                                                {desig.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.designationId && (
                                    <p className="text-sm text-red-500">{errors.designationId.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
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
                            <div className="space-y-2">
                                <Label htmlFor="employmentType">Employment Type</Label>
                                <Select onValueChange={(val) => setValue("employmentType", val as "FULL_TIME" | "PART_TIME" | "CONTRACT" | "INTERN")} defaultValue="FULL_TIME">
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="FULL_TIME">Full Time</SelectItem>
                                        <SelectItem value="PART_TIME">Part Time</SelectItem>
                                        <SelectItem value="CONTRACT">Contract</SelectItem>
                                        <SelectItem value="INTERN">Intern</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
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
