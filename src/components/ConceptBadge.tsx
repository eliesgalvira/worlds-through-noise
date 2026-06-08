import { Hash } from 'lucide-react'
import { Badge } from '@/components/ui/badge.tsx'
import type { BadgeVariantProps } from '@/components/ui/badge-variants.ts'

type ConceptBadgeProps = {
  /** Concept tag, e.g. "Neyman-Pearson", "MAP", "ROC", "CRB". */
  readonly children: string
  readonly variant?: BadgeVariantProps['variant']
  readonly className?: string
}

function ConceptBadge({
  children,
  variant = 'outline',
  className,
}: ConceptBadgeProps) {
  return (
    <Badge variant={variant} className={className}>
      <Hash className="h-3 w-3 opacity-60" aria-hidden="true" />
      {children}
    </Badge>
  )
}

export { ConceptBadge }
