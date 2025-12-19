"use client"

import { useTasks } from "@/hooks/use-tasks"
import { useCheckIns } from "@/hooks/use-checkins"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CoachMessageCard } from "@/components/coach-message-card"
import { RiskBadge } from "@/components/risk-badge"
import { EmptyState } from "@/components/empty-state"
import { getTopBombs, getRiskLevel } from "@/lib/bomb-predictor"
import { generateCoachMessage } from "@/lib/coach-messages"
import { storage } from "@/lib/storage"
import { AlertTriangle, Flame, ArrowRight, Target } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function HomePage() {
  const { tasks, isLoaded } = useTasks()
  const { checkIns } = useCheckIns()
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

  if (tasks.length === 0) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <EmptyState
          icon={Target}
          title="No Tasks Yet"
          description="Add your first task to start tracking deadlines and fighting procrastination."
          action={
            <Link href="/tasks">
              <Button>Add Your First Task</Button>
            </Link>
          }
        />
      </div>
    )
  }

  const activeTasks = tasks.filter((t) => t.status === "active" || t.status === "overdue")
  const topBombs = getTopBombs(tasks, 3)
  const riskyTasks = activeTasks.filter((t) => {
    const riskLevel = getRiskLevel(topBombs.find((b) => b.id === t.id)?.bombScore || 0)
    return riskLevel === "risk" || riskLevel === "bomb"
  })

  // Get the most at-risk task for coach message
  const mostAtRiskTask = topBombs[0]
  const recentCheckIn = mostAtRiskTask
    ? checkIns
        .filter((c) => c.taskId === mostAtRiskTask.id)
        .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())[0]
    : null

  const coachMessage = mostAtRiskTask
    ? generateCoachMessage(mostAtRiskTask, recentCheckIn?.progressDelta || 0, coachTone)
    : null

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      {/* App Title */}
      <div className="text-center">
        <h1 className="text-2xl font-bold">DelayCoach</h1>
        <p className="text-sm text-muted-foreground">Your deadline accountability partner</p>
      </div>

      {/* Today's Risk Summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-[oklch(var(--warning))]" />
            Today's Risk
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">{riskyTasks.length}</div>
          <p className="text-sm text-muted-foreground mt-1">
            {riskyTasks.length === 1 ? "task" : "tasks"} at risk or critical
          </p>
        </CardContent>
      </Card>

      {/* Bomb Prediction */}
      {topBombs.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Flame className="h-5 w-5 text-[oklch(var(--bomb))]" />
              Bomb Prediction
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {topBombs.map((task) => {
              const daysLeft = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              const riskLevel = getRiskLevel(task.bombScore)

              return (
                <div key={task.id} className="flex items-start gap-3 rounded-lg border border-border p-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="font-semibold text-sm leading-tight">{task.title}</h3>
                      <RiskBadge level={riskLevel} />
                    </div>
                    <p className="text-xs text-muted-foreground mb-2">
                      {daysLeft > 0 ? `${daysLeft}d left • ${task.progress}% done` : `Overdue • ${task.progress}% done`}
                    </p>
                    <p className="text-xs text-[oklch(var(--warning-foreground))]">{task.bombReason}</p>
                  </div>
                </div>
              )
            })}
            <Link href="/tasks">
              <Button variant="outline" className="w-full bg-transparent" size="sm">
                View All Tasks
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Coach Message */}
      {coachMessage && (
        <div>
          <h2 className="text-sm font-semibold mb-2 px-1">Coach Message</h2>
          <CoachMessageCard fact={coachMessage.fact} action={coachMessage.action} />
        </div>
      )}

      {/* Primary CTA */}
      <Link href="/checkin">
        <Button className="w-full" size="lg">
          Do a Check-in Today
        </Button>
      </Link>
    </div>
  )
}
