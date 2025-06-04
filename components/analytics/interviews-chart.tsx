export function InterviewsChart() {
  return (
    <div className="w-full h-full">
      <svg width="100%" height="100%" viewBox="0 0 100 20">
        <path
          d="M0,18 L10,18 L20,18 L30,15 L40,15 L50,12 L60,12 L70,10 L80,10 L90,8 L100,5"
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="1.5"
        />
        <path
          d="M0,18 L10,18 L20,18 L30,15 L40,15 L50,12 L60,12 L70,10 L80,10 L90,8 L100,5 V20 H0 Z"
          fill="hsl(var(--primary) / 0.1)"
        />
      </svg>
    </div>
  )
}
