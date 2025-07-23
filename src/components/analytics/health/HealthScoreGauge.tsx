import { useState, useEffect } from "react";

interface HealthScoreGaugeProps {
  score: number;
  size?: number;
  thickness?: number;
  label?: string;
}

export const HealthScoreGauge = ({ 
  score, 
  size = 200, 
  thickness = 20,
  label = "Financial Health Score"
}: HealthScoreGaugeProps) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  
  // Animate the score on mount
  useEffect(() => {
    const duration = 1000; // Animation duration in ms
    const startTime = Date.now();
    
    const animateScore = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function for smoother animation
      const easeOutQuad = (t: number) => t * (2 - t);
      const easedProgress = easeOutQuad(progress);
      
      setAnimatedScore(Math.floor(easedProgress * score));
      
      if (progress < 1) {
        requestAnimationFrame(animateScore);
      }
    };
    
    requestAnimationFrame(animateScore);
  }, [score]);
  
  // Calculate gauge parameters
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const startAngle = -135;
  const endAngle = 135;
  const angleRange = endAngle - startAngle;
  const dashArray = `${circumference}`;
  const dashOffset = circumference * (1 - (animatedScore / 100) * (angleRange / 360));
  
  // Calculate coordinates for the gauge
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Calculate start and end points for the gauge arc
  const startRad = (startAngle * Math.PI) / 180;
  const startX = centerX + radius * Math.cos(startRad);
  const startY = centerY + radius * Math.sin(startRad);
  
  // Get color based on score
  const getScoreColor = (score: number) => {
    if (score >= 80) return "#22c55e"; // Green
    if (score >= 60) return "#84cc16"; // Lime
    if (score >= 40) return "#eab308"; // Yellow
    if (score >= 20) return "#f97316"; // Orange
    return "#ef4444"; // Red
  };
  
  // Get label based on score
  const getScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    if (score >= 50) return "Needs Improvement";
    return "Poor";
  };
  
  const scoreColor = getScoreColor(score);
  
  return (
    <div className="flex flex-col items-center">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Background track */}
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={thickness}
            strokeOpacity={0.1}
            strokeDasharray={dashArray}
            strokeDashoffset={circumference * ((360 - angleRange) / 360)}
            strokeLinecap="round"
          />
          
          {/* Foreground track */}
          <circle
            cx={centerX}
            cy={centerY}
            r={radius}
            fill="none"
            stroke={scoreColor}
            strokeWidth={thickness}
            strokeDasharray={dashArray}
            strokeDashoffset={dashOffset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 0.5s ease" }}
          />
        </svg>
        
        {/* Score display */}
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center"
          style={{ transform: "rotate(0deg)" }}
        >
          <span className="text-4xl font-bold">{animatedScore}</span>
          <span className="text-sm text-muted-foreground">{label}</span>
          <span 
            className="text-lg font-medium mt-1"
            style={{ color: scoreColor }}
          >
            {getScoreLabel(score)}
          </span>
        </div>
      </div>
      
      {/* Score legend */}
      <div className="flex justify-between w-full mt-4 px-4">
        <div className="text-center">
          <div className="h-2 w-2 rounded-full bg-red-500 mx-auto"></div>
          <span className="text-xs">Poor</span>
        </div>
        <div className="text-center">
          <div className="h-2 w-2 rounded-full bg-orange-500 mx-auto"></div>
          <span className="text-xs">Fair</span>
        </div>
        <div className="text-center">
          <div className="h-2 w-2 rounded-full bg-yellow-500 mx-auto"></div>
          <span className="text-xs">Good</span>
        </div>
        <div className="text-center">
          <div className="h-2 w-2 rounded-full bg-lime-500 mx-auto"></div>
          <span className="text-xs">Very Good</span>
        </div>
        <div className="text-center">
          <div className="h-2 w-2 rounded-full bg-green-500 mx-auto"></div>
          <span className="text-xs">Excellent</span>
        </div>
      </div>
    </div>
  );
};