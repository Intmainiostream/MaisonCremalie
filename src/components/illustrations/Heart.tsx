interface HeartProps {
  className?: string
}

function Heart({ className }: HeartProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M12 21.5C5.6 16.4 1.5 12.6 1.5 8.1A5.1 5.1 0 0 1 12 5.4a5.1 5.1 0 0 1 10.5 2.7c0 4.5-4.1 8.3-10.5 13.4Z"
      />
    </svg>
  )
}

export default Heart
