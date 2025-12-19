import type { Task } from "./types"

export function generateSampleTasks(): Task[] {
  const now = new Date()

  return [
    {
      id: "sample-1",
      title: "Research Paper Draft",
      subject: "Psychology",
      dueDate: new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 2 days
      estimatedHours: 15,
      priority: "high",
      createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 20,
      lastCheckInAt: new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString(),
      status: "active",
    },
    {
      id: "sample-2",
      title: "Math Problem Set 7",
      subject: "Calculus",
      dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Tomorrow
      estimatedHours: 8,
      priority: "high",
      createdAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 5,
      status: "active",
    },
    {
      id: "sample-3",
      title: "History Essay Outline",
      subject: "European History",
      dueDate: new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 5 days
      estimatedHours: 6,
      priority: "mid",
      createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 45,
      lastCheckInAt: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(),
      status: "active",
    },
    {
      id: "sample-4",
      title: "Lab Report - Chemistry",
      subject: "Chemistry",
      dueDate: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Yesterday (overdue)
      estimatedHours: 10,
      priority: "high",
      createdAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 60,
      lastCheckInAt: new Date(now.getTime() - 72 * 60 * 60 * 1000).toISOString(),
      status: "overdue",
    },
    {
      id: "sample-5",
      title: "Reading Assignment Ch 8-12",
      subject: "Literature",
      dueDate: new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 10 days
      estimatedHours: 5,
      priority: "low",
      createdAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 0,
      status: "active",
    },
    {
      id: "sample-6",
      title: "Group Project Presentation",
      subject: "Business",
      dueDate: new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 14 days
      estimatedHours: 12,
      priority: "mid",
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 10,
      lastCheckInAt: new Date(now.getTime() - 12 * 60 * 60 * 1000).toISOString(),
      status: "active",
    },
    {
      id: "sample-7",
      title: "Final Project Proposal",
      subject: "Computer Science",
      dueDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days
      estimatedHours: 20,
      priority: "high",
      createdAt: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 100,
      lastCheckInAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      status: "done",
    },
    {
      id: "sample-8",
      title: "Biology Quiz Prep",
      subject: "Biology",
      dueDate: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 3 days
      estimatedHours: 4,
      priority: "mid",
      createdAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      progress: 25,
      lastCheckInAt: new Date(now.getTime() - 20 * 60 * 60 * 1000).toISOString(),
      status: "active",
    },
  ]
}
