interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  showLabel?: boolean
  disabled?: boolean
}

function Switch({ checked, onChange, label, showLabel = true, disabled }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={showLabel ? undefined : label}
      className={`switch ${checked ? 'is-on' : ''}`}
      onClick={() => onChange(!checked)}
      disabled={disabled}
    >
      <span className="switch-track" aria-hidden="true">
        <span className="switch-thumb" />
      </span>
      {showLabel && <span className="switch-label">{label}</span>}
    </button>
  )
}

export default Switch
