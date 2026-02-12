"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

import api from "@/lib/api"
import WebGLBackground from "@/components/auth/WebGLBackground"
import AnimatedLogo from "@/components/auth/AnimatedLogo"
import AuthCard from "@/components/auth/AuthCard"
import { PremiumButton } from "@/components/ui/premium-button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const resetPasswordSchema = z.object({
    newPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
    confirmPassword: z.string().min(8, { message: "Password must be at least 8 characters" }),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function PremiumResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [isLoading, setIsLoading] = useState(false)
    const [isValidating, setIsValidating] = useState(true)
    const [isValidToken, setIsValidToken] = useState(false)
    const [resetSuccess, setResetSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
        defaultValues: {
            newPassword: "",
            confirmPassword: "",
        },
    })

    useEffect(() => {
        async function validateToken() {
            if (!token) {
                setIsValidating(false)
                setIsValidToken(false)
                return
            }

            try {
                const response = await api.get(`/auth/validate-reset-token?token=${token}`)
                setIsValidToken(response.data.data.valid)
            } catch (error) {
                console.error(error)
                setIsValidToken(false)
            } finally {
                setIsValidating(false)
            }
        }

        validateToken()
    }, [token])

    async function onSubmit(data: ResetPasswordFormValues) {
        if (!token) return

        setIsLoading(true)
        try {
            await api.post("/auth/reset-password", {
                token,
                newPassword: data.newPassword,
            })
            setResetSuccess(true)
            toast.success("Password reset successfully!")
            setTimeout(() => {
                router.push("/login")
            }, 2000)
        } catch (error: any) {
            console.error(error)
            const message = error.response?.data?.message || "Failed to reset password"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isValidating) {
        return (
            <>
                <WebGLBackground />
                <div className="min-h-screen flex items-center justify-center">
                    <AuthCard>
                        <div className="flex items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
                        </div>
                    </AuthCard>
                </div>
            </>
        )
    }

    if (!token || !isValidToken) {
        return (
            <>
                <WebGLBackground />
                <div className="min-h-screen flex items-center justify-center px-4">
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
                                <h1 className="text-2xl font-bold text-white mb-2">Invalid or expired link</h1>
                                <p className="text-white/60 text-sm">
                                    This password reset link is invalid or has expired.
                                </p>
                            </div>

                            <Link href="/forgot-password">
                                <PremiumButton className="w-full">
                                    Request new reset link
                                </PremiumButton>
                            </Link>
                        </AuthCard>
                    </motion.div>
                </div>
            </>
        )
    }

    if (resetSuccess) {
        return (
            <>
                <WebGLBackground />
                <div className="min-h-screen flex items-center justify-center px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="w-full max-w-md"
                    >
                        <AuthCard>
                            <div className="flex justify-center mb-6">
                                <AnimatedLogo size={80} />
                            </div>

                            <div className="text-center">
                                <h1 className="text-2xl font-bold text-white mb-2">Password reset successful!</h1>
                                <p className="text-white/60 text-sm">
                                    Redirecting to login...
                                </p>
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
                                Reset your password
                            </h1>
                            <p className="text-white/60 text-sm">
                                Enter your new password below
                            </p>
                        </motion.div>

                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.7 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="newPassword" className="text-white/80">New Password</Label>
                                <Input
                                    id="newPassword"
                                    type="password"
                                    placeholder="••••••••"
                                    disabled={isLoading}
                                    {...register("newPassword")}
                                    className="bg-white/5 border-white/10 text-white placeholder:text-white/40 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                                />
                                {errors.newPassword && (
                                    <p className="text-sm text-red-400">{errors.newPassword.message}</p>
                                )}
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.8 }}
                                className="space-y-2"
                            >
                                <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
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
                                transition={{ delay: 0.9 }}
                                className="pt-2"
                            >
                                <PremiumButton
                                    type="submit"
                                    className="w-full"
                                    loading={isLoading}
                                    size="lg"
                                >
                                    Reset password
                                </PremiumButton>
                            </motion.div>
                        </form>
                    </AuthCard>
                </motion.div>
            </div>
        </>
    )
}
