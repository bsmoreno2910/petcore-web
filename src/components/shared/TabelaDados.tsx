import { useEffect, useMemo, useRef, useState } from 'react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
  type RowSelectionState,
  type VisibilityState,
} from '@tanstack/react-table'
import { cn } from '@/lib/utilitarios'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
} from 'lucide-react'

// --- Public column definition (backwards-compatible) ---

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => React.ReactNode
  className?: string
}

// --- Props ---

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  page?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  loading?: boolean
  onRowClick?: (item: T) => void
  enableRowSelection?: boolean
  onSelectionChange?: (selectedIds: string[]) => void
  enableColumnVisibility?: boolean
}

// --- Component ---

export function DataTable<T extends { id?: string }>({
  columns,
  data,
  page,
  totalPages,
  onPageChange,
  loading,
  onRowClick,
  enableRowSelection = false,
  onSelectionChange,
  enableColumnVisibility = false,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([])
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
  const [visibilityOpen, setVisibilityOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    if (!visibilityOpen) return
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setVisibilityOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [visibilityOpen])

  // Reset selection when data/page changes
  useEffect(() => {
    setRowSelection({})
  }, [data, page])

  // Notify parent of selection changes
  useEffect(() => {
    if (!enableRowSelection || !onSelectionChange) return
    const selectedIds = Object.keys(rowSelection)
      .filter((k) => rowSelection[k])
      .map((idx) => {
        const row = data[Number(idx)]
        return row?.id ?? idx
      })
    onSelectionChange(selectedIds)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rowSelection])

  // Map external Column<T>[] to tanstack ColumnDef<T>[]
  const tanstackColumns = useMemo<ColumnDef<T, unknown>[]>(() => {
    const mapped: ColumnDef<T, unknown>[] = columns.map((col) => ({
      id: col.key,
      accessorFn: (row: T) => (row as Record<string, unknown>)[col.key],
      header: () => col.header,
      cell: ({ row }) =>
        col.render
          ? col.render(row.original)
          : ((row.original as Record<string, unknown>)[col.key] as React.ReactNode),
      meta: { className: col.className },
    }))

    if (enableRowSelection) {
      mapped.unshift({
        id: '_selection',
        header: ({ table }) => (
          <input
            type="checkbox"
            className="accent-primary h-4 w-4 cursor-pointer"
            checked={table.getIsAllPageRowsSelected()}
            onChange={table.getToggleAllPageRowsSelectedHandler()}
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            className="accent-primary h-4 w-4 cursor-pointer"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            onClick={(e) => e.stopPropagation()}
          />
        ),
        enableSorting: false,
      })
    }

    return mapped
  }, [columns, enableRowSelection])

  const table = useReactTable({
    data,
    columns: tanstackColumns,
    state: { sorting, rowSelection, columnVisibility },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    enableRowSelection,
    getRowId: (row, index) => (row as T & { id?: string }).id ?? String(index),
    // Pagination is server-side, so we don't use getPaginationRowModel
    manualPagination: true,
  })

  const totalCols = table.getVisibleLeafColumns().length

  return (
    <div className="space-y-2">
      {/* Column visibility toggle */}
      {enableColumnVisibility && (
        <div className="flex justify-end" ref={dropdownRef}>
          <div className="relative">
            <button
              type="button"
              onClick={() => setVisibilityOpen((o) => !o)}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm',
                'bg-card text-foreground hover:bg-accent/10 transition-colors',
              )}
            >
              <Eye size={14} />
              Colunas
            </button>

            {visibilityOpen && (
              <div
                className={cn(
                  'absolute right-0 z-50 mt-1 min-w-[180px] rounded-md border border-border',
                  'bg-card p-2 shadow-lg',
                )}
              >
                {table.getAllLeafColumns()
                  .filter((c) => c.id !== '_selection')
                  .map((column) => {
                    const colDef = columns.find((c) => c.key === column.id)
                    return (
                      <label
                        key={column.id}
                        className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-muted cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="accent-primary h-3.5 w-3.5"
                          checked={column.getIsVisible()}
                          onChange={column.getToggleVisibilityHandler()}
                        />
                        {colDef?.header ?? column.id}
                      </label>
                    )
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table */}
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="bg-muted">
                  {headerGroup.headers.map((header) => {
                    const meta = header.column.columnDef.meta as
                      | { className?: string }
                      | undefined
                    const canSort = header.column.getCanSort()
                    const sorted = header.column.getIsSorted()

                    return (
                      <th
                        key={header.id}
                        className={cn(
                          'px-4 py-3 text-left font-medium text-muted-foreground',
                          canSort && 'cursor-pointer select-none',
                          meta?.className,
                        )}
                        onClick={canSort ? header.column.getToggleSortingHandler() : undefined}
                      >
                        <span className="inline-flex items-center gap-1">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {canSort && (
                            <span className="text-muted-foreground/60">
                              {sorted === 'asc' ? (
                                <ArrowUp size={14} />
                              ) : sorted === 'desc' ? (
                                <ArrowDown size={14} />
                              ) : (
                                <ArrowUpDown size={14} />
                              )}
                            </span>
                          )}
                        </span>
                      </th>
                    )
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td
                    colSpan={totalCols}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Carregando...
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={totalCols}
                    className="px-4 py-8 text-center text-muted-foreground"
                  >
                    Nenhum registro encontrado
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row, idx) => (
                  <tr
                    key={row.id}
                    onClick={() => onRowClick?.(row.original)}
                    className={cn(
                      'border-t border-border transition-colors',
                      idx % 2 === 0 ? 'bg-background' : 'bg-muted/30',
                      onRowClick && 'cursor-pointer hover:bg-accent/5',
                    )}
                  >
                    {row.getVisibleCells().map((cell) => {
                      const meta = cell.column.columnDef.meta as
                        | { className?: string }
                        | undefined
                      return (
                        <td
                          key={cell.id}
                          className={cn('px-4 py-3', meta?.className)}
                        >
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      )
                    })}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination (server-side) */}
        {page != null && totalPages != null && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-muted/30">
            <span className="text-sm text-muted-foreground">
              Página {page} de {totalPages}
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => onPageChange?.(1)}
                disabled={page <= 1}
                className="p-1.5 rounded hover:bg-secondary disabled:opacity-30"
                title="Primeira página"
              >
                <ChevronsLeft size={16} />
              </button>
              <button
                onClick={() => onPageChange?.(page - 1)}
                disabled={page <= 1}
                className="p-1.5 rounded hover:bg-secondary disabled:opacity-30"
                title="Página anterior"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => onPageChange?.(page + 1)}
                disabled={page >= totalPages}
                className="p-1.5 rounded hover:bg-secondary disabled:opacity-30"
                title="Próxima página"
              >
                <ChevronRight size={16} />
              </button>
              <button
                onClick={() => onPageChange?.(totalPages)}
                disabled={page >= totalPages}
                className="p-1.5 rounded hover:bg-secondary disabled:opacity-30"
                title="Última página"
              >
                <ChevronsRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
