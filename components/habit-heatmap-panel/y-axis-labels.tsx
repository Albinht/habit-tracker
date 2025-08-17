export function YAxisLabels() {
  const labels = ['Mon', '', 'Wed', '', 'Fri', '', '']
  
  return (
    <div className="mr-2 flex flex-col text-xs text-gray-500 y-axis-labels" style={{ gap: 'var(--cell-gap)' }}>
      {labels.map((label, index) => (
        <span 
          key={index}
          className={`${label ? '' : 'opacity-0'} flex items-center justify-end`}
          style={{ 
            height: 'var(--cell-size)', 
            minHeight: 'var(--cell-size)'
          }}
        >
          {label || '.'}
        </span>
      ))}
    </div>
  )
}