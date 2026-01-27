import React from 'react';
import { motion } from 'framer-motion';

const RiskGauge = ({ value = 0, title = "Risk Score" }) => {
  const percentage = Math.min(value * 100, 100);
  const rotation = (percentage / 100) * 180 - 90;
  
  const getColor = () => {
    if (value < 0.3) return '#10b981';
    if (value < 0.6) return '#f59e0b';
    if (value < 0.85) return '#f97316';
    return '#ef4444';
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-white text-lg font-semibold mb-6 text-center">{title}</h3>
      <div className="relative w-full max-w-md mx-auto flex-1 flex flex-col justify-center">
        <div className="relative h-40 mb-2">
          <svg viewBox="0 0 200 120" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
            <path
              d="M 20 95 A 80 80 0 0 1 180 95"
              fill="none"
              stroke="#333"
              strokeWidth="20"
              strokeLinecap="round"
            />
            <motion.path
              d="M 20 95 A 80 80 0 0 1 180 95"
              fill="none"
              stroke={getColor()}
              strokeWidth="20"
              strokeLinecap="round"
              strokeDasharray={`${percentage * 2.51} 251`}
              initial={{ strokeDasharray: "0 251" }}
              animate={{ strokeDasharray: `${percentage * 2.51} 251` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <motion.line
              x1="100"
              y1="95"
              x2="100"
              y2="35"
              stroke={getColor()}
              strokeWidth="3"
              strokeLinecap="round"
              style={{ transformOrigin: '100px 95px' }}
              initial={{ rotate: -90 }}
              animate={{ rotate: rotation }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
            <circle cx="100" cy="95" r="5" fill={getColor()} />
          </svg>
        </div>
        <div className="text-center mt-2">
          <span className="text-5xl font-bold" style={{ color: getColor() }}>
            {(value * 100).toFixed(1)}%
          </span>
        </div>
      </div>
      <div className="flex justify-between mt-6 text-sm text-gray-500">
        <span>Low</span>
        <span>Medium</span>
        <span>High</span>
      </div>
    </div>
  );
};

export default RiskGauge;
