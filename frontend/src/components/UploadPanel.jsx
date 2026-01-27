import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, Loader, Sparkles } from 'lucide-react';
import { predictAnomaly } from '../api/client';

// Predefined sample datasets
const SAMPLE_DATA = {
  sample1: {
    name: "Normal Operation (Low Risk)",
    timeseries: Array.from({ length: 50 }, (_, i) => 0.1 + Math.sin(i * 0.1) * 0.05).join(', '),
    tabular: { temperature: 72, pressure: 95, vibration: 0.3, rotation_speed: 1450, power_consumption: 230, operating_hours: 3000 },
    logs: "System operating normally. All parameters within acceptable range."
  },
  sample2: {
    name: "Minor Anomaly (Medium Risk)",
    timeseries: Array.from({ length: 50 }, (_, i) => 0.3 + Math.sin(i * 0.15) * 0.1 + (i > 30 ? 0.2 : 0)).join(', '),
    tabular: { temperature: 85, pressure: 115, vibration: 0.7, rotation_speed: 1650, power_consumption: 290, operating_hours: 7500 },
    logs: "Warning: Temperature slightly elevated. Vibration detected in bearing assembly."
  },
  sample3: {
    name: "Critical Failure (High Risk)",
    timeseries: Array.from({ length: 50 }, (_, i) => 0.6 + Math.sin(i * 0.2) * 0.15 + (i > 25 ? 0.3 : 0)).join(', '),
    tabular: { temperature: 105, pressure: 145, vibration: 1.5, rotation_speed: 1850, power_consumption: 380, operating_hours: 12000 },
    logs: "CRITICAL ERROR: Severe overheating detected. Abnormal vibration patterns. Immediate maintenance required!"
  },
  sample4: {
    name: "Mixed Signals (Variable)",
    timeseries: Array.from({ length: 50 }, (_, i) => 0.4 + Math.random() * 0.3).join(', '),
    tabular: { temperature: 90, pressure: 125, vibration: 1.0, rotation_speed: 1720, power_consumption: 310, operating_hours: 9200 },
    logs: "Intermittent warnings. Power fluctuations observed. Pressure spikes detected periodically."
  },
  sample5: {
    name: "Gradual Degradation",
    timeseries: Array.from({ length: 50 }, (_, i) => 0.2 + (i / 50) * 0.5 + Math.sin(i * 0.12) * 0.08).join(', '),
    tabular: { temperature: 95, pressure: 132, vibration: 1.2, rotation_speed: 1780, power_consumption: 340, operating_hours: 10500 },
    logs: "Progressive performance decline noted. Efficiency dropping over time. Maintenance cycle approaching."
  }
};

const UploadPanel = ({ onPredictionComplete }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [timeseriesInput, setTimeseriesInput] = useState('');
  const [tabularInput, setTabularInput] = useState({
    temperature: 75,
    pressure: 100,
    vibration: 0.5,
    rotation_speed: 1500,
    power_consumption: 250,
    operating_hours: 5000
  });
  const [logInput, setLogInput] = useState('');

  const loadSample = (sampleKey) => {
    const sample = SAMPLE_DATA[sampleKey];
    setTimeseriesInput(sample.timeseries);
    setTabularInput(sample.tabular);
    setLogInput(sample.logs);
    setError(null);
    setSuccess(false);
  };

  const handlePredict = async () => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const payload = {};

      if (timeseriesInput.trim()) {
        let values = timeseriesInput.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
        
        if (values.length > 0) {
          // Pad or truncate to exactly 50 values
          if (values.length < 50) {
            // Pad with the mean value
            const mean = values.reduce((a, b) => a + b, 0) / values.length;
            while (values.length < 50) {
              values.push(mean);
            }
          } else if (values.length > 50) {
            // Take the last 50 values
            values = values.slice(-50);
          }
          payload.timeseries = { values };
        }
      }

      if (Object.keys(tabularInput).length > 0) {
        payload.tabular = tabularInput;
      }

      if (logInput.trim()) {
        payload.logs = { text: logInput };
      }

      // Validate that at least one input is provided
      if (!payload.timeseries && !payload.tabular && !payload.logs) {
        throw new Error('Please provide at least one type of input data (time-series, tabular, or logs).');
      }

      const result = await predictAnomaly(payload);
      onPredictionComplete(result);
      setError(null);
      setSuccess(true);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Prediction failed:', error);
      const errorMessage = error.message || 'Prediction failed. Please check your inputs and try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <h3 className="text-white text-lg font-semibold mb-4 flex items-center gap-2">
        <Upload className="w-5 h-5" />
        Input Data
      </h3>

      {/* Sample Data Selection */}
      <div className="mb-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-semibold text-blue-400">Load Sample Data</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
          {Object.entries(SAMPLE_DATA).map(([key, sample]) => (
            <button
              key={key}
              onClick={() => loadSample(key)}
              className="bg-dark-bg hover:bg-gray-800 border border-dark-border hover:border-blue-500/50 rounded-lg p-3 text-left transition-all duration-200 group"
            >
              <div className="text-xs font-semibold text-white group-hover:text-blue-400 mb-1">
                {sample.name.split('(')[0].trim()}
              </div>
              <div className="text-xs text-gray-500 group-hover:text-gray-400">
                {sample.name.match(/\((.*?)\)/)?.[1] || 'Test'}
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="text-gray-400 text-sm mb-2 block">
            Time-Series Data (comma-separated)
            <span className="text-gray-500 text-xs ml-2">• Auto-pads to 50 values if fewer provided</span>
          </label>
          <textarea
            value={timeseriesInput}
            onChange={(e) => setTimeseriesInput(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500 resize-none"
            rows={3}
            placeholder="1.2, 1.5, 1.3, 1.8, 2.1, ... (need 50 values, will pad if less)"
          />
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Tabular Features</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.keys(tabularInput).map((key) => {
              const units = {
                temperature: '°F',
                pressure: 'PSI',
                vibration: 'm/s²',
                rotation_speed: 'RPM',
                power_consumption: 'W',
                operating_hours: 'hrs'
              };
              return (
              <div key={key}>
                <label className="text-xs text-gray-500 mb-1 block capitalize">
                  {key.replace('_', ' ')} {units[key] ? `(${units[key]})` : ''}
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={tabularInput[key]}
                  onChange={(e) => setTabularInput({ ...tabularInput, [key]: parseFloat(e.target.value) || 0 })}
                  className="w-full bg-dark-bg border border-dark-border rounded-lg p-2 text-white text-sm focus:outline-none focus:border-primary-500"
                  placeholder={key.replace('_', ' ')}
                />
              </div>
            )})}
          </div>
        </div>

        <div>
          <label className="text-gray-400 text-sm mb-2 block">Log Text</label>
          <textarea
            value={logInput}
            onChange={(e) => setLogInput(e.target.value)}
            className="w-full bg-dark-bg border border-dark-border rounded-lg p-3 text-white focus:outline-none focus:border-primary-500 resize-none"
            rows={3}
            placeholder="ERROR: Connection timeout at 192.168.1.1..."
          />
        </div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm"
          >
            <div className="flex items-start gap-2">
              <span className="text-red-500 mt-0.5">⚠</span>
              <div>
                <p className="font-semibold mb-1">Prediction Error</p>
                <p className="text-xs">{error}</p>
              </div>
            </div>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="p-3 bg-green-500/10 border border-green-500/50 rounded-lg text-green-400 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              <p className="font-semibold">Prediction completed successfully!</p>
            </div>
          </motion.div>
        )}

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handlePredict}
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="flex items-center gap-2">
                <Loader className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </div>
              <span className="text-xs text-gray-300">Running ML models (may take 5-10 seconds)</span>
            </>
          ) : (
            'Predict Anomaly'
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default UploadPanel;
