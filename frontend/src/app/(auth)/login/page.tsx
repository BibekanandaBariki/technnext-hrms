"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import Link from "next/link"
import { motion } from "framer-motion"
import { Mail, Lock, ArrowRight } from "lucide-react"

import api from "@/lib/api"
import WebGLBackground from "@/components/auth/WebGLBackground"
import AnimatedLogo from "@/components/auth/AnimatedLogo"
import AuthCard from "@/components/auth/AuthCard"
import { PremiumButton } from "@/components/ui/premium-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function PremiumLoginPage() {
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
        } catch (error: any) {
            const message = error.response?.data?.message || "Invalid credentials"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <WebGLBackground />

            <div className="min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
                    className="w-full max-w-[480px]"
                >
                    <AuthCard className="px-8 sm:px-12 py-12">
                        {/* Logo */}
                        <div className="flex justify-center -mt-4 mb-10">
                            <AnimatedLogo size={110} />
                        </div>

                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="text-center mb-10"
                        >
                            <h1 className="text-4xl sm:text-5xl font-bold mb-3 tracking-tight">
                                <span className="bg-gradient-to-r from-white via-purple-100 to-pink-100 bg-clip-text text-transparent">
                                    Welcome Back
                                </span>
                            </h1>
                            <p className="text-white/50 text-base font-light tracking-wide">
                                Sign in to access your workspace
                            </p>
                        </motion.div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.3, duration: 0.6 }}
                                className="space-y-2.5"
                            >
                                <Label htmlFor="email" className="text-white/70 text-sm font-medium tracking-wide">
                                    Email Address
                                </Label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors">
                                        <Mail className="w-5 h-5" />
                                    </div>
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="you@company.com"
                                        disabled={isLoading}
                                        {...register("email")}
                                        className="
                                            h-14 pl-12 pr-4
                                            bg-white/5 border-white/10 text-white placeholder:text-white/30
                                            focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                                            transition-all duration-300
                                            hover:border-white/20 hover:bg-white/[0.07]
                                            text-base
                                            rounded-xl
                                        "
                                    />
                                </div>
                                {errors.email && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm text-red-400 font-medium"
                                    >
                                        {errors.email.message}
                                    </motion.p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.4, duration: 0.6 }}
                                className="space-y-2.5"
                            >
                                <div className="flex items-center justify-between">
                                    <Label htmlFor="password" className="text-white/70 text-sm font-medium tracking-wide">
                                        Password
                                    </Label>
                                    <Link
                                        href="/forgot-password"
                                        className="text-sm text-purple-400 hover:text-purple-300 transition-colors font-medium"
                                    >
                                        Forgot?
                                    </Link>
                                </div>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-purple-400 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        disabled={isLoading}
                                        {...register("password")}
                                        className="
                                            h-14 pl-12 pr-4
                                            bg-white/5 border-white/10 text-white placeholder:text-white/30
                                            focus:border-purple-500/50 focus:ring-2 focus:ring-purple-500/20
                                            transition-all duration-300
                                            hover:border-white/20 hover:bg-white/[0.07]
                                            text-base
                                            rounded-xl
                                        "
                                    />
                                </div>
                                {errors.password && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="text-sm text-red-400 font-medium"
                                    >
                                        {errors.password.message}
                                    </motion.p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.5, duration: 0.6 }}
                                className="pt-4"
                            >
                                <PremiumButton
                                    type="submit"
                                    className="w-full h-14 text-base font-semibold tracking-wide group"
                                    loading={isLoading}
                                    size="lg"
                                >
                                    <span className="flex items-center justify-center gap-2">
                                        {isLoading ? "Signing in..." : "Sign In"}
                                        {!isLoading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                                    </span>
                                </PremiumButton>
                            </motion.div>
                        </form>

                        {/* Divider */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.6 }}
                            className="relative my-8"
                        >
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-white/10"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 bg-transparent text-white/40 font-light">or</span>
                            </div>
                        </motion.div>

                        {/* Footer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.7 }}
                            className="text-center"
                        >
                            <p className="text-white/50 text-sm font-light">
                                Don't have an account?{" "}
                                <Link
                                    href="/signup"
                                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                                >
                                    Create one
                                </Link>
                            </p>
                        </motion.div>
                    </AuthCard>

                    {/* Bottom text */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.8 }}
                        className="text-center mt-8 text-white/30 text-sm font-light"
                    >
                        Secured by Technnext HRMS
                    </motion.p>
                </motion.div>
            </div>
        </>
    )
}
