"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

const loginSchema = z.object({
    email: z.string().email({ message: "Please enter a valid email address" }),
    password: z.string().min(1, { message: "Password is required" }),
})

type LoginFormValues = z.infer<typeof loginSchema>

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
            // Assuming response.data.data contains { accessToken, user }
            const { accessToken, user } = response.data

            localStorage.setItem("token", accessToken)
            localStorage.setItem("user", JSON.stringify(user))

            toast.success("Logged in successfully")

            // Redirect based on role
            if (user.role === 'ADMIN' || user.role === 'HR') {
                router.push("/dashboard")
            } else {
                router.push("/dashboard") // For now, everyone to dashboard
            }

        } catch (error) {
            console.error(error)
            const message = (error as any)?.response?.data?.message || "Invalid credentials"
            toast.error(message)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-950 sm:px-6 lg:px-8">
            <Card className="w-full max-w-md">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold">Sign in</CardTitle>
                    <CardDescription>
                        Enter your email and password to access your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                disabled={isLoading}
                                {...register("email")}
                            />
                            {errors.email && (
                                <p className="text-sm text-red-500">{errors.email.message}</p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="password">Password</Label>
                                <a
                                    href="#"
                                    className="text-sm font-medium text-primary hover:underline"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        toast.info("Contact admin to reset password")
                                    }}
                                >
                                    Forgot password?
                                </a>
                            </div>
                            <Input
                                id="password"
                                type="password"
                                disabled={isLoading}
                                {...register("password")}
                            />
                            {errors.password && (
                                <p className="text-sm text-red-500">{errors.password.message}</p>
                            )}
                        </div>
                        <Button type="submit" className="w-full" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign in
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    {/* <p className="text-sm text-muted-foreground">Don't have an account? Contact HR.</p> */}
                </CardFooter>
            </Card>
        </div>
    )
}
