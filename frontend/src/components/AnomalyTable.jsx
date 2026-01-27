import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronRight } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

const AnomalyTable = ({ data = [] }) => {
  const [expandedRow, setExpandedRow] = useState(null);

  if (data.length === 0) {
    return (
      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <h3 className="text-white text-lg font-semibold mb-4">Anomaly Explorer</h3>
        <p className="text-gray-400 text-center py-8">No anomalies detected yet</p>
      </div>
    );
  }

  return (
    <div className="bg-dark-card border border-dark-border rounded-xl p-6">
      <h3 className="text-white text-lg font-semibold mb-4">Anomaly Explorer</h3>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-border">
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm w-10"></th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">ID</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Timestamp</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Risk Score</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Severity</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Root Cause</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <React.Fragment key={row.id || index}>
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-dark-border hover:bg-dark-hover cursor-pointer transition-colors"
                  onClick={() => setExpandedRow(expandedRow === index ? null : index)}
                >
                  <td className="py-3 px-4">
                    {expandedRow === index ? (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-400" />
                    )}
                  </td>
                  <td className="py-3 px-4 text-white font-mono text-sm">#{row.id}</td>
                  <td className="py-3 px-4 text-gray-400 text-sm">{row.timestamp}</td>
                  <td className="py-3 px-4 text-white font-bold text-sm">{row.risk_score?.toFixed(3)}</td>
                  <td className="py-3 px-4">
                    <SeverityBadge severity={row.severity} />
                  </td>
                  <td className="py-3 px-4 text-gray-400 text-sm truncate max-w-xs">
                    {row.root_cause || 'Unknown'}
                  </td>
                </motion.tr>
                <AnimatePresence>
                  {expandedRow === index && (
                    <motion.tr
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <td colSpan="6" className="bg-dark-bg">
                        <div className="p-4 space-y-2">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <span className="text-gray-500 text-sm">Anomaly Score:</span>
                              <span className="text-white ml-2">{row.anomaly_score?.toFixed(3)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-sm">Failure Prob:</span>
                              <span className="text-white ml-2">{row.failure_probability?.toFixed(3)}</span>
                            </div>
                            <div>
                              <span className="text-gray-500 text-sm">Log Risk:</span>
                              <span className="text-white ml-2">{row.log_risk?.toFixed(3)}</span>
                            </div>
                          </div>
                          {row.explanation && (
                            <div className="mt-3">
                              <span className="text-gray-500 text-sm">Explanation:</span>
                              <pre className="text-gray-300 text-xs mt-2 bg-dark-card p-2 rounded overflow-x-auto">
                                {JSON.stringify(row.explanation, null, 2)}
                              </pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  )}
                </AnimatePresence>
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnomalyTable;
