import ReactDatePicker, { registerLocale } from 'react-datepicker'
import { ptBR } from 'date-fns/locale/pt-BR'
import 'react-datepicker/dist/react-datepicker.css'
import { Calendar } from 'lucide-react'
import { cn } from '@/lib/utilitarios'

registerLocale('pt-BR', ptBR)

interface DatePickerProps {
  value: Date | null
  onChange: (date: Date | null) => void
  placeholder?: string
  error?: string
  label?: string
  required?: boolean
  maxDate?: Date
  minDate?: Date
  showTimeSelect?: boolean
  dateFormat?: string
  className?: string
}

export function DatePicker({
  value, onChange, placeholder = 'Selecione a data',
  error, label, required, maxDate, minDate,
  showTimeSelect, dateFormat, className,
}: DatePickerProps) {
  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium mb-1">
          {label} {required && <span className="text-destructive">*</span>}
        </label>
      )}
      <div className="relative">
        <ReactDatePicker
          selected={value}
          onChange={onChange}
          locale="pt-BR"
          dateFormat={dateFormat ?? (showTimeSelect ? 'dd/MM/yyyy HH:mm' : 'dd/MM/yyyy')}
          placeholderText={placeholder}
          maxDate={maxDate}
          minDate={minDate}
          showTimeSelect={showTimeSelect}
          timeFormat="HH:mm"
          timeIntervals={15}
          showYearDropdown
          showMonthDropdown
          dropdownMode="select"
          isClearable
          className={cn(
            'w-full pl-9 pr-4 py-2 border rounded-lg text-sm bg-background text-foreground',
            error ? 'border-destructive' : 'border-input',
          )}
          calendarClassName="petcore-datepicker"
          wrapperClassName="w-full"
          popperClassName="petcore-datepicker-popper"
        />
        <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  )
}
