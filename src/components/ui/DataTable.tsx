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
  cardBreakpoint?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

function DataTableComponent<T>({
  data,
  columns,
  loading = false,
  emptyMessage = 'No hay datos disponibles',
  keyExtractor,
  onRowClick,
  cardBreakpoint,
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

  const showCard = cardBreakpoint
  const cardHiddenClasses = {
    sm: 'sm:hidden md:block',
    md: 'md:hidden lg:block',
    lg: 'lg:hidden xl:block',
    xl: 'xl:hidden 2xl:block',
    '2xl': '2xl:hidden',
  }[cardBreakpoint || 'sm']

  const tableHiddenClasses = {
    sm: 'sm:block md:hidden',
    md: 'md:block lg:hidden',
    lg: 'lg:block xl:hidden',
    xl: 'xl:block 2xl:hidden',
    '2xl': '2xl:block',
  }[cardBreakpoint || 'sm']

  if (showCard) {
    return (
      <>
        <div className={`space-y-3 ${cardHiddenClasses}`}>
          {data.map(item => (
            <div
              key={keyExtractor(item)}
              className="bg-surface card p-4"
              onClick={() => onRowClick?.(item)}
            >
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="flex-1 min-w-0">
                  {columns.slice(0, -1).map(column => (
                    <div
                      key={`${keyExtractor(item)}-${column.key}`}
                      className="flex items-start gap-2 mb-2 last:mb-0"
                    >
                      <span className="text-xs text-on-surface-variant uppercase tracking-wider w-20 flex-shrink-0 sm:hidden">
                        {column.header}:
                      </span>
                      <span className="text-on-surface text-sm">
                        {column.render
                          ? column.render(item)
                          : ((item as Record<string, unknown>)[column.key] as ReactNode)}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="flex sm:flex-col gap-2 sm:gap-0 sm:items-end">
                  {columns.slice(-1).map(column => (column.render ? column.render(item) : null))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className={`overflow-x-auto ${tableHiddenClasses}`}>
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
                    <td
                      key={`${keyExtractor(item)}-${column.key}`}
                      className="py-4 text-on-surface"
                    >
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
      </>
    )
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
