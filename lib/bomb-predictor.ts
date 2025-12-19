import type { Task } from "./types"

export type BombScore = {
  taskId: string
  score: number
  reason: string
}

export function calculateBombScore(task: Task): BombScore {
  const now = new Date()
  const dueDate = new Date(task.dueDate)
  const hoursLeft = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60)
  const daysLeft = hoursLeft / 24

  let score = 0
  let reason = ""

  // Time pressure weight (exponential as deadline approaches)
  if (daysLeft <= 1) {
    score += 50
    reason = "Deadline in 24h"
  } else if (daysLeft <= 2) {
    score += 35
    reason = "Deadline in 48h"
  } else if (daysLeft <= 3) {
    score += 20
    reason = "Deadline in 3 days"
  } else if (daysLeft <= 7) {
    score += 10
  }

  // Progress lack weight
  const progressLack = 100 - task.progress
  if (progressLack > 80) {
    score += 30
    reason = reason ? `${reason}, 80%+ incomplete` : "80%+ incomplete"
  } else if (progressLack > 60) {
    score += 20
    reason = reason ? `${reason}, 60%+ incomplete` : "60%+ incomplete"
  } else if (progressLack > 40) {
    score += 10
  }

  // Hours pressure (not enough time for estimated work)
  const remainingHours = (progressLack / 100) * task.estimatedHours
  if (hoursLeft < remainingHours) {
    const deficit = remainingHours - hoursLeft
    score += Math.min(25, deficit * 2)
    if (deficit > 10) {
      reason = reason ? `${reason}, ${Math.round(deficit)}h short` : `${Math.round(deficit)}h short`
    }
  }

  // No recent check-in penalty
  if (task.lastCheckInAt) {
    const lastCheckIn = new Date(task.lastCheckInAt)
    const hoursSinceCheckIn = (now.getTime() - lastCheckIn.getTime()) / (1000 * 60 * 60)
    if (hoursSinceCheckIn > 72) {
      score += 15
      reason = reason ? `${reason}, no check-in 3d+` : "No check-in 3+ days"
    }
  } else if (daysLeft < 7) {
    score += 20
    reason = reason ? `${reason}, never checked` : "Never checked in"
  }

  // Overdue penalty
  if (task.status === "overdue") {
    score += 100
    reason = "OVERDUE"
  }

  return {
    taskId: task.id,
    score: Math.min(100, score),
    reason: reason || "On track",
  }
}

export function getTopBombs(tasks: Task[], limit = 3): (Task & { bombScore: number; bombReason: string })[] {
  const activeTasks = tasks.filter((t) => t.status === "active" || t.status === "overdue")
  const scored = activeTasks.map((task) => {
    const { score, reason } = calculateBombScore(task)
    return { ...task, bombScore: score, bombReason: reason }
  })

  return scored.sort((a, b) => b.bombScore - a.bombScore).slice(0, limit)
}

export function getRiskLevel(bombScore: number): "safe" | "caution" | "risk" | "bomb" {
  if (bombScore >= 60) return "bomb"
  if (bombScore >= 40) return "risk"
  if (bombScore >= 20) return "caution"
  return "safe"
}
