"use client"

import { useState } from "react"
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

const forgotPasswordSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

interface ApiError {
    response?: {
        data?: {
            message?: string
        }
    }
}

export default function ForgotPasswordPage() {
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
        } catch (error) {
            const err = error as ApiError
            const message = err.response?.data?.message || "Failed to send reset link"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    if (emailSent) {
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
                            Check your email
                        </h2>
                        <p className="text-gray-600 mb-8">
                            We&apos;ve sent a password reset link to your email address.
                        </p>
                        <div className="space-y-3">
                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => setEmailSent(false)}
                            >
                                Try another email
                            </Button>
                            <Link href="/login">
                                <Button variant="ghost" className="w-full">
                                    Back to login
                                </Button>
                            </Link>
                        </div>
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
                            Forgot password?
                        </h2>
                        <p className="text-gray-600">
                            Enter your email and we&apos;ll send you a reset link
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                                Email Address
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

                        <div className="space-y-3">
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                {isLoading ? "Sending..." : "Send reset link"}
                            </Button>
                            <Link href="/login">
                                <Button variant="ghost" className="w-full">
                                    Back to login
                                </Button>
                            </Link>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}
