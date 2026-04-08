import { cn } from '@/lib/utils'

const statusColors: Record<string, string> = {
  // Appointments
  Scheduled: 'bg-blue-100 text-blue-700',
  Confirmed: 'bg-cyan-100 text-cyan-700',
  CheckedIn: 'bg-indigo-100 text-indigo-700',
  InProgress: 'bg-yellow-100 text-yellow-700',
  Completed: 'bg-green-100 text-green-700',
  Cancelled: 'bg-red-100 text-red-700',
  NoShow: 'bg-gray-100 text-gray-700',
  // Hospitalizations
  Active: 'bg-yellow-100 text-yellow-700',
  Discharged: 'bg-green-100 text-green-700',
  Transferred: 'bg-blue-100 text-blue-700',
  Deceased: 'bg-gray-100 text-gray-700',
  // Exams
  Requested: 'bg-blue-100 text-blue-700',
  SampleCollected: 'bg-indigo-100 text-indigo-700',
  Processing: 'bg-yellow-100 text-yellow-700',
  // Financial
  Pending: 'bg-yellow-100 text-yellow-700',
  Paid: 'bg-green-100 text-green-700',
  Overdue: 'bg-red-100 text-red-700',
  PartiallyPaid: 'bg-orange-100 text-orange-700',
  // Orders
  Draft: 'bg-gray-100 text-gray-700',
  Approved: 'bg-green-100 text-green-700',
  PartiallyReceived: 'bg-orange-100 text-orange-700',
  Received: 'bg-green-100 text-green-700',
  // Stock
  Zero: 'bg-red-100 text-red-700',
  Low: 'bg-yellow-100 text-yellow-700',
  Ok: 'bg-green-100 text-green-700',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        statusColors[status] ?? 'bg-gray-100 text-gray-700',
        className,
      )}
    >
      {status}
    </span>
  )
}
