"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"

import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const signupSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required" }),
    lastName: z.string().min(1, { message: "Last name is required" }),
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(8, { message: "Please confirm your password" }),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type SignupFormValues = z.infer<typeof signupSchema>

interface ApiError {
    response?: {
        data?: {
            message?: string
        }
    }
}

export default function SignupPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<SignupFormValues>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
    })

    async function onSubmit(data: SignupFormValues) {
        setIsLoading(true)
        try {
            await api.post("/auth/register", {
                email: data.email,
                password: data.password,
                role: "EMPLOYEE",
            })

            toast.success("Account created successfully!")
            router.push("/login")
        } catch (error) {
            const err = error as ApiError
            const message = err.response?.data?.message || "Failed to create account"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
            <div className="w-full max-w-md">
                <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
                    <Image
                        src="/technext-logo.png"
                        alt="Technnext Logo"
                        width={80}
                        height={80}
                        className="mx-auto mb-6"
                    />

                    <div className="mb-8 text-center">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Create Account
                        </h2>
                        <p className="text-gray-600">
                            Join us and start your journey
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="firstName" className="text-sm font-medium text-gray-700">
                                    First Name
                                </Label>
                                <Input
                                    id="firstName"
                                    placeholder="John"
                                    disabled={isLoading}
                                    {...register("firstName")}
                                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {errors.firstName && (
                                    <p className="text-xs text-red-600">{errors.firstName.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="lastName" className="text-sm font-medium text-gray-700">
                                    Last Name
                                </Label>
                                <Input
                                    id="lastName"
                                    placeholder="Doe"
                                    disabled={isLoading}
                                    {...register("lastName")}
                                    className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                />
                                {errors.lastName && (
                                    <p className="text-xs text-red-600">{errors.lastName.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="you@company.com"
                                disabled={isLoading}
                                {...register("email")}
                                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.email && (
                                <p className="text-sm text-red-600">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                Password
                            </Label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="Create a password"
                                disabled={isLoading}
                                {...register("password")}
                                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.password && (
                                <p className="text-sm text-red-600">{errors.password.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm your password"
                                disabled={isLoading}
                                {...register("confirmPassword")}
                                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.confirmPassword && (
                                <p className="text-sm text-red-600">{errors.confirmPassword.message}</p>
                            )}
                        </div>

                        <div className="pt-2">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                {isLoading ? "Creating account..." : "Create Account"}
                            </Button>
                        </div>
                    </form>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">or</span>
                        </div>
                    </div>

                    <p className="text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                        >
                            Sign in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    )
}
