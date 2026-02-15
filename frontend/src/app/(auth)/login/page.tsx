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
            error?: {
                message?: string
            }
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
            const message =
                err.response?.data?.error?.message ||
                err.response?.data?.message ||
                "Invalid credentials"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    async function onGoogleSignIn() {
        try {
            const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID
            if (!clientId) {
                toast.error("Google Sign-In not configured")
                return
            }
            // Load Google Identity script if not present
            if (!(window as unknown as { google?: unknown }).google) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement("script")
                    script.src = "https://accounts.google.com/gsi/client"
                    script.async = true
                    script.onload = () => resolve()
                    script.onerror = () => reject(new Error("Failed to load Google script"))
                    document.head.appendChild(script)
                })
            }
            const google = (window as unknown as { google: { accounts: { id: { initialize: (opts: { client_id: string, callback: (resp: { credential: string }) => void }) => void, prompt: () => void } } } }).google
            const idToken: string = await new Promise<string>((resolve) => {
                google.accounts.id.initialize({
                    client_id: clientId,
                    callback: (resp: { credential: string }) => resolve(resp.credential),
                })
                google.accounts.id.prompt()
            })
            const response = await api.post("/auth/google-login", { idToken })
            const { access_token, user } = response.data as { access_token: string, user: unknown }
            localStorage.setItem("token", access_token)
            localStorage.setItem("user", JSON.stringify(user))
            toast.success("Signed in with Google")
            router.push("/dashboard")
        } catch (error) {
            const err = error as { response?: { data?: { message?: string, error?: { message?: string } } } }
            const message =
                err?.response?.data?.message ||
                err?.response?.data?.error?.message ||
                "Google sign-in failed"
            toast.error(message)
        }
    }

    return (
        <div className="min-h-screen flex bg-gray-50">
            {/* Clean background (removed animated gradient and orbs) */}

            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative z-10">
                <div>
                    <div className="mb-8">
                        <Image
                            src="/technext-logo.png"
                            alt="Technnext Logo"
                            width={160}
                            height={48}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-bold text-slate-900 mb-2 leading-tight">
                            Welcome to<br />
                            <span className="text-slate-700">Technnext HRMS</span>
                        </h1>
                        <p className="text-base text-slate-600 max-w-md">
                            Streamline your workforce management with our comprehensive HR solution.
                        </p>
                    </div>
                </div>
                <div className="text-slate-500 text-sm">
                    © 2026 Technnext. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="flex-1 flex items-center justify-center p-8 relative z-10">
                <div className="w-full max-w-md">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-8 animate-fade-in">
                        <Image
                            src="/technext-logo.png"
                            alt="Technnext Logo"
                            width={140}
                            height={140}
                            className="drop-shadow-2xl transform hover:scale-105 transition-transform duration-300"
                            priority
                        />
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-lg p-8 sm:p-10 border border-gray-100">
                        <div className="mb-8">
                            <h2 className="text-3xl font-bold text-slate-900 mb-2">
                                Sign In
                            </h2>
                            <p className="text-slate-600">
                                Enter your credentials to access your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-slate-700">
                                    Email Address
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        disabled={isLoading}
                                        {...register("email")}
                                        className="pl-10 h-12 border-2 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600/20 rounded-xl transition-all duration-300"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-600 animate-shake">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-semibold text-slate-700">
                                        Password
                                    </Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-medium hover:underline transition-all"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                        {...register("password")}
                                        className="pl-10 h-12 border-2 border-gray-200 focus:border-indigo-600 focus:ring-indigo-600/20 rounded-xl transition-all duration-300"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-600 animate-shake">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-base rounded-xl shadow-md transition-all"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Signing in...
                                    </span>
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
                                <div className="w-full border-t border-gray-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-gray-500 font-medium">or</span>
                            </div>
                        </div>

                        {/* Google Sign-In */}
                        <Button
                            type="button"
                            onClick={onGoogleSignIn}
                            variant="outline"
                            className="w-full h-11 border-slate-300 text-slate-700 hover:bg-slate-50"
                        >
                            Sign in with Google
                        </Button>

                        {/* Sign Up Link */}
                        <div className="text-center text-sm text-slate-600 mt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-indigo-600 hover:text-indigo-700 font-semibold hover:underline"
                                onClick={() => toast.info("Please contact HR/Admin to request access")}
                            >
                                Request Access
                            </Button>
                        </div>
                    </div>

                    {/* Footer */}
                    <p className="text-center mt-8 text-sm text-slate-500 font-medium">
                        🔒 Secured by Technnext HRMS
                    </p>
                </div>
            </div>

            {/* Removed animated background and effects for a cleaner professional look */}
        </div>
    )
}
