"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
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
import { useTasks } from "@/hooks/use-tasks"
import { useCheckIns } from "@/hooks/use-checkins"
import { useToast } from "@/hooks/use-toast"
import type { Task } from "@/lib/types"
import { Trash2, Check } from "lucide-react"

export function TaskDialog({
  task,
  open,
  onOpenChange,
}: { task: Task; open: boolean; onOpenChange: (open: boolean) => void }) {
  const { updateTask, deleteTask } = useTasks()
  const { getCheckInsForTask } = useCheckIns()
  const { toast } = useToast()
  const [progress, setProgress] = useState(task.progress)
  const [estimatedHours, setEstimatedHours] = useState(task.estimatedHours.toString())
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)

  const recentCheckIns = getCheckInsForTask(task.id)
    .sort((a, b) => new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime())
    .slice(0, 10)

  const handleSave = () => {
    updateTask(task.id, {
      progress,
      estimatedHours: Number.parseInt(estimatedHours) || task.estimatedHours,
    })
    toast({
      title: "Task updated",
      description: "Your changes have been saved.",
    })
    onOpenChange(false)
  }

  const handleMarkDone = () => {
    updateTask(task.id, { status: "done", progress: 100 })
    toast({
      title: "Task completed",
      description: `"${task.title}" marked as done!`,
    })
    onOpenChange(false)
  }

  const handleDelete = () => {
    deleteTask(task.id)
    toast({
      title: "Task deleted",
      description: `"${task.title}" has been removed.`,
    })
    setShowDeleteDialog(false)
    onOpenChange(false)
  }

  const daysLeft = Math.ceil((new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="leading-tight pr-6">{task.title}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Task Info */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subject</span>
                <span className="font-medium">{task.subject}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Due Date</span>
                <span className="font-medium">
                  {new Date(task.dueDate).toLocaleDateString()} ({daysLeft}d)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Priority</span>
                <Badge variant={task.priority === "high" ? "default" : "outline"}>{task.priority}</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={task.status === "done" ? "default" : "outline"}>{task.status}</Badge>
              </div>
            </div>

            {/* Progress Slider */}
            <div className="space-y-2">
              <Label>Progress: {progress}%</Label>
              <Slider
                value={[progress]}
                onValueChange={(value) => setProgress(value[0])}
                max={100}
                step={5}
                className="py-2"
              />
            </div>

            {/* Estimated Hours */}
            <div className="space-y-2">
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                min="1"
                max="100"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>

            {/* Recent Check-ins */}
            <div className="space-y-2">
              <Label>Recent Check-ins</Label>
              {recentCheckIns.length === 0 ? (
                <p className="text-sm text-muted-foreground">No check-ins yet</p>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {recentCheckIns.map((checkIn) => (
                    <div key={checkIn.id} className="rounded-lg border border-border p-2 text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-muted-foreground">{new Date(checkIn.dateTime).toLocaleDateString()}</span>
                        <span className="font-medium">
                          {checkIn.progressDelta > 0 ? "+" : ""}
                          {checkIn.progressDelta}%
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-[10px] py-0">
                          {checkIn.mood}
                        </Badge>
                        {checkIn.note && <span className="text-muted-foreground truncate">{checkIn.note}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground bg-transparent"
              onClick={() => setShowDeleteDialog(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <div className="flex gap-2 flex-1">
              {task.status !== "done" && (
                <Button variant="outline" onClick={handleMarkDone} className="flex-1 bg-transparent">
                  <Check className="mr-2 h-4 w-4" />
                  Mark Done
                </Button>
              )}
              <Button onClick={handleSave} className="flex-1">
                Save Changes
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Task?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{task.title}" and all its check-ins. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
