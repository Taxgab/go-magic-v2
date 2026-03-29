import { InputHTMLAttributes, forwardRef } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="label">
            {label}
            {props.required && <span className="text-tertiary ml-1">*</span>}
          </label>
        )}
        <input
          ref={ref}
          className={clsx('input-field', error ? 'ring-2 ring-tertiary/30' : '', className)}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-tertiary">{error}</p>}
        {helperText && !error && (
          <p className="mt-2 text-sm text-on-surface-variant">{helperText}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
