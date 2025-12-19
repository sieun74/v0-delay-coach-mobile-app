import type { Task, CheckIn } from "./types"

const TASKS_KEY = "delaycoach_tasks"
const CHECKINS_KEY = "delaycoach_checkins"
const SETTINGS_KEY = "delaycoach_settings"

export const storage = {
  // Tasks
  getTasks(): Task[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(TASKS_KEY)
    return data ? JSON.parse(data) : []
  },

  saveTasks(tasks: Task[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks))
  },

  addTask(task: Task): void {
    const tasks = this.getTasks()
    tasks.push(task)
    this.saveTasks(tasks)
  },

  updateTask(id: string, updates: Partial<Task>): void {
    const tasks = this.getTasks()
    const index = tasks.findIndex((t) => t.id === id)
    if (index !== -1) {
      tasks[index] = { ...tasks[index], ...updates, updatedAt: new Date().toISOString() }
      this.saveTasks(tasks)
    }
  },

  deleteTask(id: string): void {
    const tasks = this.getTasks().filter((t) => t.id !== id)
    this.saveTasks(tasks)
    // Also delete related check-ins
    const checkIns = this.getCheckIns().filter((c) => c.taskId !== id)
    this.saveCheckIns(checkIns)
  },

  // CheckIns
  getCheckIns(): CheckIn[] {
    if (typeof window === "undefined") return []
    const data = localStorage.getItem(CHECKINS_KEY)
    return data ? JSON.parse(data) : []
  },

  saveCheckIns(checkIns: CheckIn[]): void {
    if (typeof window === "undefined") return
    localStorage.setItem(CHECKINS_KEY, JSON.stringify(checkIns))
  },

  addCheckIn(checkIn: CheckIn): void {
    const checkIns = this.getCheckIns()
    checkIns.push(checkIn)
    this.saveCheckIns(checkIns)
  },

  getCheckInsForTask(taskId: string): CheckIn[] {
    return this.getCheckIns().filter((c) => c.taskId === taskId)
  },

  // Settings
  getSettings(): { coachTone: string; alertHours: number } {
    if (typeof window === "undefined") return { coachTone: "normal", alertHours: 24 }
    const data = localStorage.getItem(SETTINGS_KEY)
    return data ? JSON.parse(data) : { coachTone: "normal", alertHours: 24 }
  },

  saveSettings(settings: { coachTone: string; alertHours: number }): void {
    if (typeof window === "undefined") return
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings))
  },

  // Reset all data
  resetAll(): void {
    if (typeof window === "undefined") return
    localStorage.removeItem(TASKS_KEY)
    localStorage.removeItem(CHECKINS_KEY)
    localStorage.removeItem(SETTINGS_KEY)
  },
}
