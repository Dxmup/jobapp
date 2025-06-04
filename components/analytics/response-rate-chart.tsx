export function ResponseRateChart() {
  return (
    <div className="w-full h-full">
      <svg width="100%" height="100%" viewBox="0 0 100 20">
        <path
          d="M0,15 L10,14 L20,13 L30,11 L40,12 L50,10 L60,9 L70,8 L80,7 L90,6 L100,5"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
        />
        <path
          d="M0,15 L10,14 L20,13 L30,11 L40,12 L50,10 L60,9 L70,8 L80,7 L90,6 L100,5 V20 H0 Z"
          fill="hsl(var(--primary) / 0.1)"
        />
      </svg>
    </div>
  )
}
