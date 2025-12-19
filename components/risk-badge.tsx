import { Badge } from "@/components/ui/badge"
import { AlertTriangle, Flame, AlertCircle, CheckCircle } from "lucide-react"
import type { RiskLevel } from "@/lib/types"

export function RiskBadge({ level, score }: { level: RiskLevel; score?: number }) {
  if (level === "bomb") {
    return (
      <Badge variant="bomb" className="gap-1">
        <Flame className="h-3 w-3" />
        Bomb {score !== undefined && `(${score})`}
      </Badge>
    )
  }

  if (level === "risk") {
    return (
      <Badge variant="risk" className="gap-1">
        <AlertTriangle className="h-3 w-3" />
        Risk {score !== undefined && `(${score})`}
      </Badge>
    )
  }

  if (level === "caution") {
    return (
      <Badge variant="caution" className="gap-1">
        <AlertCircle className="h-3 w-3" />
        Caution {score !== undefined && `(${score})`}
      </Badge>
    )
  }

  return (
    <Badge variant="outline" className="gap-1">
      <CheckCircle className="h-3 w-3" />
      Safe
    </Badge>
  )
}
