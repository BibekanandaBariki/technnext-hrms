"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import Link from "next/link"
import { motion } from "framer-motion"

import api from "@/lib/api"
import WebGLBackground from "@/components/auth/WebGLBackground"
import AnimatedLogo from "@/components/auth/AnimatedLogo"
import AuthCard from "@/components/auth/AuthCard"
import { PremiumButton } from "@/components/ui/premium-button"
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

export default function PremiumSignupPage() {
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
        } catch (error: any) {
            const message = error.response?.data?.message || "Failed to create account"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <>
            <WebGLBackground />

            <div className="min-h-screen flex items-center justify-center px-4 py-12">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="w-full max-w-md"
                >
                    <AuthCard>
                        {/* Logo */}
                        <div className="flex justify-center mb-6">
                            <AnimatedLogo size={80} />
                        </div>

                        {/* Header */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-center mb-6"
                        >
                            <h1 className="text-3xl font-bold text-white mb-2 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                                Create Account
                            </h1>
                            <p className="text-white/60">Join us and start your journey</p>
                        </motion.div>

                        {/* Form */}
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <motion.div
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="firstName" className="text-white/80 text-sm">First Name</Label>
                                    <Input
                                        id="firstName"
                                        placeholder="John"
                                        disabled={isLoading}
                                        {...register("firstName")}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                    />
                                    {errors.firstName && (
                                        <p className="text-xs text-red-400">{errors.firstName.message}</p>
                                    )}
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.7 }}
                                    className="space-y-2"
                                >
                                    <Label htmlFor="lastName" className="text-white/80 text-sm">Last Name</Label>
                                    <Input
                                        id="lastName"
                                        placeholder="Doe"
                                        disabled={isLoading}
                                        {...register("lastName")}
                                        className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                    />
                                    {errors.lastName && (
                                        <p className="text-xs text-red-400">{errors.lastName.message}</p>
                                    )}
                                </motion.div>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="email" className="text-white/80 text-sm">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    disabled={isLoading}
                                    {...register("email")}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                />
                                {errors.email && (
                                    <p className="text-sm text-red-400">{errors.email.message}</p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.9 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="password" className="text-white/80 text-sm">Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    {...register("password")}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                />
                                {errors.password && (
                                    <p className="text-sm text-red-400">{errors.password.message}</p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 1.0 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="confirmPassword" className="text-white/80 text-sm">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    {...register("confirmPassword")}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                />
                                {errors.confirmPassword && (
                                    <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 1.1 }}
                                className="pt-2"
                            >
                                <PremiumButton
                                    type="submit"
                                    className="w-full"
                                    loading={isLoading}
                                    size="lg"
                                >
                                    {isLoading ? "Creating account..." : "Create Account"}
                                </PremiumButton>
                            </motion.div>
                        </form>

                        {/* Footer */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 1.2 }}
                            className="mt-6 text-center"
                        >
                            <p className="text-white/60 text-sm">
                                Already have an account?{" "}
                                <Link
                                    href="/login"
                                    className="text-purple-400 hover:text-purple-300 font-semibold transition-colors"
                                >
                                    Sign in
                                </Link>
                            </p>
                        </motion.div>
                    </AuthCard>
                </motion.div>
            </div>
        </>
    )
}
