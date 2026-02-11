"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Plus } from "lucide-react"

import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog" // Need to build Dialog
import { Badge } from "@/components/ui/badge"

// Simplified Dialog implementation or use logic to just toggle a form
// For speed, let's use a simple toggle form or separate page. 
// A simple toggle form on top is fine for MVP.

interface Goal {
    id: string
    title: string
    description: string
    quarter: number
    year: number
    targetDate: string
    status: string
}

export default function PerformancePage() {
    const [goals, setGoals] = useState<Goal[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [newGoal, setNewGoal] = useState({ title: '', description: '', quarter: 1, year: new Date().getFullYear(), targetDate: '' })

    useEffect(() => {
        fetchGoals()
    }, [])

    const fetchGoals = async () => {
        try {
            const res = await api.get('/performance/goals')
            setGoals(res.data.data || res.data)
        } catch (error) {
            console.error(error)
            toast.error("Failed to fetch goals")
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        try {
            await api.post('/performance/goals', newGoal)
            toast.success("Goal created successfully")
            setShowForm(false)
            setNewGoal({ title: '', description: '', quarter: 1, year: new Date().getFullYear(), targetDate: '' })
            fetchGoals()
        } catch (error: any) {
            console.error(error)
            toast.error("Failed to create goal")
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Performance Goals</h1>
                <Button onClick={() => setShowForm(!showForm)}>
                    <Plus className="mr-2 h-4 w-4" /> Add Goal
                </Button>
            </div>

            {showForm && (
                <Card>
                    <CardHeader>
                        <CardTitle>New Goal</CardTitle>
                        <CardDescription>Set a new performance goal for yourself.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label>Title</Label>
                                <Input value={newGoal.title} onChange={(e) => setNewGoal({ ...newGoal, title: e.target.value })} required />
                            </div>
                            <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea value={newGoal.description} onChange={(e) => setNewGoal({ ...newGoal, description: e.target.value })} required />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>Quarter</Label>
                                    <Input type="number" min="1" max="4" value={newGoal.quarter} onChange={(e) => setNewGoal({ ...newGoal, quarter: parseInt(e.target.value) })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Year</Label>
                                    <Input type="number" value={newGoal.year} onChange={(e) => setNewGoal({ ...newGoal, year: parseInt(e.target.value) })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label>Target Date</Label>
                                    <Input type="date" value={newGoal.targetDate} onChange={(e) => setNewGoal({ ...newGoal, targetDate: e.target.value })} required />
                                </div>
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button variant="outline" type="button" onClick={() => setShowForm(false)}>Cancel</Button>
                                <Button type="submit">Save Goal</Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {loading ? (
                    <p>Loading goals...</p>
                ) : goals.length === 0 ? (
                    <p className="text-muted-foreground col-span-full text-center py-8">No goals set yet.</p>
                ) : (
                    goals.map((goal) => (
                        <Card key={goal.id}>
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <CardTitle className="text-lg">{goal.title}</CardTitle>
                                    <Badge variant={goal.status === 'COMPLETED' ? 'default' : 'secondary'}>{goal.status}</Badge>
                                </div>
                                <CardDescription>Q{goal.quarter} {goal.year}</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground mb-4">{goal.description}</p>
                                <p className="text-xs font-medium">Target: {new Date(goal.targetDate).toLocaleDateString()}</p>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
