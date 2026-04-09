import { cn, formatCurrency } from '@/lib/utilitarios'

interface MoneyDisplayProps {
  value: number
  className?: string
  colorize?: boolean
}

export function MoneyDisplay({ value, className, colorize }: MoneyDisplayProps) {
  return (
    <span className={cn(
      'font-mono text-sm',
      colorize && value > 0 && 'text-green-600',
      colorize && value < 0 && 'text-red-600',
      className,
    )}>
      {formatCurrency(value)}
    </span>
  )
}
