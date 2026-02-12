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

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function PremiumForgotPasswordPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [emailSent, setEmailSent] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
        defaultValues: {
            email: "",
        },
    })

    async function onSubmit(data: ForgotPasswordFormValues) {
        setIsLoading(true)
        try {
            await api.post("/auth/forgot-password", data)
            setEmailSent(true)
            toast.success("Password reset link sent! Check your email.")
        } catch (error: any) {
            console.error(error)
            toast.error("Failed to send reset link. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    if (emailSent) {
        return (
            <>
                <WebGLBackground />
                <div className="min-h-screen flex items-center justify-center px-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md"
                    >
                        <AuthCard>
                            <div className="flex justify-center mb-6">
                                <AnimatedLogo size={80} />
                            </div>

                            <div className="text-center mb-6">
                                <h1 className="text-2xl font-bold text-white mb-2">Check your email</h1>
                                <p className="text-white/60 text-sm">
                                    We've sent a password reset link to your email address.
                                </p>
                            </div>

                            <div className="space-y-4">
                                <PremiumButton
                                    variant="outline"
                                    className="w-full"
                                    onClick={() => setEmailSent(false)}
                                >
                                    Try another email
                                </PremiumButton>
                                <Link href="/login">
                                    <PremiumButton variant="ghost" className="w-full">
                                        Back to login
                                    </PremiumButton>
                                </Link>
                            </div>
                        </AuthCard>
                    </motion.div>
                </div>
            </>
        )
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
                        <div className="flex justify-center mb-6">
                            <AnimatedLogo size={80} />
                        </div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="text-center mb-6"
                        >
                            <h1 className="text-2xl font-bold text-white mb-2 bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent">
                                Forgot password?
                            </h1>
                            <p className="text-white/60 text-sm">
                                Enter your email and we'll send you a reset link
                            </p>
                        </motion.div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="email" className="text-white/80">Email</Label>
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
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.8 }}
                                className="space-y-3"
                            >
                                <PremiumButton
                                    type="submit"
                                    className="w-full"
                                    loading={isLoading}
                                    size="lg"
                                >
                                    Send reset link
                                </PremiumButton>
                                <Link href="/login">
                                    <PremiumButton variant="ghost" className="w-full">
                                        Back to login
                                    </PremiumButton>
                                </Link>
                            </motion.div>
                        </form>
                    </AuthCard>
                </motion.div>
            </div>
        </>
    )
}
