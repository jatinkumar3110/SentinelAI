import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Server, Cpu, Activity, Zap, Database, AlertCircle } from 'lucide-react';
import { getSystemHealth } from '../api/client';

const SystemInfo = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemHealth();
    const interval = setInterval(fetchSystemHealth, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const data = await getSystemHealth();
      setSystemHealth(data);
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">System Information</h1>
        <p className="text-gray-400">Real-time system health and performance metrics</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-dark-card border border-dark-border rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-green-500/10 rounded-lg">
              <Server className="w-6 h-6 text-green-500" />
            </div>
            <span className="px-3 py-1 bg-green-500/20 text-green-500 text-xs rounded-full font-semibold">
              {systemHealth?.status?.toUpperCase()}
            </span>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">System Status</h3>
          <p className="text-gray-400 text-sm">All services operational</p>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Uptime</span>
              <span className="text-white font-medium">{systemHealth?.uptime_percentage}%</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-dark-card border border-dark-border rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-blue-500/10 rounded-lg">
              <Cpu className="w-6 h-6 text-blue-500" />
            </div>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">ML Models</h3>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">LSTM</span>
              <span className={systemHealth?.models?.lstm_loaded ? 'text-green-500' : 'text-red-500'}>
                {systemHealth?.models?.lstm_loaded ? '✓ Loaded' : '✗ Not Loaded'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">GRU</span>
              <span className={systemHealth?.models?.gru_loaded ? 'text-green-500' : 'text-yellow-500'}>
                {systemHealth?.models?.gru_loaded ? '✓ Loaded' : '○ Optional'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">XGBoost</span>
              <span className={systemHealth?.models?.xgboost_loaded ? 'text-green-500' : 'text-red-500'}>
                {systemHealth?.models?.xgboost_loaded ? '✓ Loaded' : '✗ Not Loaded'}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">BERT</span>
              <span className={systemHealth?.models?.bert_loaded ? 'text-green-500' : 'text-red-500'}>
                {systemHealth?.models?.bert_loaded ? '✓ Loaded' : '✗ Not Loaded'}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-dark-card border border-dark-border rounded-xl p-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="p-3 bg-purple-500/10 rounded-lg">
              <Activity className="w-6 h-6 text-purple-500" />
            </div>
          </div>
          <h3 className="text-white text-lg font-semibold mb-2">Performance</h3>
          <div className="space-y-2 mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Throughput</span>
              <span className="text-white font-medium">
                {systemHealth?.performance?.throughput_per_sec?.toFixed(2)} req/s
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">Avg Latency</span>
              <span className="text-white font-medium">
                {systemHealth?.performance?.avg_latency_ms?.toFixed(1)} ms
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-400">P95 Latency</span>
              <span className="text-white font-medium">
                {systemHealth?.performance?.p95_latency_ms?.toFixed(1)} ms
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-dark-card border border-dark-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-5 h-5 text-yellow-500" />
            <h3 className="text-white text-lg font-semibold">Drift Detection</h3>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Drift Events</span>
              <span className="text-white font-bold">
                {systemHealth?.drift_status?.total_events || 0}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Active Drifts</span>
              <span className={`font-bold ${systemHealth?.drift_status?.active_drifts > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {systemHealth?.drift_status?.active_drifts || 0}
              </span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-dark-card border border-dark-border rounded-xl p-6"
        >
          <div className="flex items-center gap-3 mb-4">
            <AlertCircle className="w-5 h-5 text-red-500" />
            <h3 className="text-white text-lg font-semibold">Alert Summary</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-2xl font-bold text-red-500">
                {systemHealth?.alert_summary?.by_severity?.CRITICAL || 0}
              </div>
              <div className="text-xs text-gray-500">Critical</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-orange-500">
                {systemHealth?.alert_summary?.by_severity?.HIGH || 0}
              </div>
              <div className="text-xs text-gray-500">High</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-500">
                {systemHealth?.alert_summary?.by_severity?.MEDIUM || 0}
              </div>
              <div className="text-xs text-gray-500">Medium</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">
                {systemHealth?.alert_summary?.by_severity?.LOW || 0}
              </div>
              <div className="text-xs text-gray-500">Low</div>
            </div>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-dark-card border border-dark-border rounded-xl p-6"
      >
        <div className="flex items-center gap-3 mb-4">
          <Database className="w-5 h-5 text-blue-500" />
          <h3 className="text-white text-lg font-semibold">System Configuration</h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-gray-500 block mb-1">Version</span>
            <span className="text-white font-medium">1.0.0</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Environment</span>
            <span className="text-white font-medium">Production</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">Time Window</span>
            <span className="text-white font-medium">50 samples</span>
          </div>
          <div>
            <span className="text-gray-500 block mb-1">API Status</span>
            <span className="text-green-500 font-medium">● Online</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default SystemInfo;
