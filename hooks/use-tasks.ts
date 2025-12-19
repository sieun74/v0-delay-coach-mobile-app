"use client"

import { useState, useEffect } from "react"
import type { Task } from "@/lib/types"
import { storage } from "@/lib/storage"

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadedTasks = storage.getTasks()
    setTasks(loadedTasks)
    setIsLoaded(true)
  }, [])

  const refreshTasks = () => {
    setTasks(storage.getTasks())
  }

  const addTask = (task: Task) => {
    storage.addTask(task)
    refreshTasks()
  }

  const updateTask = (id: string, updates: Partial<Task>) => {
    storage.updateTask(id, updates)
    refreshTasks()
  }

  const deleteTask = (id: string) => {
    storage.deleteTask(id)
    refreshTasks()
  }

  return { tasks, isLoaded, addTask, updateTask, deleteTask, refreshTasks }
}
