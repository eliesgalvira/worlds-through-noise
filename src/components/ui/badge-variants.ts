import { cva, type VariantProps } from 'class-variance-authority'

export const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-md border px-2.5 py-0.5 font-mono text-xs font-medium leading-5 tracking-tight',
  {
    variants: {
      variant: {
        default: 'border-border bg-secondary text-secondary-foreground',
        outline: 'border-border bg-transparent text-muted-foreground',
        h0: 'border-transparent bg-h0/10 text-h0',
        h1: 'border-transparent bg-h1/15 text-accent-foreground',
        detection: 'border-transparent bg-detection/12 text-detection',
        falseAlarm: 'border-transparent bg-false-alarm/12 text-false-alarm',
        accent: 'border-transparent bg-accent/15 text-accent',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export type BadgeVariantProps = VariantProps<typeof badgeVariants>
