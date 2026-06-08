import { Slot } from '@radix-ui/react-slot'
import type { ComponentProps } from 'react'
import {
  buttonVariants,
  type ButtonVariantProps,
} from '@/components/ui/button-variants.ts'
import { cn } from '@/lib/utils.ts'

type ButtonProps = ComponentProps<'button'> &
  ButtonVariantProps & {
    readonly asChild?: boolean
  }

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'

  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button }
