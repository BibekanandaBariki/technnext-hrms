"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { Mail, Lock, ArrowRight } from "lucide-react"

import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface ApiError {
    response?: {
        data?: {
            message?: string
        }
    }
}

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    async function onSubmit(data: LoginFormValues) {
        setIsLoading(true)
        try {
            const response = await api.post("/auth/login", data)
            const { access_token, user } = response.data.data

            localStorage.setItem("token", access_token)
            localStorage.setItem("user", JSON.stringify(user))

            toast.success("Welcome back!")
            router.push("/dashboard")
        } catch (error) {
            const err = error as ApiError
            const message = err.response?.data?.message || "Invalid credentials"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 p-12 flex-col justify-between">
                <div>
                    <Image
                        src="/technext-logo.png"
                        alt="Technnext Logo"
                        width={180}
                        height={180}
                        className="mb-8"
                        priority
                    />
                    <h1 className="text-5xl font-bold text-white mb-6">
                        Welcome to<br />Technnext HRMS
                    </h1>
                    <p className="text-xl text-white/90 max-w-md">
                        Streamline your workforce management with our comprehensive HR solution.
                    </p>
                </div>
                <div className="text-white/70 text-sm">
                    © 2026 Technnext. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8">
                        <Image
                            src="/technext-logo.png"
                            alt="Technnext Logo"
                            width={120}
                            height={120}
                            priority
                        />
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-2">
                                Sign In
                            </h2>
                            <p className="text-gray-600">
                                Enter your credentials to access your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        disabled={isLoading}
                                        {...register("email")}
                                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                                        Password
                                    </Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                        {...register("password")}
                                        className="pl-10 h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base"
                            >
                                {isLoading ? (
                                    "Signing in..."
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Sign In
                                        <ArrowRight className="w-5 h-5" />
                                    </span>
                                )}
                            </Button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500">or</span>
                            </div>
                        </div>

                        {/* Sign Up Link */}
                        <p className="text-center text-sm text-gray-600">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/signup"
                                className="text-blue-600 hover:text-blue-700 font-semibold"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>

                    {/* Footer */}
                    <p className="text-center mt-8 text-sm text-gray-500">
                        Secured by Technnext HRMS
                    </p>
                </div>
            </div>
        </div>
    )
}
