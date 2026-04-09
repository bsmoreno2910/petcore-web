import { cn } from '@/lib/utils'

const coresStatus: Record<string, string> = {
  // Agendamentos
  Agendado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Confirmado: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
  Chegou: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  EmAndamento: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  Concluido: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Cancelado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Faltou: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',

  // Internações
  Ativo: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  Alta: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Transferido: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Obito: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',

  // Exames
  Solicitado: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  AmostraColetada: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
  Processando: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',

  // Financeiro
  Pendente: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  Pago: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  Atrasado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  ParcialmentePago: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',

  // Pedidos
  Rascunho: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  Aprovado: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  ParcialmenteRecebido: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  Recebido: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',

  // Estoque
  Zerado: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  Baixo: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  Normal: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',

  // Genérico
  Inativo: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
  'Prontuário': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Exame: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'Internação': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
}

const labelsAmigaveis: Record<string, string> = {
  EmAndamento: 'Em Andamento',
  AmostraColetada: 'Amostra Coletada',
  ParcialmentePago: 'Parcialmente Pago',
  ParcialmenteRecebido: 'Parcialmente Recebido',
}

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const label = labelsAmigaveis[status] || status

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        coresStatus[status] ?? 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300',
        className,
      )}
    >
      {label}
    </span>
  )
}
