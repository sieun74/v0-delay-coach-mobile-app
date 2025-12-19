"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useTasks } from "@/hooks/use-tasks"
import { useCheckIns } from "@/hooks/use-checkins"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { CoachMessageCard } from "@/components/coach-message-card"
import { EmptyState } from "@/components/empty-state"
import { useToast } from "@/hooks/use-toast"
import type { CheckIn } from "@/lib/types"
import { generateCoachMessage } from "@/lib/coach-messages"
import { storage } from "@/lib/storage"
import { MessageSquare, Smile, Meh, Frown } from "lucide-react"

export default function CheckInPage() {
  const { tasks, isLoaded, updateTask, refreshTasks } = useTasks()
  const { addCheckIn } = useCheckIns()
  const { toast } = useToast()

  const [selectedTaskId, setSelectedTaskId] = useState("")
  const [progressDelta, setProgressDelta] = useState("10")
  const [mood, setMood] = useState<"good" | "neutral" | "bad">("neutral")
  const [note, setNote] = useState("")
  const [coachFeedback, setCoachFeedback] = useState<{ fact: string; action: string } | null>(null)
  const [coachTone, setCoachTone] = useState<"gentle" | "normal" | "savage">("normal")

  useEffect(() => {
    const settings = storage.getSettings()
    setCoachTone(settings.coachTone as any)
  }, [])

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  const activeTasks = tasks.filter((t) => t.status === "active" || t.status === "overdue")

  if (activeTasks.length === 0) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <EmptyState
          icon={MessageSquare}
          title="No Active Tasks"
          description="You need to add some active tasks before you can check in on your progress."
          action={null}
        />
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedTaskId) {
      toast({
        title: "No task selected",
        description: "Please select a task to check in.",
        variant: "destructive",
      })
      return
    }

    const task = tasks.find((t) => t.id === selectedTaskId)
    if (!task) return

    const delta = Number.parseInt(progressDelta) || 0
    const newProgress = Math.min(100, Math.max(0, task.progress + delta))

    // Create check-in
    const checkIn: CheckIn = {
      id: `checkin-${Date.now()}`,
      taskId: selectedTaskId,
      dateTime: new Date().toISOString(),
      progressDelta: delta,
      mood,
      note: note.trim() || undefined,
    }

    addCheckIn(checkIn)

    // Update task
    updateTask(selectedTaskId, {
      progress: newProgress,
      lastCheckInAt: new Date().toISOString(),
      status: newProgress === 100 ? "done" : task.status,
    })

    // Generate coach feedback
    const message = generateCoachMessage(task, delta, coachTone)
    setCoachFeedback(message)

    toast({
      title: "Check-in recorded",
      description: `Progress updated to ${newProgress}%`,
    })

    // Reset form
    setProgressDelta("10")
    setMood("neutral")
    setNote("")
  }

  const selectedTask = tasks.find((t) => t.id === selectedTaskId)

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <h1 className="text-2xl font-bold">Progress Check-in</h1>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Record Your Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Task Selection */}
            <div className="space-y-2">
              <Label htmlFor="task">Select Task *</Label>
              <Select value={selectedTaskId} onValueChange={setSelectedTaskId}>
                <SelectTrigger id="task">
                  <SelectValue placeholder="Choose a task..." />
                </SelectTrigger>
                <SelectContent>
                  {activeTasks.map((task) => (
                    <SelectItem key={task.id} value={task.id}>
                      {task.title} ({task.progress}%)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedTask && (
                <p className="text-xs text-muted-foreground">
                  Current progress: {selectedTask.progress}% • Subject: {selectedTask.subject}
                </p>
              )}
            </div>

            {/* Progress Delta */}
            <div className="space-y-2">
              <Label htmlFor="progressDelta">Progress Made (%) *</Label>
              <Input
                id="progressDelta"
                type="number"
                min="-100"
                max="100"
                value={progressDelta}
                onChange={(e) => setProgressDelta(e.target.value)}
                placeholder="e.g., 15"
              />
              <p className="text-xs text-muted-foreground">
                How much progress did you make? Use negative numbers if you had to redo work.
              </p>
            </div>

            {/* Mood Selection */}
            <div className="space-y-2">
              <Label>Mood *</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  type="button"
                  variant={mood === "good" ? "default" : "outline"}
                  className="flex flex-col gap-1 h-auto py-3"
                  onClick={() => setMood("good")}
                >
                  <Smile className="h-5 w-5" />
                  <span className="text-xs">Good</span>
                </Button>
                <Button
                  type="button"
                  variant={mood === "neutral" ? "default" : "outline"}
                  className="flex flex-col gap-1 h-auto py-3"
                  onClick={() => setMood("neutral")}
                >
                  <Meh className="h-5 w-5" />
                  <span className="text-xs">Neutral</span>
                </Button>
                <Button
                  type="button"
                  variant={mood === "bad" ? "default" : "outline"}
                  className="flex flex-col gap-1 h-auto py-3"
                  onClick={() => setMood("bad")}
                >
                  <Frown className="h-5 w-5" />
                  <span className="text-xs">Bad</span>
                </Button>
              </div>
            </div>

            {/* Optional Note */}
            <div className="space-y-2">
              <Label htmlFor="note">Note (Optional)</Label>
              <Input
                id="note"
                placeholder="Quick note about your session..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                maxLength={100}
              />
            </div>

            <Button type="submit" className="w-full" size="lg">
              Submit Check-in
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Coach Feedback */}
      {coachFeedback && (
        <div>
          <h2 className="text-sm font-semibold mb-2 px-1">Coach Feedback</h2>
          <CoachMessageCard fact={coachFeedback.fact} action={coachFeedback.action} />
        </div>
      )}
    </div>
  )
}
