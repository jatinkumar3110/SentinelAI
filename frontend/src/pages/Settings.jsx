import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Save, RotateCcw, Sliders } from 'lucide-react';

const Settings = () => {
  const [config, setConfig] = useState({
    // Risk Fusion Weights
    timeseriesWeight: 0.4,
    tabularWeight: 0.35,
    logsWeight: 0.25,
    
    // Alert Thresholds
    criticalThreshold: 0.85,
    highThreshold: 0.70,
    mediumThreshold: 0.50,
    lowThreshold: 0.30,
    
    // Model Configuration
    enableEnsemble: true,
    enableDriftDetection: true,
    driftSensitivity: 0.05,
    
    // Performance
    maxHistoryRecords: 1000,
    refreshInterval: 5000,
  });

  const handleChange = (key, value) => {
    setConfig(prev => ({ ...prev, [key]: parseFloat(value) || value }));
  };

  const handleSave = () => {
    localStorage.setItem('sentinelai_config', JSON.stringify(config));
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to defaults?')) {
      const defaults = {
        timeseriesWeight: 0.4,
        tabularWeight: 0.35,
        logsWeight: 0.25,
        criticalThreshold: 0.85,
        highThreshold: 0.70,
        mediumThreshold: 0.50,
        lowThreshold: 0.30,
        enableEnsemble: true,
        enableDriftDetection: true,
        driftSensitivity: 0.05,
        maxHistoryRecords: 1000,
        refreshInterval: 5000,
      };
      setConfig(defaults);
      localStorage.setItem('sentinelai_config', JSON.stringify(defaults));
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Settings</h1>
          <p className="text-gray-400">Configure SENTINELAI detection parameters</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition"
          >
            <Save className="w-4 h-4" />
            Save Changes
          </button>
        </div>
      </div>

      {/* Risk Fusion Weights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-dark-card border border-dark-border rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-6">
          <Sliders className="w-5 h-5 text-primary-500" />
          <h2 className="text-xl font-semibold text-white">Risk Fusion Weights</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <label className="text-gray-300">Time-Series Weight</label>
              <span className="text-white font-medium">{config.timeseriesWeight.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.timeseriesWeight}
              onChange={(e) => handleChange('timeseriesWeight', e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-gray-300">Tabular Weight</label>
              <span className="text-white font-medium">{config.tabularWeight.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.tabularWeight}
              onChange={(e) => handleChange('tabularWeight', e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-gray-300">Logs Weight</label>
              <span className="text-white font-medium">{config.logsWeight.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={config.logsWeight}
              onChange={(e) => handleChange('logsWeight', e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
          </div>

          <div className="pt-2 border-t border-gray-700">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Total Weight Sum:</span>
              <span className={`font-bold ${
                Math.abs((config.timeseriesWeight + config.tabularWeight + config.logsWeight) - 1.0) < 0.01
                  ? 'text-green-500'
                  : 'text-red-500'
              }`}>
                {(config.timeseriesWeight + config.tabularWeight + config.logsWeight).toFixed(2)}
              </span>
            </div>
            {Math.abs((config.timeseriesWeight + config.tabularWeight + config.logsWeight) - 1.0) >= 0.01 && (
              <p className="text-red-500 text-xs mt-1">⚠ Weights should sum to 1.0</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Alert Thresholds */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-dark-card border border-dark-border rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Alert Thresholds</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-300 block mb-2">Critical (≥)</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={config.criticalThreshold}
              onChange={(e) => handleChange('criticalThreshold', e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-2">High (≥)</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={config.highThreshold}
              onChange={(e) => handleChange('highThreshold', e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-2">Medium (≥)</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={config.mediumThreshold}
              onChange={(e) => handleChange('mediumThreshold', e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-2">Low (≥)</label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={config.lowThreshold}
              onChange={(e) => handleChange('lowThreshold', e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </motion.div>

      {/* Model Configuration */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-dark-card border border-dark-border rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Model Configuration</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-gray-300 font-medium">Enable Ensemble Models</label>
              <p className="text-gray-500 text-sm">Use LSTM + GRU ensemble for better accuracy</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableEnsemble}
                onChange={(e) => handleChange('enableEnsemble', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <label className="text-gray-300 font-medium">Enable Drift Detection</label>
              <p className="text-gray-500 text-sm">Monitor for concept drift using ADWIN</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={config.enableDriftDetection}
                onChange={(e) => handleChange('enableDriftDetection', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
            </label>
          </div>

          <div>
            <div className="flex justify-between mb-2">
              <label className="text-gray-300">Drift Sensitivity (Delta)</label>
              <span className="text-white font-medium">{config.driftSensitivity}</span>
            </div>
            <input
              type="range"
              min="0.01"
              max="0.1"
              step="0.01"
              value={config.driftSensitivity}
              onChange={(e) => handleChange('driftSensitivity', e.target.value)}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-primary-500"
            />
            <p className="text-gray-500 text-xs mt-1">Lower values = more sensitive to drift</p>
          </div>
        </div>
      </motion.div>

      {/* Performance Settings */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-dark-card border border-dark-border rounded-xl p-6"
      >
        <h2 className="text-xl font-semibold text-white mb-6">Performance Settings</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-gray-300 block mb-2">Max History Records</label>
            <input
              type="number"
              min="100"
              max="10000"
              step="100"
              value={config.maxHistoryRecords}
              onChange={(e) => handleChange('maxHistoryRecords', e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            />
          </div>

          <div>
            <label className="text-gray-300 block mb-2">Refresh Interval (ms)</label>
            <input
              type="number"
              min="1000"
              max="60000"
              step="1000"
              value={config.refreshInterval}
              onChange={(e) => handleChange('refreshInterval', e.target.value)}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-primary-500"
            />
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Settings;
