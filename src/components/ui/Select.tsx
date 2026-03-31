import { SelectHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, helperText, className, children, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="label">
            {label}
            {props.required && <span className="text-tertiary ml-1">*</span>}
          </label>
        )}
        <select
          ref={ref}
          className={clsx('input-field', error ? 'ring-2 ring-tertiary/30' : '', className)}
          {...props}
        >
          {children}
        </select>
        {error && <p className="mt-2 text-sm text-tertiary">{error}</p>}
        {helperText && !error && (
          <p className="mt-2 text-sm text-on-surface-variant">{helperText}</p>
        )}
      </div>
    )
  }
)

Select.displayName = 'Select'
