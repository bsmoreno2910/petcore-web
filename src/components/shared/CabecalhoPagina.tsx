import type { ReactNode } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  actions?: ReactNode
  noPrint?: boolean
}

export function PageHeader({ title, description, actions, noPrint }: PageHeaderProps) {
  return (
    <div className={`flex items-center justify-between mb-6${noPrint ? ' no-print' : ''}`}>
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        )}
      </div>
      {actions && <div className={`flex items-center gap-2${noPrint ? ' no-print' : ''}`}>{actions}</div>}
    </div>
  )
}
