import type { ComponentProps } from 'react'
import {
  badgeVariants,
  type BadgeVariantProps,
} from '@/components/ui/badge-variants.ts'
import { cn } from '@/lib/utils.ts'

type BadgeProps = ComponentProps<'span'> & BadgeVariantProps

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, className }))}
      {...props}
    />
  )
}

export { Badge }
