import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Bell, CheckCircle, XCircle } from 'lucide-react';

const Alerts = () => {
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      severity: 'critical',
      message: 'Critical anomaly detected in sensor array 3',
      timestamp: new Date().toISOString(),
      acknowledged: false
    },
    {
      id: 2,
      severity: 'high',
      message: 'High failure probability detected',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      acknowledged: false
    },
    {
      id: 3,
      severity: 'medium',
      message: 'Log anomaly pattern detected',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      acknowledged: true
    },
    {
      id: 4,
      severity: 'low',
      message: 'Minor deviation in time-series data',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      acknowledged: true
    }
  ]);

  const handleAcknowledge = (alertId) => {
    setAlerts(prevAlerts => 
      prevAlerts.map(alert => 
        alert.id === alertId ? { ...alert, acknowledged: true } : alert
      )
    );
  };

  const getSeverityColor = (severity) => {
    const colors = {
      critical: 'bg-red-500/10 border-red-500 text-red-500',
      high: 'bg-orange-500/10 border-orange-500 text-orange-500',
      medium: 'bg-yellow-500/10 border-yellow-500 text-yellow-500',
      low: 'bg-blue-500/10 border-blue-500 text-blue-500'
    };
    return colors[severity] || colors.low;
  };

  const getSeverityIcon = (severity) => {
    if (severity === 'critical' || severity === 'high') {
      return <XCircle className="w-5 h-5" />;
    }
    return <AlertTriangle className="w-5 h-5" />;
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Alerts</h1>
          <p className="text-gray-400">System alert management and monitoring</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-red-500/10 text-red-500 px-4 py-2 rounded-lg flex items-center gap-2">
            <Bell className="w-4 h-4" />
            <span className="text-sm font-medium">2 Active</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-red-500 mb-2">2</div>
            <div className="text-gray-400 text-sm">Critical</div>
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-orange-500 mb-2">0</div>
            <div className="text-gray-400 text-sm">High</div>
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-yellow-500 mb-2">1</div>
            <div className="text-gray-400 text-sm">Medium</div>
          </div>
        </div>
        <div className="bg-dark-card border border-dark-border rounded-xl p-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-500 mb-2">1</div>
            <div className="text-gray-400 text-sm">Low</div>
          </div>
        </div>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Recent Alerts</h3>
        <div className="space-y-3">
          {alerts.map((alert, index) => (
            <motion.div
              key={alert.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${getSeverityColor(alert.severity)} flex items-start gap-4`}
            >
              <div className="flex-shrink-0">
                {getSeverityIcon(alert.severity)}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold">{alert.message}</h4>
                  {alert.acknowledged && (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                </div>
                <p className="text-xs opacity-75">
                  {new Date(alert.timestamp).toLocaleString()}
                </p>
              </div>
              {!alert.acknowledged && (
                <button 
                  onClick={() => handleAcknowledge(alert.id)}
                  className="px-3 py-1 bg-primary-600 hover:bg-primary-700 rounded text-xs font-medium transition-colors"
                >
                  Acknowledge
                </button>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
