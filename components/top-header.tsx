"use client"

import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function TopHeader() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [currentDate, setCurrentDate] = useState("")

  useEffect(() => {
    setMounted(true)
    const updateDate = () => {
      const now = new Date()
      setCurrentDate(
        now.toLocaleDateString("en-US", {
          weekday: "short",
          month: "short",
          day: "numeric",
        }),
      )
    }
    updateDate()
    const interval = setInterval(updateDate, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
          <div className="text-sm font-medium text-muted-foreground">Loading...</div>
          <div className="h-9 w-9" />
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
      <div className="mx-auto flex h-14 max-w-lg items-center justify-between px-4">
        <div className="text-sm font-medium text-muted-foreground">{currentDate}</div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>
    </header>
  )
}
