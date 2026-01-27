import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, AlertTriangle, TrendingUp, Clock, Zap, Target, Info } from 'lucide-react';
import MetricCard from '../components/MetricCard';
import LineChart from '../components/LineChart';
import Heatmap from '../components/Heatmap';
import UploadPanel from '../components/UploadPanel';
import RiskGauge from '../components/RiskGauge';
import DonutChart from '../components/DonutChart';
import AnomalyTable from '../components/AnomalyTable';
import LoadingOverlay from '../components/LoadingOverlay';
import InfoPanel from '../components/InfoPanel';

const Dashboard = () => {
  const [predictionResult, setPredictionResult] = useState(null);
  const [historicalData, setHistoricalData] = useState([]);
  const [heatmapData, setHeatmapData] = useState([]);
  const [riskBreakdown, setRiskBreakdown] = useState([]);
  const [anomalyRecords, setAnomalyRecords] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  useEffect(() => {
    const mockData = Array.from({ length: 20 }, (_, i) => ({
      timestamp: `${i}:00`,
      risk_score: Math.random() * 0.8,
      anomaly_score: Math.random() * 0.6
    }));
    setHistoricalData(mockData);

    const mockHeatmap = Array.from({ length: 50 }, () => Math.random());
    setHeatmapData(mockHeatmap);
  }, []);

  const handlePredictionComplete = (result) => {
    setIsProcessing(false);
    setPredictionResult(result);
    
    const newDataPoint = {
      timestamp: new Date().toLocaleTimeString(),
      risk_score: result.final_risk_score,
      anomaly_score: result.anomaly_score
    };
    setHistoricalData(prev => [...prev.slice(-19), newDataPoint]);
    
    setRiskBreakdown([
      { name: 'Time-Series', value: result.anomaly_score },
      { name: 'Tabular', value: result.failure_probability },
      { name: 'Logs', value: result.log_risk }
    ]);
    
    const severity = result.alert?.severity || 'LOW';
    const newRecord = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      risk_score: result.final_risk_score,
      anomaly_score: result.anomaly_score,
      failure_probability: result.failure_probability,
      log_risk: result.log_risk,
      severity: severity,
      root_cause: result.root_cause?.primary_cause || 'Unknown',
      explanation: result.explanation_values
    };
    setAnomalyRecords(prev => [...prev.slice(-9), newRecord]);
  };

  const currentRisk = predictionResult?.final_risk_score || 0;

  return (
    <div className="p-8 space-y-6 relative">
      <AnimatePresence>
        {isProcessing && (
          <LoadingOverlay message="Running ML Models..." />
        )}
      </AnimatePresence>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Real-time anomaly detection and risk monitoring</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInfoPanel(true)}
            className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/30 transition-all duration-200 hover:border-blue-500/50"
          >
            <Info className="w-5 h-5" />
            <span className="text-sm font-medium">About SENTINELAI</span>
          </button>
          <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">System Operational</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        <MetricCard
          title="Final Risk Score"
          value={predictionResult ? predictionResult.final_risk_score.toFixed(3) : '0.000'}
          change={predictionResult ? 12 : 0}
          icon={Activity}
          color="blue"
        />
        <MetricCard
          title="Anomaly Score"
          value={predictionResult ? predictionResult.anomaly_score.toFixed(3) : '0.000'}
          change={predictionResult ? -5 : 0}
          icon={TrendingUp}
          color="yellow"
        />
        <MetricCard
          title="Failure Probability"
          value={predictionResult ? predictionResult.failure_probability.toFixed(3) : '0.000'}
          change={predictionResult ? 8 : 0}
          icon={AlertTriangle}
          color="red"
        />
        <MetricCard
          title="Inference Latency"
          value={predictionResult ? `${predictionResult.inference_latency_ms.toFixed(1)}ms` : '0ms'}
          change={predictionResult ? -2 : 0}
          icon={Clock}
          color="green"
        />
        <MetricCard
          title="Drift Detected"
          value={predictionResult?.drift_detected ? 'YES' : 'NO'}
          icon={Zap}
          color={predictionResult?.drift_detected ? 'red' : 'green'}
        />
        <MetricCard
          title="Alert Status"
          value={predictionResult?.alert?.severity || 'NONE'}
          icon={Target}
          color={predictionResult?.alert_triggered ? 'red' : 'blue'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <LineChart
            data={historicalData}
            dataKey="risk_score"
            title="Risk Score Over Time"
            color="#3b82f6"
          />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-dark-card border border-dark-border rounded-xl p-8 flex items-center justify-center">
              <RiskGauge 
                value={predictionResult?.final_risk_score || 0}
                title="Current Risk Level"
              />
            </div>
            {riskBreakdown.length > 0 && (
              <div className="bg-dark-card border border-dark-border rounded-xl p-8 flex items-center justify-center">
                <DonutChart 
                  data={riskBreakdown}
                  title="Risk Breakdown"
                />
              </div>
            )}
          </div>
          
          <Heatmap
            data={heatmapData}
            title="Anomaly Heat Map - Pattern Visualization"
          />
          
          <AnomalyTable data={anomalyRecords} />
        </div>

        <div className="space-y-6">
          <UploadPanel 
            onPredictionComplete={handlePredictionComplete}
          />

          {predictionResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-dark-card border border-dark-border rounded-xl p-6"
            >
              <h3 className="text-white text-lg font-semibold mb-4">Latest Result</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Alert Severity</span>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    predictionResult.alert?.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-500' :
                    predictionResult.alert?.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-500' :
                    predictionResult.alert?.severity === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-500' :
                    'bg-green-500/20 text-green-500'
                  }`}>
                    {predictionResult.alert?.severity || 'LOW'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400 text-sm">Log Risk</span>
                  <span className="text-white font-medium">{predictionResult.log_risk.toFixed(3)}</span>
                </div>
                {predictionResult.root_cause && (
                  <div className="mt-4 p-3 bg-dark-bg rounded-lg">
                    <span className="text-gray-400 text-xs block mb-1">Root Cause</span>
                    <span className="text-white text-sm">{predictionResult.root_cause.primary_cause}</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}
          
          {predictionResult?.alert && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-500/30 rounded-xl p-4"
            >
              <h4 className="text-red-400 font-semibold mb-2">⚠️ Alert Triggered</h4>
              <p className="text-gray-300 text-sm">{predictionResult.alert.message}</p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Info Panel */}
      <InfoPanel isOpen={showInfoPanel} onClose={() => setShowInfoPanel(false)} />
    </div>
  );
};

export default Dashboard;
