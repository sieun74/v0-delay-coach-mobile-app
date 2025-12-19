"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { storage } from "@/lib/storage"
import { generateSampleTasks } from "@/lib/sample-data"
import { useTasks } from "@/hooks/use-tasks"
import { useToast } from "@/hooks/use-toast"
import { Trash2, Download } from "lucide-react"

export default function SettingsPage() {
  const { refreshTasks } = useTasks()
  const { toast } = useToast()
  const [coachTone, setCoachTone] = useState("normal")
  const [alertHours, setAlertHours] = useState("24")
  const [showResetDialog, setShowResetDialog] = useState(false)

  useEffect(() => {
    const settings = storage.getSettings()
    setCoachTone(settings.coachTone)
    setAlertHours(settings.alertHours.toString())
  }, [])

  const handleSaveSettings = () => {
    storage.saveSettings({
      coachTone,
      alertHours: Number.parseInt(alertHours),
    })
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated.",
    })
  }

  const handleLoadSamples = () => {
    const samples = generateSampleTasks()
    samples.forEach((task) => storage.addTask(task))
    refreshTasks()
    toast({
      title: "Sample tasks loaded",
      description: "8 sample tasks have been added for testing.",
    })
  }

  const handleResetAll = () => {
    storage.resetAll()
    refreshTasks()
    setShowResetDialog(false)
    toast({
      title: "All data reset",
      description: "All tasks, check-ins, and settings have been cleared.",
    })
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 p-4">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Coach Tone */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Coach Tone Intensity</CardTitle>
          <CardDescription>Adjust how blunt your coach feedback should be</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="coachTone">Tone</Label>
            <Select value={coachTone} onValueChange={setCoachTone}>
              <SelectTrigger id="coachTone">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="gentle">Gentle - Encouraging and supportive</SelectItem>
                <SelectItem value="normal">Normal - Direct and factual</SelectItem>
                <SelectItem value="savage">Savage - Blunt and pressuring</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Alert Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alert Rules</CardTitle>
          <CardDescription>Set warning thresholds for check-in reminders (UI simulation)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="alertHours">No Check-in Alert (hours)</Label>
            <Select value={alertHours} onValueChange={setAlertHours}>
              <SelectTrigger id="alertHours">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="12">12 hours</SelectItem>
                <SelectItem value="24">24 hours</SelectItem>
                <SelectItem value="48">48 hours</SelectItem>
                <SelectItem value="72">72 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleSaveSettings} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data Management</CardTitle>
          <CardDescription>Load sample data or reset everything</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          <Button onClick={handleLoadSamples} variant="outline" className="w-full bg-transparent">
            <Download className="mr-2 h-4 w-4" />
            Load 8 Sample Tasks
          </Button>
          <Button
            onClick={() => setShowResetDialog(true)}
            variant="outline"
            className="w-full text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Reset All Data
          </Button>
        </CardContent>
      </Card>

      {/* About */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">About DelayCoach</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>
            DelayCoach is your deadline accountability partner. It tracks your progress, detects procrastination, and
            gives you the push you need to stay on track.
          </p>
          <p className="text-xs">All data is stored locally in your browser. No server, no tracking.</p>
        </CardContent>
      </Card>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset All Data?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete all tasks, check-ins, and settings. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetAll}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Reset Everything
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
