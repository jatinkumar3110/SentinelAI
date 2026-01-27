import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';

const Heatmap = ({ data = [], title = "Anomaly Heat Map" }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const getColorForValue = (value) => {
    if (value < 0.3) return 'bg-green-500/20 border-green-500/40';
    if (value < 0.6) return 'bg-yellow-500/20 border-yellow-500/40';
    if (value < 0.85) return 'bg-orange-500/20 border-orange-500/40';
    return 'bg-red-500/20 border-red-500/40';
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="text-white text-lg font-semibold">{title}</h3>
        <div className="relative">
          <Info 
            className="w-4 h-4 text-gray-500 cursor-help" 
            onMouseEnter={() => setShowTooltip(true)}
            onMouseLeave={() => setShowTooltip(false)}
          />
          {showTooltip && (
            <div className="absolute left-0 top-6 z-50 w-72 p-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl text-xs text-gray-300">
              <p className="font-semibold text-white mb-2">📊 Anomaly Detection Heatmap</p>
              <p className="mb-2">Each cell represents anomaly risk score for a time period. Color intensity indicates severity:</p>
              <ul className="space-y-1 mb-2">
                <li>• <span className="text-green-400">Green (&lt;0.3)</span>: Normal operation</li>
                <li>• <span className="text-yellow-400">Yellow (0.3-0.6)</span>: Minor anomalies</li>
                <li>• <span className="text-orange-400">Orange (0.6-0.85)</span>: Moderate risk</li>
                <li>• <span className="text-red-400">Red (≥0.85)</span>: Critical anomaly</li>
              </ul>
              <p className="text-gray-400 text-xs">💡 Hover over cells to see exact risk scores.</p>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-10 gap-2">
        {data.map((value, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.01 }}
            className={`h-12 rounded border ${getColorForValue(value)} flex items-center justify-center text-xs text-white font-medium`}
            title={`Value: ${value.toFixed(2)}`}
          >
            {value.toFixed(1)}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;
