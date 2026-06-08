import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils.ts'

type PredictionPromptProps = {
  /** The question the learner should answer before interacting. */
  readonly question: string
  /** The discussion revealed after they commit to a prediction. */
  readonly answer?: ReactNode
  readonly className?: string
}

function PredictionPrompt({
  question,
  answer,
  className,
}: PredictionPromptProps) {
  const [revealed, setRevealed] = useState(false)

  return (
    <div
      className={cn('border-y border-accent/40 bg-accent/5 py-5', className)}
    >
      <div className="flex items-start gap-3">
        <Lightbulb
          className="mt-0.5 h-5 w-5 shrink-0 text-accent"
          aria-hidden="true"
        />
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wide text-accent">
            Predict first
          </p>
          <p className="text-base leading-7 text-foreground">{question}</p>
        </div>
      </div>

      {answer !== undefined ? (
        <div className="mt-4 pl-8">
          {revealed ? (
            <div className="border-l-2 border-accent/40 pl-4 text-sm leading-6 text-muted-foreground">
              {answer}
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                setRevealed(true)
              }}
              className="text-sm font-medium text-accent underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              I have a prediction. Show me.
            </button>
          )}
        </div>
      ) : null}
    </div>
  )
}

export { PredictionPrompt }
