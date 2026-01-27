import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Download } from 'lucide-react';
import { getHistory } from '../api/client';

const History = () => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await getHistory(100, 0);
      setRecords(data.records);
    } catch (error) {
      console.error('Failed to fetch history:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (score) => {
    if (score < 0.3) return 'text-green-500';
    if (score < 0.6) return 'text-yellow-500';
    if (score < 0.85) return 'text-orange-500';
    return 'text-red-500';
  };

  const filteredRecords = records.filter(record =>
    record.id.toString().includes(searchTerm)
  );

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">History</h1>
          <p className="text-gray-400">Browse historical anomaly detection records</p>
        </div>
        <button className="flex items-center gap-2 bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="bg-dark-card border border-dark-border rounded-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-dark-bg border border-dark-border rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-primary-500"
            />
          </div>
          <button className="flex items-center gap-2 bg-dark-bg border border-dark-border hover:bg-dark-hover text-white px-4 py-2 rounded-lg transition-colors">
            <Filter className="w-4 h-4" />
            Filter
          </button>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
            <p className="text-gray-400 mt-4">Loading history...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">ID</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Timestamp</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Risk Score</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Anomaly</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Failure Prob</th>
                  <th className="text-left py-3 px-4 text-gray-400 font-medium text-sm">Alert</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map((record, index) => (
                  <motion.tr
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-dark-border hover:bg-dark-hover transition-colors"
                  >
                    <td className="py-3 px-4 text-white font-mono text-sm">#{record.id}</td>
                    <td className="py-3 px-4 text-gray-400 text-sm">
                      {new Date(record.timestamp).toLocaleString()}
                    </td>
                    <td className={`py-3 px-4 font-bold text-sm ${getRiskColor(record.final_risk_score)}`}>
                      {record.final_risk_score.toFixed(3)}
                    </td>
                    <td className="py-3 px-4 text-white text-sm">{record.anomaly_score.toFixed(3)}</td>
                    <td className="py-3 px-4 text-white text-sm">{record.failure_probability.toFixed(3)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        record.alert_triggered
                          ? 'bg-red-500/20 text-red-500'
                          : 'bg-gray-500/20 text-gray-400'
                      }`}>
                        {record.alert_triggered ? 'YES' : 'NO'}
                      </span>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default History;
