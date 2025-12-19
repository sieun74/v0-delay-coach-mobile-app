"use client"

import { useState, useMemo } from "react"
import { useTasks } from "@/hooks/use-tasks"
import { useCheckIns } from "@/hooks/use-checkins"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EmptyState } from "@/components/empty-state"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { BarChart3 } from "lucide-react"
import { getProcrastinationType } from "@/lib/coach-messages"
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

type TimeRange = "7" | "30" | "all"

export default function AnalysisPage() {
  const { tasks, isLoaded } = useTasks()
  const { checkIns } = useCheckIns()
  const [timeRange, setTimeRange] = useState<TimeRange>("7")

  const filteredCheckIns = useMemo(() => {
    if (timeRange === "all") return checkIns

    const days = Number.parseInt(timeRange)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)

    return checkIns.filter((c) => new Date(c.dateTime) >= cutoffDate)
  }, [checkIns, timeRange])

  // Check-in frequency by day
  const checkInFrequencyData = useMemo(() => {
    const days = timeRange === "all" ? 30 : Number.parseInt(timeRange)
    const data: { day: string; count: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const count = filteredCheckIns.filter((c) => c.dateTime.startsWith(dateStr)).length

      data.push({
        day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        count,
      })
    }

    return data
  }, [filteredCheckIns, timeRange])

  // Average progress delta trend
  const progressTrendData = useMemo(() => {
    const days = timeRange === "all" ? 30 : Number.parseInt(timeRange)
    const data: { day: string; avgProgress: number }[] = []

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split("T")[0]
      const dayCheckIns = filteredCheckIns.filter((c) => c.dateTime.startsWith(dateStr))
      const avgProgress =
        dayCheckIns.length > 0 ? dayCheckIns.reduce((sum, c) => sum + c.progressDelta, 0) / dayCheckIns.length : 0

      data.push({
        day: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
        avgProgress: Math.round(avgProgress * 10) / 10,
      })
    }

    return data
  }, [filteredCheckIns, timeRange])

  // Procrastination type
  const procrastinationAnalysis = useMemo(() => {
    return getProcrastinationType(tasks, checkIns)
  }, [tasks, checkIns])

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  if (tasks.length === 0 || checkIns.length === 0) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <EmptyState
          icon={BarChart3}
          title="No Data Yet"
          description="Add tasks and do some check-ins to see your procrastination patterns and progress analytics."
          action={null}
        />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Analysis</h1>
        <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">7 days</SelectItem>
            <SelectItem value="30">30 days</SelectItem>
            <SelectItem value="all">All time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Procrastination Type */}
      <Card className="border-l-4 border-l-primary">
        <CardHeader>
          <CardTitle className="text-base">Your Procrastination Type</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-bold text-lg">{procrastinationAnalysis.type}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mt-1">{procrastinationAnalysis.description}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-2">Improvement Tips</h4>
            <ul className="space-y-1 text-sm">
              {procrastinationAnalysis.tips.map((tip, index) => (
                <li key={index} className="flex gap-2">
                  <span className="text-primary font-bold">•</span>
                  <span className="text-muted-foreground">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Check-in Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Check-in Frequency</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={checkInFrequencyData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={timeRange === "30" ? 4 : 1} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Progress Trend */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Average Progress Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={progressTrendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} interval={timeRange === "30" ? 4 : 1} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Line
                type="monotone"
                dataKey="avgProgress"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ fill: "hsl(var(--primary))" }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-xs text-muted-foreground mt-2">Average progress delta per check-in session</p>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Total Check-ins</span>
            <span className="font-semibold">{filteredCheckIns.length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Active Tasks</span>
            <span className="font-semibold">{tasks.filter((t) => t.status === "active").length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Completed Tasks</span>
            <span className="font-semibold">{tasks.filter((t) => t.status === "done").length}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Avg Progress/Check-in</span>
            <span className="font-semibold">
              {filteredCheckIns.length > 0
                ? `${Math.round((filteredCheckIns.reduce((sum, c) => sum + c.progressDelta, 0) / filteredCheckIns.length) * 10) / 10}%`
                : "0%"}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
