export function YAxisLabels() {
  const labels = ['Mon', '', 'Wed', '', 'Fri', '', '']
  
  return (
    <div className="mr-2 flex flex-col justify-between text-xs text-gray-500 leading-[14px]">
      {labels.map((label, index) => (
        <span 
          key={index}
          className={label ? '' : 'opacity-0'}
          style={{ height: '14px', display: 'flex', alignItems: 'center' }}
        >
          {label || '.'}
        </span>
      ))}
    </div>
  )
}