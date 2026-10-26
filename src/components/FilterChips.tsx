import type { CSSProperties } from 'react'
import './FilterChips.css'

interface FilterOption<T extends string> {
  value: T
  label: string
}

interface FilterChipsProps<T extends string> {
  options: FilterOption<T>[]
  value: T
  onChange: (value: T) => void
  label: string
}

function FilterChips<T extends string>({ options, value, onChange, label }: FilterChipsProps<T>) {
  const activeIndex = Math.max(0, options.findIndex((option) => option.value === value))

  return (
    <div
      className="chips"
      role="group"
      aria-label={label}
      style={{ '--count': options.length, '--active': activeIndex } as CSSProperties}
    >
      <span className="chips-indicator" aria-hidden="true" />
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className={`chip ${option.value === value ? 'is-active' : ''}`}
          aria-pressed={option.value === value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default FilterChips
