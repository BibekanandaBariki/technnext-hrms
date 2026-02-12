"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

import api from "@/lib/api"
import { Button } from "@/components/ui/button"
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

interface ApiError {
    response?: {
        data?: {
            message?: string
        }
    }
}

export default function ResetPasswordPage() {
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

        void validateToken()
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
        } catch (error) {
            const err = error as ApiError
            const message = err.response?.data?.message || "Failed to reset password"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    if (isValidating) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="bg-white rounded-2xl shadow-xl p-12">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto" />
                </div>
            </div>
        )
    }

    if (!token || !isValidToken) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 text-center">
                        <Image
                            src="/technext-logo.png"
                            alt="Technnext Logo"
                            width={80}
                            height={80}
                            className="mx-auto mb-6"
                        />
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Invalid or expired link
                        </h2>
                        <p className="text-gray-600 mb-8">
                            This password reset link is invalid or has expired.
                        </p>
                        <Link href="/forgot-password">
                            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                                Request new reset link
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    if (resetSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center p-8 bg-gray-50">
                <div className="w-full max-w-md">
                    <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-10 text-center">
                        <Image
                            src="/technext-logo.png"
                            alt="Technnext Logo"
                            width={80}
                            height={80}
                            className="mx-auto mb-6"
                        />
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Password reset successful!
                        </h2>
                        <p className="text-gray-600">
                            Redirecting to login...
                        </p>
                    </div>
                </div>
            </div>
        )
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
                            Reset your password
                        </h2>
                        <p className="text-gray-600">
                            Enter your new password below
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="newPassword" className="text-sm font-medium text-gray-700">
                                New Password
                            </Label>
                            <Input
                                id="newPassword"
                                type="password"
                                placeholder="Enter new password"
                                disabled={isLoading}
                                {...register("newPassword")}
                                className="h-12 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                            {errors.newPassword && (
                                <p className="text-sm text-red-600">{errors.newPassword.message}</p>
                            )}
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                                Confirm Password
                            </Label>
                            <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Confirm new password"
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
                                {isLoading ? "Resetting..." : "Reset password"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
