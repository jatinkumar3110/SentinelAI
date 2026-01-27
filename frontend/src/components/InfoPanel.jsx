import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Shield, Brain, Zap, TrendingUp, AlertTriangle, Target, Award } from 'lucide-react';

const InfoPanel = ({ isOpen, onClose }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
          
          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full md:w-[600px] bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-l border-gray-700 shadow-2xl z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-gray-900/95 backdrop-blur-md border-b border-gray-700 p-6 z-10">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-blue-500" />
                    <h2 className="text-2xl font-bold text-white">SENTINELAI</h2>
                  </div>
                  <p className="text-gray-400 text-sm">Multi-Modal Anomaly Detection & Risk Intelligence Platform</p>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-400" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              
              {/* Overview */}
              <section className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-3 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-blue-400" />
                  Platform Overview
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  SENTINELAI is an enterprise-grade AI-powered platform that combines multiple machine learning models 
                  to detect anomalies, predict failures, and assess risks in real-time. Using ensemble learning and 
                  advanced explainability techniques, it provides actionable insights for proactive decision-making.
                </p>
              </section>

              {/* AI Models */}
              <section className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  AI/ML Models
                </h3>
                <div className="space-y-4">
                  <div className="bg-gradient-to-r from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-blue-400">LSTM Autoencoder</h4>
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">ROC-AUC: 0.98</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Long Short-Term Memory network for time-series anomaly detection with sequence pattern recognition
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-purple-400">GRU Autoencoder</h4>
                      <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded">ROC-AUC: 0.9989</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Gated Recurrent Unit for efficient temporal pattern analysis with adaptive thresholding
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-orange-500/10 to-orange-500/5 border border-orange-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-orange-400">XGBoost Classifier</h4>
                      <span className="text-xs bg-orange-500/20 text-orange-300 px-2 py-1 rounded">ROC-AUC: 0.99+</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Gradient boosting for tabular failure prediction with SHAP explainability
                    </p>
                  </div>

                  <div className="bg-gradient-to-r from-green-500/10 to-green-500/5 border border-green-500/20 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-400">DistilBERT NLP</h4>
                      <span className="text-xs bg-green-500/20 text-green-300 px-2 py-1 rounded">Transformers</span>
                    </div>
                    <p className="text-gray-400 text-sm">
                      Natural Language Processing for log anomaly classification and semantic analysis
                    </p>
                  </div>
                </div>
              </section>

              {/* Key Features */}
              <section className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Key Features
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  <FeatureCard 
                    icon={<TrendingUp className="w-5 h-5" />}
                    title="Ensemble Learning"
                    description="Combines LSTM and GRU predictions through weighted averaging for superior accuracy"
                    color="blue"
                  />
                  <FeatureCard 
                    icon={<AlertTriangle className="w-5 h-5" />}
                    title="Drift Detection (ADWIN)"
                    description="Real-time concept drift monitoring using Adaptive Windowing algorithm (δ=0.05)"
                    color="orange"
                  />
                  <FeatureCard 
                    icon={<Target className="w-5 h-5" />}
                    title="Root Cause Analysis"
                    description="SHAP-powered feature importance ranking to identify failure drivers"
                    color="purple"
                  />
                  <FeatureCard 
                    icon={<Brain className="w-5 h-5" />}
                    title="Explainable AI"
                    description="SHAP values provide transparent model decisions and feature contributions"
                    color="green"
                  />
                  <FeatureCard 
                    icon={<Shield className="w-5 h-5" />}
                    title="4-Level Alert System"
                    description="Critical (≥0.85), High (≥0.70), Medium (≥0.50), Low (≥0.30) severity tiers"
                    color="red"
                  />
                </div>
              </section>

              {/* Performance Metrics */}
              <section className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <Award className="w-5 h-5 text-green-400" />
                  Performance Metrics
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <MetricCard label="ROC-AUC Score" value="0.99+" color="green" />
                  <MetricCard label="P95 Latency" value="<50ms" color="blue" />
                  <MetricCard label="Throughput" value="100+ req/s" color="purple" />
                  <MetricCard label="Model Accuracy" value="98%+" color="orange" />
                </div>
              </section>

              {/* Technology Stack */}
              <section className="bg-dark-card border border-dark-border rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-4">Technology Stack</h3>
                <div className="space-y-3">
                  <TechItem label="Backend" items={["FastAPI 0.109.0", "PyTorch 2.1.2", "XGBoost 2.0.3", "Transformers 4.37.2"]} />
                  <TechItem label="Frontend" items={["React 18", "Vite 5.4.21", "TailwindCSS 3.4.1", "Recharts 2.10.3"]} />
                  <TechItem label="APIs" items={["REST Endpoints", "WebSocket Streaming", "OpenAPI Docs"]} />
                  <TechItem label="Database" items={["SQLAlchemy ORM", "PostgreSQL Ready", "Alert Management"]} />
                </div>
              </section>

              {/* Architecture */}
              <section className="bg-gradient-to-br from-indigo-500/10 to-blue-500/10 border border-indigo-500/20 rounded-xl p-6">
                <h3 className="text-xl font-bold text-white mb-3">Architecture Highlights</h3>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span><strong>Multi-Modal Processing:</strong> Simultaneously analyzes time-series, tabular, and text data</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span><strong>Adaptive Thresholding:</strong> Dynamic risk score calculation based on rolling statistics</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span><strong>Real-time Streaming:</strong> WebSocket support for live metric updates</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-indigo-400 mt-1">•</span>
                    <span><strong>Scalable Design:</strong> Stateless API design ready for horizontal scaling</span>
                  </li>
                </ul>
              </section>

            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

// Helper Components
const FeatureCard = ({ icon, title, description, color }) => {
  const colorClasses = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    orange: 'bg-orange-500/10 border-orange-500/20 text-orange-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    green: 'bg-green-500/10 border-green-500/20 text-green-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400'
  };

  return (
    <div className={`${colorClasses[color]} border rounded-lg p-3`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5">{icon}</div>
        <div className="flex-1">
          <h4 className="font-semibold text-white text-sm mb-1">{title}</h4>
          <p className="text-gray-400 text-xs">{description}</p>
        </div>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, color }) => {
  const colorClasses = {
    green: 'text-green-400 border-green-500/30',
    blue: 'text-blue-400 border-blue-500/30',
    purple: 'text-purple-400 border-purple-500/30',
    orange: 'text-orange-400 border-orange-500/30'
  };

  return (
    <div className={`border ${colorClasses[color]} rounded-lg p-3 text-center`}>
      <div className={`text-2xl font-bold ${colorClasses[color].split(' ')[0]} mb-1`}>
        {value}
      </div>
      <div className="text-gray-400 text-xs">{label}</div>
    </div>
  );
};

const TechItem = ({ label, items }) => {
  return (
    <div>
      <h4 className="text-sm font-semibold text-gray-400 mb-2">{label}</h4>
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <span key={idx} className="text-xs bg-gray-800 text-gray-300 px-3 py-1 rounded-full border border-gray-700">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
};

export default InfoPanel;
