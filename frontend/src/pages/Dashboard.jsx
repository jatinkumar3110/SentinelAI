import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Target, Info } from 'lucide-react';

import MetricCard from '../components/MetricCard';
import UploadPanel from '../components/UploadPanel';
import RiskGauge from '../components/RiskGauge';
import LoadingOverlay from '../components/LoadingOverlay';
import InfoPanel from '../components/InfoPanel';

const Dashboard = () => {
  const [predictionResult, setPredictionResult] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showInfoPanel, setShowInfoPanel] = useState(false);

  // Called by UploadPanel
  const handlePredictionComplete = (result) => {
    setIsProcessing(false);

    // Backend returns: { label, confidence }
    setPredictionResult({
      label: result.label,
      confidence: result.confidence
    });
  };

  const confidenceValue = predictionResult?.confidence || 0;

  return (
    <div className="p-8 space-y-6 relative">

      {/* Loading Overlay */}
      <AnimatePresence>
        {isProcessing && (
          <LoadingOverlay message="Running ML Model..." />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-gray-400">SentinelAI Text Classification</p>
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

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MetricCard
          title="Prediction"
          value={predictionResult ? predictionResult.label : "N/A"}
          icon={Activity}
          color="blue"
        />

        <MetricCard
          title="Confidence"
          value={
            predictionResult
              ? (predictionResult.confidence * 100).toFixed(2) + "%"
              : "0%"
          }
          icon={Target}
          color="green"
        />
      </div>

      {/* Main Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Upload */}
        <UploadPanel
          onPredictionComplete={handlePredictionComplete}
          setIsProcessing={setIsProcessing}
        />

        {/* Result Panel */}
        {predictionResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-dark-card border border-dark-border rounded-xl p-6 flex flex-col items-center justify-center"
          >
            <h3 className="text-white text-lg font-semibold mb-4">
              Latest Result
            </h3>

            <RiskGauge
              value={confidenceValue}
              title="Model Confidence"
            />

            <div className="mt-6 space-y-2 text-center">
              <p className="text-gray-400">Prediction</p>
              <p className="text-white text-xl font-bold">
                {predictionResult.label}
              </p>

              <p className="text-gray-400 mt-2">Confidence</p>
              <p className="text-green-400 text-lg font-semibold">
                {(predictionResult.confidence * 100).toFixed(2)}%
              </p>
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
