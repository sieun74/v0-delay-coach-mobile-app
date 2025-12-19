import { Card, CardContent } from "@/components/ui/card"
import { MessageSquare } from "lucide-react"

export function CoachMessageCard({ fact, action }: { fact: string; action: string }) {
  return (
    <Card className="border-l-4 border-l-primary">
      <CardContent className="p-4">
        <div className="flex gap-3">
          <MessageSquare className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          <div className="space-y-2 text-sm">
            <p className="font-semibold leading-relaxed">{fact}</p>
            <p className="text-muted-foreground leading-relaxed">
              <span className="font-medium text-foreground">Action:</span> {action}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
