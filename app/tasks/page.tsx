"use client"

import { useState } from "react"
import { useTasks } from "@/hooks/use-tasks"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { RiskBadge } from "@/components/risk-badge"
import { EmptyState } from "@/components/empty-state"
import { Plus, ListTodo, Filter, SortAsc } from "lucide-react"
import type { Task } from "@/lib/types"
import { calculateBombScore, getRiskLevel } from "@/lib/bomb-predictor"
import { TaskDialog } from "@/components/task-dialog"
import { AddTaskDialog } from "@/components/add-task-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Progress } from "@/components/ui/progress"

type FilterType = "all" | "active" | "done" | "overdue" | "deadline-soon"
type SortType = "due-date" | "recent-checkin" | "low-progress" | "bomb-score"

export default function TasksPage() {
  const { tasks, isLoaded } = useTasks()
  const [selectedTask, setSelectedTask] = useState<Task | null>(null)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [filter, setFilter] = useState<FilterType>("all")
  const [sort, setSort] = useState<SortType>("due-date")

  if (!isLoaded) {
    return (
      <div className="mx-auto max-w-lg p-4">
        <div className="text-center py-12">Loading...</div>
      </div>
    )
  }

  // Apply filters
  let filteredTasks = [...tasks]

  if (filter === "active") {
    filteredTasks = filteredTasks.filter((t) => t.status === "active")
  } else if (filter === "done") {
    filteredTasks = filteredTasks.filter((t) => t.status === "done")
  } else if (filter === "overdue") {
    filteredTasks = filteredTasks.filter((t) => t.status === "overdue")
  } else if (filter === "deadline-soon") {
    filteredTasks = filteredTasks.filter((t) => {
      const daysLeft = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
      return daysLeft <= 3 && t.status === "active"
    })
  }

  // Apply sorting
  if (sort === "due-date") {
    filteredTasks.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
  } else if (sort === "recent-checkin") {
    filteredTasks.sort((a, b) => {
      const aTime = a.lastCheckInAt ? new Date(a.lastCheckInAt).getTime() : 0
      const bTime = b.lastCheckInAt ? new Date(b.lastCheckInAt).getTime() : 0
      return bTime - aTime
    })
  } else if (sort === "low-progress") {
    filteredTasks.sort((a, b) => a.progress - b.progress)
  } else if (sort === "bomb-score") {
    filteredTasks.sort((a, b) => {
      const scoreA = calculateBombScore(a).score
      const scoreB = calculateBombScore(b).score
      return scoreB - scoreA
    })
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks</h1>
        <Button size="icon" onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-5 w-5" />
        </Button>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon={ListTodo}
          title="No Tasks Yet"
          description="Create your first task to start tracking deadlines and progress."
          action={
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Task
            </Button>
          }
        />
      ) : (
        <>
          {/* Filters and Sorting */}
          <div className="flex gap-2">
            <Select value={filter} onValueChange={(value) => setFilter(value as FilterType)}>
              <SelectTrigger className="flex-1">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tasks</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="done">Done</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="deadline-soon">Deadline Soon</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(value) => setSort(value as SortType)}>
              <SelectTrigger className="flex-1">
                <SortAsc className="mr-2 h-4 w-4" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="due-date">Due Date</SelectItem>
                <SelectItem value="bomb-score">Bomb Score</SelectItem>
                <SelectItem value="low-progress">Low Progress</SelectItem>
                <SelectItem value="recent-checkin">Recent Check-in</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Task List */}
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No tasks match your filters.
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredTasks.map((task) => {
                const daysLeft = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
                const bombScore = calculateBombScore(task).score
                const riskLevel = getRiskLevel(bombScore)
                const timeSinceCheckIn = task.lastCheckInAt
                  ? Math.floor((Date.now() - new Date(task.lastCheckInAt).getTime()) / (1000 * 60 * 60))
                  : null

                return (
                  <Card
                    key={task.id}
                    className="cursor-pointer transition-colors hover:bg-accent"
                    onClick={() => setSelectedTask(task)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold leading-tight mb-1">{task.title}</h3>
                          <p className="text-sm text-muted-foreground">{task.subject}</p>
                        </div>
                        <RiskBadge level={riskLevel} />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs">
                          <Badge variant={task.priority === "high" ? "default" : "outline"}>{task.priority}</Badge>
                          <span className="text-muted-foreground">
                            {task.status === "overdue"
                              ? `Overdue ${Math.abs(daysLeft)}d`
                              : task.status === "done"
                                ? "Done"
                                : daysLeft === 0
                                  ? "Due today"
                                  : daysLeft === 1
                                    ? "Due tomorrow"
                                    : `${daysLeft}d left`}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="text-muted-foreground">Progress</span>
                            <span className="font-medium">{task.progress}%</span>
                          </div>
                          <Progress value={task.progress} className="h-2" />
                        </div>

                        {timeSinceCheckIn !== null && (
                          <p className="text-xs text-muted-foreground">
                            Last check-in:{" "}
                            {timeSinceCheckIn < 24
                              ? `${timeSinceCheckIn}h ago`
                              : `${Math.floor(timeSinceCheckIn / 24)}d ago`}
                          </p>
                        )}
                        {timeSinceCheckIn === null && <p className="text-xs text-muted-foreground">No check-ins yet</p>}
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Dialogs */}
      {selectedTask && (
        <TaskDialog task={selectedTask} open={!!selectedTask} onOpenChange={() => setSelectedTask(null)} />
      )}
      <AddTaskDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen} />
    </div>
  )
}
