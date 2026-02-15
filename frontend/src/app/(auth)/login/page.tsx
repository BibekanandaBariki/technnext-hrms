"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { Mail, Lock, ArrowRight, Sparkles } from "lucide-react"

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

    return (
        <div className="min-h-screen flex relative overflow-hidden">
            {/* Animated Background Gradient */}
            <div className="fixed inset-0 bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 animate-gradient-shift" />

            {/* Floating Orbs */}
            <div className="fixed top-20 left-20 w-72 h-72 bg-pink-500/30 rounded-full blur-3xl animate-float" />
            <div className="fixed bottom-20 right-20 w-96 h-96 bg-blue-500/30 rounded-full blur-3xl animate-float-delayed" />
            <div className="fixed top-1/2 left-1/2 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse" />

            {/* Left Side - Branding */}
            <div className="hidden lg:flex lg:w-1/2 p-12 flex-col justify-between relative z-10">
                <div>
                    <div className="mb-8 transform hover:scale-105 transition-transform duration-300">
                        <Image
                            src="/technext-logo.png"
                            alt="Technnext Logo"
                            width={200}
                            height={200}
                            className="drop-shadow-2xl"
                            priority
                        />
                    </div>
                    <div className="space-y-6">
                        <h1 className="text-6xl font-bold text-white mb-6 leading-tight animate-fade-in">
                            Welcome to<br />
                            <span className="bg-gradient-to-r from-pink-300 via-purple-300 to-indigo-300 bg-clip-text text-transparent">
                                Technnext HRMS
                            </span>
                        </h1>
                        <p className="text-xl text-white/90 max-w-md leading-relaxed animate-fade-in-delayed">
                            Streamline your workforce management with our comprehensive HR solution.
                        </p>

                        {/* Feature Pills */}
                        <div className="flex flex-wrap gap-3 mt-8">
                            {['Employee Management', 'Attendance Tracking', 'Leave Management', 'Payroll'].map((feature, i) => (
                                <div
                                    key={feature}
                                    className="px-4 py-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-white text-sm font-medium hover:bg-white/20 transition-all duration-300 cursor-default animate-fade-in"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <Sparkles className="w-3 h-3 inline mr-1" />
                                    {feature}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div className="text-white/70 text-sm">
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

                    {/* Login Card with Glass Effect */}
                    <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20 transform hover:scale-[1.02] transition-all duration-300 animate-slide-up">
                        <div className="mb-8">
                            <h2 className="text-4xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">
                                Sign In
                            </h2>
                            <p className="text-gray-600">
                                Enter your credentials to access your account
                            </p>
                        </div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                                    Email Address
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-600 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        disabled={isLoading}
                                        {...register("email")}
                                        className="pl-10 h-12 border-2 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all duration-300"
                                    />
                                </div>
                                {errors.email && (
                                    <p className="text-sm text-red-600 animate-shake">{errors.email.message}</p>
                                )}
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                                        Password
                                    </Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-violet-600 hover:text-violet-700 font-medium hover:underline transition-all"
                                    >
                                        Forgot password?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-violet-600 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                        {...register("password")}
                                        className="pl-10 h-12 border-2 border-gray-200 focus:border-violet-500 focus:ring-violet-500/20 rounded-xl transition-all duration-300"
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
                                className="w-full h-12 bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 hover:from-violet-700 hover:via-purple-700 hover:to-indigo-700 text-white font-semibold text-base rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-300"
                            >
                                {isLoading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                        Signing in...
                                    </span>
                                ) : (
                                    <span className="flex items-center justify-center gap-2">
                                        Sign In
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
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

                        {/* Sign Up Link */}
                        <p className="text-center text-sm text-gray-600">
                            Don&apos;t have an account?{" "}
                            <Link
                                href="/signup"
                                className="text-violet-600 hover:text-violet-700 font-semibold hover:underline transition-all"
                            >
                                Create one
                            </Link>
                        </p>
                    </div>

                    {/* Footer */}
                    <p className="text-center mt-8 text-sm text-white/80 font-medium">
                        🔒 Secured by Technnext HRMS
                    </p>
                </div>
            </div>

            <style jsx global>{`
                @keyframes gradient-shift {
                    0%, 100% { background-position: 0% 50%; }
                    50% { background-position: 100% 50%; }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(-20px); }
                }
                @keyframes float-delayed {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(20px); }
                }
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes fade-in-delayed {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes slide-up {
                    from { opacity: 0; transform: translateY(30px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-gradient-shift {
                    background-size: 200% 200%;
                    animation: gradient-shift 15s ease infinite;
                }
                .animate-float {
                    animation: float 6s ease-in-out infinite;
                }
                .animate-float-delayed {
                    animation: float-delayed 8s ease-in-out infinite;
                }
                .animate-fade-in {
                    animation: fade-in 0.8s ease-out forwards;
                }
                .animate-fade-in-delayed {
                    animation: fade-in-delayed 1s ease-out 0.2s forwards;
                    opacity: 0;
                }
                .animate-slide-up {
                    animation: slide-up 0.6s ease-out forwards;
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    )
}
