import { ReactNode, memo } from 'react'
import { clsx } from 'clsx'

interface Column<T> {
  key: string
  header: string
  render?: (item: T) => ReactNode
  width?: string
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  loading?: boolean
  emptyMessage?: string
  keyExtractor: (item: T) => string
  onRowClick?: (item: T) => void
}

function DataTableComponent<T>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  keyExtractor,
  onRowClick,
}: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (data.length === 0) {
    return <div className="empty-state">{emptyMessage}</div>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-surface-high">
            {columns.map(column => (
              <th
                key={column.key}
                className="pb-4 font-semibold text-sm text-on-surface-variant uppercase tracking-wider"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map(item => (
            <tr
              key={keyExtractor(item)}
              className={clsx(
                'border-b border-surface-high last:border-0 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-surface-low'
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map(column => (
                <td key={`${keyExtractor(item)}-${column.key}`} className="py-4 text-on-surface">
                  {column.render
                    ? column.render(item)
                    : ((item as Record<string, unknown>)[column.key] as ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const DataTable = memo(DataTableComponent) as typeof DataTableComponent
