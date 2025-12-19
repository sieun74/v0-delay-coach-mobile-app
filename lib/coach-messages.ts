import type { Task, CoachTone, CheckIn } from "./types"

type MessageTemplate = {
  fact: string
  action: string
}

export function generateCoachMessage(task: Task, progressDelta: number, tone: CoachTone = "normal"): MessageTemplate {
  const daysLeft = getDaysUntilDue(task.dueDate)
  const hoursLeft = daysLeft * 24
  const progressLack = 100 - task.progress

  // No progress check-in
  if (progressDelta === 0) {
    return getNoProgressMessage(daysLeft, tone)
  }

  // Deadline bomb (due soon with low progress)
  if (daysLeft <= 2 && progressLack > 60) {
    return getBombMessage(daysLeft, progressLack, tone)
  }

  // Low progress warning
  if (progressLack > 70 && daysLeft < 7) {
    return getLowProgressMessage(daysLeft, progressLack, tone)
  }

  // Positive progress
  if (progressDelta > 15) {
    return getPositiveMessage(progressDelta, tone)
  }

  // Default encouragement
  return getDefaultMessage(progressDelta, daysLeft, tone)
}

function getNoProgressMessage(daysLeft: number, tone: CoachTone): MessageTemplate {
  if (tone === "savage") {
    return {
      fact:
        daysLeft <= 2
          ? "0% progress and deadline incoming. That's bold."
          : "Days with zero check-ins. Stop disappearing.",
      action: "Today: save 3 references and write 1 outline sentence.",
    }
  }
  if (tone === "gentle") {
    return {
      fact: "No progress recorded yet. That's okay, let's start now.",
      action: "Spend 10 minutes writing down 3 key points to cover.",
    }
  }
  return {
    fact: "0% means you haven't started yet.",
    action: "Spend 10 minutes and write a 3-line outline.",
  }
}

function getBombMessage(daysLeft: number, progressLack: number, tone: CoachTone): MessageTemplate {
  const hours = daysLeft * 24
  if (tone === "savage") {
    return {
      fact: `${hours}h left with ${progressLack}% remaining. This is a bomb countdown.`,
      action: "Write 5 sentences for the intro right now. Not tomorrow.",
    }
  }
  if (tone === "gentle") {
    return {
      fact: `You have ${hours} hours and ${progressLack}% to complete.`,
      action: "Focus on writing one complete paragraph today.",
    }
  }
  return {
    fact: `Due in ${hours}h with ${progressLack}% left. Critical zone.`,
    action: "Write 5 sentences for the intro right now.",
  }
}

function getLowProgressMessage(daysLeft: number, progressLack: number, tone: CoachTone): MessageTemplate {
  if (tone === "savage") {
    return {
      fact: `${daysLeft} days left, ${progressLack}% incomplete. Math says you're behind.`,
      action: "Draft one full section today. Stop planning, start writing.",
    }
  }
  if (tone === "gentle") {
    return {
      fact: `${daysLeft} days to finish ${progressLack}% of the work.`,
      action: "Let's make steady progress: write one paragraph today.",
    }
  }
  return {
    fact: `${daysLeft} days for ${progressLack}% work. You're behind schedule.`,
    action: "Write one complete section today.",
  }
}

function getPositiveMessage(progressDelta: number, tone: CoachTone): MessageTemplate {
  if (tone === "savage") {
    return {
      fact: `+${progressDelta}% is solid. Keep this energy.`,
      action: "Don't lose momentum. Add another 10% tomorrow.",
    }
  }
  if (tone === "gentle") {
    return {
      fact: `Great work! +${progressDelta}% progress today.`,
      action: "You're building momentum. Keep going tomorrow.",
    }
  }
  return {
    fact: `+${progressDelta}% is good progress.`,
    action: "Maintain this pace. Do the same tomorrow.",
  }
}

function getDefaultMessage(progressDelta: number, daysLeft: number, tone: CoachTone): MessageTemplate {
  if (tone === "savage") {
    return {
      fact: `+${progressDelta}% is okay, but you can do better.`,
      action: "Push for +15% next check-in. Small gains compound.",
    }
  }
  if (tone === "gentle") {
    return {
      fact: `You made progress: +${progressDelta}%.`,
      action: "Every step counts. Try for a bit more tomorrow.",
    }
  }
  return {
    fact: `+${progressDelta}% progress with ${daysLeft} days left.`,
    action: "Aim for +10% in your next check-in.",
  }
}

function getDaysUntilDue(dueDate: string): number {
  const now = new Date()
  const due = new Date(dueDate)
  const diff = due.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getProcrastinationType(
  tasks: Task[],
  checkIns: CheckIn[],
): {
  type: string
  description: string
  tips: string[]
} {
  if (tasks.length === 0) {
    return {
      type: "Getting Started",
      description: "Add some tasks to get personalized insights.",
      tips: ["Add your first task", "Do regular check-ins", "Track your progress"],
    }
  }

  const avgProgressDelta =
    checkIns.length > 0 ? checkIns.reduce((sum, c) => sum + c.progressDelta, 0) / checkIns.length : 0

  const checkInFrequency = checkIns.length / tasks.length
  const recentCheckIns = checkIns.filter((c) => {
    const age = Date.now() - new Date(c.dateTime).getTime()
    return age < 7 * 24 * 60 * 60 * 1000 // Last 7 days
  })

  const zeroProgressCount = checkIns.filter((c) => c.progressDelta === 0).length
  const hasLongNotes = checkIns.some((c) => c.note && c.note.length > 50)

  // Crisis sprinter: big deltas right before deadlines
  const lastMinuteCheckIns = tasks.filter((t) => {
    const taskCheckIns = checkIns.filter((c) => c.taskId === t.id)
    const daysLeft = getDaysUntilDue(t.dueDate)
    return daysLeft <= 2 && taskCheckIns.some((c) => c.progressDelta > 20)
  })

  if (lastMinuteCheckIns.length >= tasks.length * 0.5) {
    return {
      type: "Crisis Sprinter",
      description: "You always sprint at the last second. High stress, high risk.",
      tips: [
        "Start tasks within 24 hours of creation",
        "Do smaller daily check-ins instead of weekly",
        "Aim for +5% daily instead of +30% weekly",
      ],
    }
  }

  // Perfectionist: frequent check-ins, small deltas, long notes
  if (checkInFrequency > 2 && avgProgressDelta < 8 && hasLongNotes) {
    return {
      type: "Perfectionist",
      description: "You're polishing nothing. Draft first, refine later.",
      tips: [
        "Set a timer: 25 min drafting, no editing",
        "Aim for completion, not perfection",
        "Revise only after finishing the first draft",
      ],
    }
  }

  // Lazy/avoidant: rare check-ins, many zeros
  if (checkInFrequency < 1 || zeroProgressCount > checkIns.length * 0.6) {
    return {
      type: "Avoidant",
      description: "Rare check-ins and zero progress. Avoidance is the enemy.",
      tips: [
        "Check in daily, even if progress is small",
        "Break tasks into 15-minute chunks",
        "Just show up and do 1 sentence",
      ],
    }
  }

  // Scattered: many tasks but uneven check-ins
  if (tasks.length > 5) {
    const checkInDistribution = tasks.map((t) => checkIns.filter((c) => c.taskId === t.id).length)
    const max = Math.max(...checkInDistribution)
    const min = Math.min(...checkInDistribution)
    if (max - min > 5) {
      return {
        type: "Scattered",
        description: "Many tasks, uneven attention. Focus wins.",
        tips: [
          "Work on max 3 tasks per week",
          "Complete one before starting another",
          "Use priority to decide what to focus on",
        ],
      }
    }
  }

  return {
    type: "Balanced",
    description: "Good balance of consistency and progress. Keep it up.",
    tips: [
      "Maintain your current check-in rhythm",
      "Increase progress per session by 2-5%",
      "Celebrate small wins to stay motivated",
    ],
  }
}
