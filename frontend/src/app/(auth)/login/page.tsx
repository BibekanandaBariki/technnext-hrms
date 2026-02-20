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
        <div className="min-h-screen flex bg-slate-50 font-sans">
            {/* Left Side - Branding / White Background */}
            <div className="hidden lg:flex lg:w-[45%] xl:w-1/2 bg-white p-12 xl:p-20 flex-col justify-between relative z-10 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
                <div>
                    <div className="mb-12">
                        <Image
                            src="/technext-logo.png"
                            alt="Technnext Logo"
                            width={180}
                            height={54}
                            className="object-contain"
                            priority
                        />
                    </div>
                    <div className="space-y-6">
                        <h1 className="text-4xl xl:text-5xl font-extrabold text-slate-900 leading-[1.15] tracking-tight">
                            Welcome to<br />
                            Technnext HRMS
                        </h1>
                        <p className="text-lg text-slate-600 max-w-md leading-relaxed font-medium">
                            Streamline your workforce management with our comprehensive HR solution.
                        </p>
                    </div>
                </div>
                <div className="text-slate-500 font-medium text-sm">
                    © 2026 Technnext. All rights reserved.
                </div>
            </div>

            {/* Right Side - Login Form / Light Gray Background */}
            <div className="flex-1 flex items-center justify-center p-6 sm:p-12 relative z-10">
                <div className="w-full max-w-[440px]">
                    {/* Mobile Logo */}
                    <div className="lg:hidden flex justify-center mb-10">
                        <Image
                            src="/technext-logo.png"
                            alt="Technnext Logo"
                            width={160}
                            height={48}
                            className="object-contain"
                            priority
                        />
                    </div>

                    {/* Login Card */}
                    <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10 p-8">
                        <div className="mb-8">
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2 tracking-tight">
                                Sign In
                            </h2>
                            <p className="text-slate-500 font-medium text-sm sm:text-base">
                                Enter your credentials to access your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                            {/* Email Field */}
                            <div className="space-y-1.5">
                                <Label htmlFor="email" className="text-sm font-semibold text-slate-800">
                                    Email Address
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Mail className="w-[18px] h-[18px]" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        disabled={isLoading}
                                        {...register("email")}
                                        className="pl-10 h-11 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-xl transition-all font-medium bg-transparent"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-500 font-medium mt-1 animate-shake">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-semibold text-slate-800">
                                        Password
                                    </Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold transition-colors"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                                        <Lock className="w-[18px] h-[18px]" />
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                        {...register("password")}
                                        className="pl-10 h-11 border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 rounded-xl transition-all font-medium bg-transparent"
                                    />
                                </div>
                                {errors.password && (
                                    <p className="text-sm text-red-500 font-medium mt-1 animate-shake">{errors.password.message}</p>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="pt-2">
                                <Button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-[15px] rounded-xl shadow-sm transition-all"
                                >
                                    {isLoading ? (
                                        <span className="flex items-center justify-center gap-2">
                                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            Signing in...
                                        </span>
                                    ) : (
                                        <span className="flex items-center justify-center gap-2">
                                            Sign In
                                            <ArrowRight className="w-4 h-4" />
                                        </span>
                                    )}
                                </Button>
                            </div>
                        </form>

                        {/* Divider */}
                        <div className="relative my-7">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-200"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-white text-slate-400 font-medium">or</span>
                            </div>
                        </div>

                        {/* Google Sign-In */}
                        <Button
                            type="button"
                            onClick={onGoogleSignIn}
                            variant="outline"
                            className="w-full h-11 border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all shadow-sm"
                        >
                            Sign in with Google
                        </Button>

                        {/* Sign Up Link */}
                        <div className="text-center mt-6">
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-indigo-600 hover:text-indigo-700 font-bold hover:bg-transparent px-0"
                                onClick={() => toast.info("Please contact HR/Admin to request access")}
                            >
                                Request Access
                            </Button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="text-center mt-8">
                        <p className="text-sm text-slate-500 font-semibold flex items-center justify-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-slate-400" />
                            Secured by Technnext HRMS
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
