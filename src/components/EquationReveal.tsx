import { useEffect, useRef, useState } from 'react'
import katex from 'katex'
import { Eye, EyeOff } from 'lucide-react'
import { MathText } from '@/components/MathText.tsx'
import { cn } from '@/lib/utils.ts'

type EquationRevealProps = {
  /** The plain-English meaning, always shown first. */
  readonly sentence: string
  /** The symbolic form, revealed on demand as KaTeX. */
  readonly equation: string
  readonly caption?: string
  readonly defaultRevealed?: boolean
  readonly className?: string
}

function EquationReveal({
  sentence,
  equation,
  caption,
  defaultRevealed = false,
  className,
}: EquationRevealProps) {
  const [revealed, setRevealed] = useState(defaultRevealed)
  const equationRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!revealed) {
      return
    }
    const element = equationRef.current
    if (element === null) {
      return
    }
    katex.render(equation, element, {
      displayMode: true,
      throwOnError: false,
      strict: 'ignore',
    })
  }, [equation, revealed])

  return (
    <figure className={cn('border-y border-border bg-card/40 py-5', className)}>
      <p className="text-base leading-7 text-foreground">
        <MathText text={sentence} />
      </p>

      <div className="mt-4">
        {revealed ? (
          <div
            ref={equationRef}
            className="overflow-x-auto rounded-md border bg-background px-4 py-3 text-foreground"
            aria-label={equation}
          />
        ) : (
          <button
            type="button"
            onClick={() => {
              setRevealed(true)
            }}
            className="inline-flex items-center gap-2 rounded-md border border-border bg-background px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-secondary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Eye className="h-4 w-4" aria-hidden="true" />
            Reveal the equation
          </button>
        )}
      </div>

      {revealed ? (
        <button
          type="button"
          onClick={() => {
            setRevealed(false)
          }}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
          Hide
        </button>
      ) : null}

      {caption !== undefined ? (
        <figcaption className="mt-3 text-xs leading-5 text-muted-foreground">
          <MathText text={caption} />
        </figcaption>
      ) : null}
    </figure>
  )
}

export { EquationReveal }
