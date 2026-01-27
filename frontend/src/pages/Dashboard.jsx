import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Target, Info, AlertTriangle, Zap } from 'lucide-react';

import MetricCard from '../components/MetricCard';
import UploadPanel from '../components/UploadPanel';
import RiskGauge from '../components/RiskGauge';
import DonutChart from '../components/DonutChart';
import LoadingOverlay from '../components/LoadingOverlay';
import InfoPanel from '../components/InfoPanel';

const Dashboard = () => {
  const [predictionResult, setPredictionResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  // Called by UploadPanel with multi-modal results
  const handlePredictionComplete = (result) => {
    setIsProcessing(false);

    // Backend returns: { anomaly_score, failure_probability, log_risk, final_risk_score, explanation_values, alert_triggered, inference_latency_ms }
    setPredictionResult(result);
  };

  const finalRisk = predictionResult?.final_risk_score || 0;
  const anomalyScore = predictionResult?.anomaly_score || 0;
  const failureProb = predictionResult?.failure_probability || 0;
  const logRisk = predictionResult?.log_risk || 0;
  const alertTriggered = predictionResult?.alert_triggered || false;
  const latency = predictionResult?.inference_latency_ms || 0;

  // Prepare donut chart data
  const donutData = predictionResult ? [
    { label: 'Anomaly Score', value: anomalyScore * 100, color: '#3b82f6' },
    { label: 'Failure Prob', value: failureProb * 100, color: '#f59e0b' },
    { label: 'Log Risk', value: logRisk * 100, color: '#ef4444' }
  ] : [];

  return (
    <div className="p-8 space-y-6 relative">

      {/* Loading Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <LoadingOverlay message="Running Multi-Modal Analysis..." />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">Multi-Modal Anomaly Detection</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowInfoPanel(true)}
            className="flex items-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 px-4 py-2 rounded-lg border border-blue-500/30"
          >
            <Info className="w-5 h-5" />
            About
          </button>

          <div className="flex items-center gap-2 bg-green-500/10 text-green-500 px-4 py-2 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            Online
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard
          title="Final Risk Score"
          value={`${(finalRisk * 100).toFixed(1)}%`}
          icon={AlertTriangle}
          color={finalRisk > 0.7 ? "red" : finalRisk > 0.4 ? "orange" : "green"}
        />

        <MetricCard
          title="Anomaly Score"
          value={`${(anomalyScore * 100).toFixed(1)}%`}
          icon={Activity}
          color="blue"
        />

        <MetricCard
          title="Failure Probability"
          value={`${(failureProb * 100).toFixed(1)}%`}
          icon={Target}
          color="orange"
        />

        <MetricCard
          title="Log Risk"
          value={`${(logRisk * 100).toFixed(1)}%`}
          icon={Zap}
          color="purple"
        />
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upload Panel */}
        <UploadPanel
          onPredictionComplete={handlePredictionComplete}
          setIsProcessing={setIsProcessing}
        />

        {/* Results Panel */}
        {predictionResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-card border border-dark-border rounded-xl p-6"
          >
            <h3 className="text-white text-lg font-semibold mb-4">
              Analysis Results
            </h3>

            {/* Risk Gauge */}
            <div className="mb-6">
              <RiskGauge
                value={finalRisk}
                title="Final Risk Score"
              />
            </div>

            {/* Donut Chart */}
            <div className="mb-6">
              <DonutChart
                data={donutData}
                title="Risk Breakdown"
              />
            </div>

            {/* Alert Status */}
            {alertTriggered && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400 font-semibold">ALERT TRIGGERED</span>
                </div>
                <p className="text-red-300 text-sm mt-1">
                  High risk detected - immediate attention required
                </p>
              </div>
            )}

            {/* Latency */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-400">Inference Latency</span>
              <span className="text-green-400 font-semibold">{latency.toFixed(1)} ms</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Info Panel */}
      <InfoPanel
        isOpen={showInfoPanel}
        onClose={() => setShowInfoPanel(false)}
      />

    </div>
  );
};

export default Dashboard;
