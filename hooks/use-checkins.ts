"use client"

import { useState, useEffect } from "react"
import type { CheckIn } from "@/lib/types"
import { storage } from "@/lib/storage"

export function useCheckIns() {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const loadedCheckIns = storage.getCheckIns()
    setCheckIns(loadedCheckIns)
    setIsLoaded(true)
  }, [])

  const refreshCheckIns = () => {
    setCheckIns(storage.getCheckIns())
  }

  const addCheckIn = (checkIn: CheckIn) => {
    storage.addCheckIn(checkIn)
    refreshCheckIns()
  }

  const getCheckInsForTask = (taskId: string) => {
    return storage.getCheckInsForTask(taskId)
  }

  return { checkIns, isLoaded, addCheckIn, refreshCheckIns, getCheckInsForTask }
}
