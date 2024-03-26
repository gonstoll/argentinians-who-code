import {cva, type VariantProps} from 'class-variance-authority'
import * as React from 'react'
import {cn} from '~/lib/utils'

const badgeVariants = cva(
  'whitespace-nowrap inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-normal transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-primary text-primary-foreground hover:bg-primary/80',
        secondary:
          'border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80',
        destructive:
          'border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80',
        outline: 'text-foreground',
        hero: 'border-transparent bg-hero/20 text-hero',
        frontend: 'border-transparent bg-frontend/20 text-frontend',
        backend: 'border-transparent bg-backend/20 text-backend',
        fullstack: 'border-transparent bg-fullstack/20 text-fullstack',
        qa: 'border-transparent bg-qa/20 text-qa',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({className, variant, ...props}: BadgeProps) {
  return <div className={cn(badgeVariants({variant}), className)} {...props} />
}

export {Badge, badgeVariants}
