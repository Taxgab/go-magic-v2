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

/**
 * Tabla de datos reutilizable con loading state y mensaje vacío
 * Optimizado con React.memo para evitar re-renders innecesarios
 */
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
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b text-left">
            {columns.map((column) => (
              <th
                key={column.key}
                className="pb-3 font-medium text-sm text-gray-500"
                style={{ width: column.width }}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr
              key={keyExtractor(item)}
              className={clsx(
                'border-b last:border-0 transition-colors',
                onRowClick && 'cursor-pointer hover:bg-gray-50'
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td
                  key={`${keyExtractor(item)}-${column.key}`}
                  className="py-4"
                >
                  {column.render
                    ? column.render(item)
                    : (item as Record<string, unknown>)[column.key] as ReactNode}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// Memoizar para evitar re-renders cuando las props no cambian
export const DataTable = memo(DataTableComponent) as typeof DataTableComponent
