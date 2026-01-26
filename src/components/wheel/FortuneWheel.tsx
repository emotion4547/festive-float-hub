import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";

export interface WheelSegment {
  id: string;
  label: string;
  discount_type: string;
  discount_value: number;
  color: string;
  probability: number;
  prize_type: string;
  gift_product_id?: string | null;
}

interface FortuneWheelProps {
  segments: WheelSegment[];
  onSpinEnd: (segment: WheelSegment) => void;
  isSpinning: boolean;
  setIsSpinning: (spinning: boolean) => void;
}

export function FortuneWheel({ segments, onSpinEnd, isSpinning, setIsSpinning }: FortuneWheelProps) {
  const [rotation, setRotation] = useState(0);
  const wheelRef = useRef<HTMLDivElement>(null);

  const spinWheel = () => {
    if (isSpinning || segments.length === 0) return;
    
    setIsSpinning(true);
    
    // Weighted random selection based on probability
    const totalWeight = segments.reduce((sum, s) => sum + s.probability, 0);
    let random = Math.random() * totalWeight;
    let selectedIndex = 0;
    
    for (let i = 0; i < segments.length; i++) {
      random -= segments[i].probability;
      if (random <= 0) {
        selectedIndex = i;
        break;
      }
    }
    
    const segmentAngle = 360 / segments.length;
    const targetAngle = 360 - (selectedIndex * segmentAngle) - (segmentAngle / 2);
    const spins = 5 + Math.floor(Math.random() * 3); // 5-7 full rotations
    const finalRotation = rotation + (spins * 360) + targetAngle + (Math.random() * 20 - 10);
    
    setRotation(finalRotation);
    
    setTimeout(() => {
      setIsSpinning(false);
      onSpinEnd(segments[selectedIndex]);
    }, 4000);
  };

  const segmentAngle = segments.length > 0 ? 360 / segments.length : 0;

  return (
    <div className="relative flex flex-col items-center">
      {/* Pointer */}
      <div className="absolute top-0 z-10 -translate-y-2">
        <div className="w-0 h-0 border-l-[15px] border-r-[15px] border-t-[25px] border-l-transparent border-r-transparent border-t-primary drop-shadow-lg" />
      </div>
      
      {/* Wheel */}
      <motion.div
        ref={wheelRef}
        className="relative w-72 h-72 rounded-full border-4 border-primary shadow-2xl overflow-hidden"
        animate={{ rotate: rotation }}
        transition={{ duration: 4, ease: [0.17, 0.67, 0.12, 0.99] }}
      >
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {segments.map((segment, index) => {
            const startAngle = index * segmentAngle - 90;
            const endAngle = startAngle + segmentAngle;
            
            const startRad = (startAngle * Math.PI) / 180;
            const endRad = (endAngle * Math.PI) / 180;
            
            const x1 = 50 + 50 * Math.cos(startRad);
            const y1 = 50 + 50 * Math.sin(startRad);
            const x2 = 50 + 50 * Math.cos(endRad);
            const y2 = 50 + 50 * Math.sin(endRad);
            
            const largeArc = segmentAngle > 180 ? 1 : 0;
            
            const midAngle = startAngle + segmentAngle / 2;
            const midRad = (midAngle * Math.PI) / 180;
            const textX = 50 + 32 * Math.cos(midRad);
            const textY = 50 + 32 * Math.sin(midRad);
            
            return (
              <g key={segment.id}>
                <path
                  d={`M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`}
                  fill={segment.color}
                  stroke="white"
                  strokeWidth="0.5"
                />
                <text
                  x={textX}
                  y={textY}
                  fill="white"
                  fontSize="6"
                  fontWeight="bold"
                  textAnchor="middle"
                  dominantBaseline="middle"
                  transform={`rotate(${midAngle + 90}, ${textX}, ${textY})`}
                  className="drop-shadow"
                >
                  {segment.label}
                </text>
              </g>
            );
          })}
        </svg>
        
        {/* Center circle */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 rounded-full bg-primary border-4 border-white shadow-lg" />
        </div>
      </motion.div>
      
      {/* Spin button */}
      <button
        onClick={spinWheel}
        disabled={isSpinning}
        className="mt-6 px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold text-lg shadow-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105"
      >
        {isSpinning ? "Крутится..." : "Крутить!"}
      </button>
    </div>
  );
}
