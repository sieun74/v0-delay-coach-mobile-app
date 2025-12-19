export type Task = {
  id: string
  title: string
  subject: string
  dueDate: string
  estimatedHours: number
  priority: "low" | "mid" | "high"
  createdAt: string
  updatedAt: string
  progress: number
  lastCheckInAt?: string
  status: "active" | "done" | "overdue"
}

export type CheckIn = {
  id: string
  taskId: string
  dateTime: string
  progressDelta: number
  mood: "good" | "neutral" | "bad"
  note?: string
}

export type CoachTone = "gentle" | "normal" | "savage"

export type RiskLevel = "safe" | "caution" | "risk" | "bomb"

export type ProcrastinationType = "perfectionist" | "lazy" | "crisis-sprinter" | "scattered" | "balanced"
