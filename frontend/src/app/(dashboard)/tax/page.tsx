"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Save } from "lucide-react"

import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"

interface Declaration {
    id: string
    financialYear: string
    regime: string
    section80C: number
    status: string
}

export default function TaxPage() {
    const [declarations, setDeclarations] = useState<Declaration[]>([])
    const [loading, setLoading] = useState(true)
    const [formData, setFormData] = useState({
        financialYear: '2023-2024',
        regime: 'OLD_REGIME',
        section80C: 0
    })

    useEffect(() => {
        fetchDeclarations()
    }, [])

    const fetchDeclarations = async () => {
        try {
            const res = await api.get('/tax/declarations')
            setDeclarations(res.data.data || [])
        } catch (error) {
            console.error(error)
            toast.error("Failed to fetch tax declarations")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/tax/declare', formData)
            toast.success("Tax declaration saved")
            fetchDeclarations()
        } catch (error: any) {
            console.error(error)
            toast.error("Failed to save declaration")
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold tracking-tight">Tax Declarations</h1>

            <Card>
                <CardHeader>
                    <CardTitle>Declare Investments</CardTitle>
                    <CardDescription>Submit your choice of tax regime and planned investments for the financial year.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <Label>Financial Year</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.financialYear}
                                    onChange={(e) => setFormData({ ...formData, financialYear: e.target.value })}
                                >
                                    <option value="2023-2024">2023-2024</option>
                                    <option value="2024-2025">2024-2025</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Tax Regime</Label>
                                <select
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background disabled:cursor-not-allowed disabled:opacity-50"
                                    value={formData.regime}
                                    onChange={(e) => setFormData({ ...formData, regime: e.target.value })}
                                >
                                    <option value="OLD_REGIME">Old Regime</option>
                                    <option value="NEW_REGIME">New Regime</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <Label>Section 80C Investment</Label>
                                <Input
                                    type="number"
                                    value={formData.section80C}
                                    onChange={(e) => setFormData({ ...formData, section80C: parseFloat(e.target.value) })}
                                />
                            </div>
                        </div>
                        <Button type="submit" className="w-full md:w-auto">
                            <Save className="mr-2 h-4 w-4" /> Save Declaration
                        </Button>
                    </form>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Declaration History</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <p>Loading...</p>
                    ) : declarations.length === 0 ? (
                        <p className="text-muted-foreground">No declarations found.</p>
                    ) : (
                        <div className="space-y-4">
                            {declarations.map((decl) => (
                                <div key={decl.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                                    <div>
                                        <p className="font-medium">{decl.financialYear}</p>
                                        <p className="text-sm text-muted-foreground">{decl.regime.replace('_', ' ')}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">80C: ₹{decl.section80C?.toLocaleString()}</p>
                                        <Badge variant="outline">{decl.status}</Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
